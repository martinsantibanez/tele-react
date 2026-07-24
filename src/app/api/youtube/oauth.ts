// Server-side YouTube OAuth helpers, shared by the /api/youtube/* route
// handlers. This is the durable half of the auth story, done statelessly (no
// KV, no DB): the browser never sees the client secret or the refresh token.
//
// The callback encrypts the refresh token (AES-GCM, key from env) and stores
// the ciphertext in an httpOnly cookie. /token decrypts it server-side and
// mints short-lived access tokens from Google on demand. So the durable
// credential lives only in the cookie, encrypted, unreadable by browser JS —
// and a connected user stays connected across reloads and past the 1h
// access-token lifetime with no re-auth prompt, without any server storage.
//
// NOTE: a refresh token only lives indefinitely once the OAuth consent screen
// is in "Production" publishing status. While it is in "Testing", Google
// expires refresh tokens after 7 days and /token starts returning 401 — which
// the client treats as "please connect again".

export const AUTH_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth';
export const TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';
export const REVOKE_ENDPOINT = 'https://oauth2.googleapis.com/revoke';
export const SCOPE = 'https://www.googleapis.com/auth/youtube.readonly';

export const CLIENT_ID = process.env.NEXT_PUBLIC_YOUTUBE_CLIENT_ID;
export const CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET;
// 32-byte key, base64 (e.g. `openssl rand -base64 32`), used to encrypt the
// refresh token at rest in the cookie.
const TOKEN_SECRET = process.env.YOUTUBE_TOKEN_SECRET;

/** Holds the AES-GCM-encrypted refresh token; httpOnly, so JS can't read it. */
export const REFRESH_COOKIE = 'yt_refresh';
export const STATE_COOKIE = 'yt_oauth_state';
export const VERIFIER_COOKIE = 'yt_oauth_verifier';
/** Where to send the user back to after the OAuth round-trip. */
export const RETURN_COOKIE = 'yt_oauth_return';

/**
 * Only allow same-origin relative paths as a return target, so the OAuth
 * redirect can't be turned into an open redirect. Rejects protocol-relative
 * (`//host`) and absolute URLs; falls back to `/`.
 */
export function safeReturnPath(value: string | undefined | null): string {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return '/';
  if (value.includes('\\')) return '/';
  return value;
}

/** Redirect URI Google calls back on; must be registered verbatim. */
export const redirectUri = (origin: string) =>
  `${origin}/api/youtube/callback`;

export function isConfigured() {
  return Boolean(CLIENT_ID && CLIENT_SECRET && TOKEN_SECRET);
}

const toBase64Url = (buf: ArrayBuffer | Uint8Array) =>
  Buffer.from(buf instanceof Uint8Array ? buf : new Uint8Array(buf))
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

const fromBase64Url = (value: string) =>
  new Uint8Array(Buffer.from(value, 'base64url'));

/** URL-safe random token for state / verifier. */
export function randomToken(bytes = 32) {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return toBase64Url(arr);
}

async function sha256Base64Url(value: string) {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(value)
  );
  return toBase64Url(digest);
}

export const codeChallenge = (verifier: string) => sha256Base64Url(verifier);

let cryptoKey: Promise<CryptoKey> | undefined;
function getKey() {
  if (!cryptoKey) {
    const raw = new Uint8Array(Buffer.from(TOKEN_SECRET || '', 'base64'));
    if (raw.length !== 32) {
      throw new Error(
        'YOUTUBE_TOKEN_SECRET must be 32 bytes, base64-encoded (openssl rand -base64 32)'
      );
    }
    cryptoKey = crypto.subtle.importKey('raw', raw, { name: 'AES-GCM' }, false, [
      'encrypt',
      'decrypt'
    ]);
  }
  return cryptoKey;
}

/** AES-GCM encrypt -> base64url(iv | ciphertext+tag). */
export async function encryptToken(plaintext: string): Promise<string> {
  const key = await getKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    new TextEncoder().encode(plaintext)
  );
  const packed = new Uint8Array(iv.length + ciphertext.byteLength);
  packed.set(iv, 0);
  packed.set(new Uint8Array(ciphertext), iv.length);
  return toBase64Url(packed);
}

async function decryptToken(value: string): Promise<string> {
  const key = await getKey();
  const packed = fromBase64Url(value);
  const iv = packed.slice(0, 12);
  const ciphertext = packed.slice(12);
  const plaintext = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext
  );
  return new TextDecoder().decode(plaintext);
}

/** Exchange an authorization code for tokens (confidential client + PKCE). */
export async function exchangeCode(
  code: string,
  verifier: string,
  origin: string
): Promise<{ accessToken: string; refreshToken?: string; expiresIn: number }> {
  const res = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: CLIENT_ID!,
      client_secret: CLIENT_SECRET!,
      code,
      code_verifier: verifier,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri(origin)
    }).toString()
  });
  const json = await res.json();
  if (!res.ok || !json.access_token) {
    throw new Error(json.error_description || json.error || 'exchange failed');
  }
  return {
    accessToken: json.access_token,
    refreshToken: json.refresh_token,
    expiresIn: json.expires_in ?? 3600
  };
}

/** Mint a fresh access token from a stored refresh token. */
async function refreshAccessToken(
  refreshToken: string
): Promise<{ accessToken: string; expiresIn: number }> {
  const res = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: CLIENT_ID!,
      client_secret: CLIENT_SECRET!,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    }).toString()
  });
  const json = await res.json();
  if (!res.ok || !json.access_token) {
    // invalid_grant here means the refresh token was revoked or expired.
    throw new Error(json.error || 'refresh failed');
  }
  return { accessToken: json.access_token, expiresIn: json.expires_in ?? 3600 };
}

/** Encrypt a refresh token for storage in the cookie. */
export const sealRefreshToken = (refreshToken: string) =>
  encryptToken(refreshToken);

/**
 * Given the encrypted-refresh-token cookie value, return a fresh access token.
 * Returns undefined when the cookie is unusable (tampered, or the refresh token
 * was revoked/expired) so the caller can answer 401.
 */
export async function getAccessTokenFromCookie(
  sealed: string
): Promise<{ accessToken: string; expiresIn: number } | undefined> {
  let refreshToken: string;
  try {
    refreshToken = await decryptToken(sealed);
  } catch {
    return undefined;
  }
  try {
    return await refreshAccessToken(refreshToken);
  } catch (err) {
    console.error('[youtube] refresh failed', err);
    return undefined;
  }
}

/** Best-effort revoke of the grant on Google's side, from the cookie value. */
export async function revokeFromCookie(sealed: string) {
  let refreshToken: string;
  try {
    refreshToken = await decryptToken(sealed);
  } catch {
    return;
  }
  try {
    await fetch(REVOKE_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ token: refreshToken }).toString()
    });
  } catch {
    /* ignore */
  }
}
