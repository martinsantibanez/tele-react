// Server-side Spotify OAuth helpers, shared by the /api/spotify/* route
// handlers. Same shape as the YouTube one next door, and for the same reasons:
// stateless (no KV, no DB), with the durable credential — the refresh token —
// encrypted at rest in an httpOnly cookie the browser cannot read. /token
// decrypts it server-side and mints short-lived access tokens on demand, so a
// connected user stays connected across reloads and past the 1h access-token
// lifetime without ever seeing a second consent screen.
//
// Two things differ from Google:
//
//   - No PKCE. Spotify documents PKCE as the flow for public clients that
//     cannot hold a secret; this is a server-side confidential client, so it
//     authenticates the token requests with HTTP Basic (client id + secret) as
//     the classic authorization-code flow prescribes. The `state` cookie is
//     what covers CSRF on the redirect.
//   - No revoke endpoint. Spotify does not publish one, so disconnecting can
//     only drop the cookie; the grant itself is withdrawn by the user from
//     spotify.com/account/apps. `logout` says as much.

export const AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize';
export const TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token';

/**
 * Two groups, and they are worth keeping apart.
 *
 * The first is the catalogue the picker lists: the user's playlists, their
 * saved albums and shows, the top artists the "para ti" rows are built from,
 * and the play history the recent row reads its playlist uris out of. All of it
 * read-only.
 *
 * The second is the player. `streaming` is what lets the Web Playback SDK
 * register this browser as a Spotify Connect device, and Spotify only issues it
 * together with `user-read-email` and `user-read-private` — the SDK's own
 * handshake reads the account to find out whether it is Premium, which is the
 * one thing deciding whether a device can exist at all. The two
 * `…-playback-state` scopes are the remote control: reading what is playing on
 * whichever device is active, and telling it what to play. Those are the only
 * write-ish grant in the list, and what they write is transport — play, pause,
 * skip, volume. Nothing here can alter a library or edit a playlist.
 *
 * Adding a scope does not reach accounts already connected: their refresh token
 * only ever mints the scopes it was issued with, so they go on 403-ing the new
 * call until they pass through the consent screen again. `SpotifyScopeError` is
 * how the client notices, and the picker asks them to reconnect.
 */
export const SCOPE = [
  'playlist-read-private',
  'playlist-read-collaborative',
  'user-library-read',
  'user-top-read',
  'user-read-recently-played',
  // The player: this browser as a device, and the Connect remote.
  'streaming',
  'user-read-email',
  'user-read-private',
  'user-read-playback-state',
  'user-modify-playback-state'
].join(' ');

export const CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
export const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
// 32-byte key, base64 (e.g. `openssl rand -base64 32`), used to encrypt the
// refresh token at rest in the cookie.
const TOKEN_SECRET = process.env.SPOTIFY_TOKEN_SECRET;

/** Holds the AES-GCM-encrypted refresh token; httpOnly, so JS can't read it. */
export const REFRESH_COOKIE = 'sp_refresh';
export const STATE_COOKIE = 'sp_oauth_state';
/** Where to send the user back to after the OAuth round-trip. */
export const RETURN_COOKIE = 'sp_oauth_return';

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

/**
 * Redirect URI Spotify calls back on; must be registered verbatim in the app's
 * dashboard. Note that since April 2025 Spotify only accepts https origins and
 * the IPv4/IPv6 loopback literals — `http://localhost:3333/...` is rejected at
 * registration time, so development runs against `http://127.0.0.1:3333` (the
 * port `.env` pins; the origin here follows whatever the request came in on).
 */
export const redirectUri = (origin: string) => `${origin}/api/spotify/callback`;

/**
 * The origin the browser actually asked on.
 *
 * Not `request.nextUrl.origin`: that is rebuilt from the dev server's own
 * binding and comes back as `http://localhost:3333` however you reached it, so
 * a user browsing `127.0.0.1` would be sent to Spotify with a redirect_uri
 * that is neither what they registered nor where their cookies live. Behind a
 * proxy — Vercel — the same reasoning points at the forwarded headers, which
 * are the only place the public origin survives.
 *
 * Both `/login` and `/callback` derive it this way, and they have to agree:
 * Spotify compares the redirect_uri on the token exchange against the one from
 * the authorize call, byte for byte.
 */
export function requestOrigin(request: {
  headers: Headers;
  nextUrl: { origin: string };
}): string {
  // Proxies append rather than replace, so the client-facing value is first.
  const first = (value: string | null) => value?.split(',')[0]?.trim();
  const host =
    first(request.headers.get('x-forwarded-host')) ??
    first(request.headers.get('host'));
  if (!host) return request.nextUrl.origin;
  const proto =
    first(request.headers.get('x-forwarded-proto')) ??
    (/^(127\.0\.0\.1|localhost|\[::1\])(:|$)/.test(host) ? 'http' : 'https');
  return `${proto}://${host}`;
}

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

/** URL-safe random token for the state parameter. */
export function randomToken(bytes = 32) {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return toBase64Url(arr);
}

let cryptoKey: Promise<CryptoKey> | undefined;
function getKey() {
  if (!cryptoKey) {
    const raw = new Uint8Array(Buffer.from(TOKEN_SECRET || '', 'base64'));
    if (raw.length !== 32) {
      throw new Error(
        'SPOTIFY_TOKEN_SECRET must be 32 bytes, base64-encoded (openssl rand -base64 32)'
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

/** `Basic base64(id:secret)`, how Spotify wants the token calls authenticated. */
const basicAuth = () =>
  `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`;

/**
 * A refused token call, carrying Spotify's own `error` code — which is the only
 * thing that says whether the grant is dead or the call merely failed.
 */
class TokenError extends Error {
  constructor(
    message: string,
    readonly code?: string
  ) {
    super(message);
    this.name = 'TokenError';
  }
}

async function tokenRequest(body: Record<string, string>) {
  const res = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: basicAuth()
    },
    body: new URLSearchParams(body).toString()
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.access_token) {
    throw new TokenError(
      json.error_description || json.error || `token endpoint ${res.status}`,
      json.error
    );
  }
  return json as {
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
  };
}

/** Exchange an authorization code for tokens. */
export async function exchangeCode(
  code: string,
  origin: string
): Promise<{ accessToken: string; refreshToken?: string; expiresIn: number }> {
  const json = await tokenRequest({
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri(origin)
  });
  return {
    accessToken: json.access_token,
    refreshToken: json.refresh_token,
    expiresIn: json.expires_in ?? 3600
  };
}

/** Encrypt a refresh token for storage in the cookie. */
export const sealRefreshToken = (refreshToken: string) =>
  encryptToken(refreshToken);

export type RefreshResult =
  | { ok: true; accessToken: string; expiresIn: number; sealed?: string }
  /**
   * `grantDead` is the difference between "this connection is over" and "ask me
   * again in a minute", and only the first may cost the user their cookie.
   */
  | { ok: false; grantDead: boolean };

/**
 * Given the encrypted-refresh-token cookie value, return a fresh access token.
 *
 * `sealed` comes back set only when Spotify handed over a *new* refresh token,
 * which it may do on any refresh: the old one stops working the moment it is
 * replaced, so the caller has to write the new ciphertext back to the cookie or
 * the connection dies at the next refresh.
 *
 * A refusal is not automatically the end of the connection. `invalid_grant` is
 * — the user withdrew the grant on their account page, or the token was already
 * rotated out from under this one — and so is a cookie that will not decrypt.
 * Everything else is Spotify or the network having a bad moment, and a
 * connection the user has to rebuild by hand is far too much to charge for
 * that: it stays, and the next call tries again.
 */
export async function getAccessTokenFromCookie(
  sealed: string
): Promise<RefreshResult> {
  let refreshToken: string;
  try {
    refreshToken = await decryptToken(sealed);
  } catch {
    // Not something a retry can mend: this cookie is not one of ours.
    return { ok: false, grantDead: true };
  }
  try {
    const json = await tokenRequest({
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    });
    return {
      ok: true,
      accessToken: json.access_token,
      expiresIn: json.expires_in ?? 3600,
      sealed: json.refresh_token
        ? await sealRefreshToken(json.refresh_token)
        : undefined
    };
  } catch (err) {
    console.error('[spotify] refresh failed', err);
    return {
      ok: false,
      grantDead: err instanceof TokenError && err.code === 'invalid_grant'
    };
  }
}
