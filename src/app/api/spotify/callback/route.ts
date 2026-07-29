import { NextRequest, NextResponse } from 'next/server';
import {
  REFRESH_COOKIE,
  RETURN_COOKIE,
  STATE_COOKIE,
  exchangeCode,
  isConfigured,
  requestOrigin,
  safeReturnPath,
  sealRefreshToken
} from '../oauth';

// Spotify redirects here with ?code (or ?error=access_denied when the user says
// no). We check the state cookie from /login, swap the code for tokens, encrypt
// the refresh token and stash the ciphertext in an httpOnly cookie before
// bouncing back to the app. The access token is never persisted — /token mints
// those from the sealed refresh token on demand.
export async function GET(request: NextRequest) {
  // Same derivation as /login, and for a second reason here: the cookie set
  // below belongs to the host the browser is on, so bouncing them to a
  // different spelling of it would land them on a page that cannot see it.
  const origin = requestOrigin(request);
  // Return the user to wherever they launched the connect from (e.g. /monitor).
  const home = new URL(
    safeReturnPath(request.cookies.get(RETURN_COOKIE)?.value),
    origin
  );

  const clearOauthCookies = (res: NextResponse) => {
    res.cookies.delete(STATE_COOKIE);
    res.cookies.delete(RETURN_COOKIE);
    return res;
  };

  const fail = () => {
    home.searchParams.set('spotify', 'error');
    return clearOauthCookies(NextResponse.redirect(home));
  };

  if (!isConfigured()) return fail();

  const code = request.nextUrl.searchParams.get('code');
  const state = request.nextUrl.searchParams.get('state');
  const expectedState = request.cookies.get(STATE_COOKIE)?.value;

  if (!code || !state || !expectedState || state !== expectedState) {
    return fail();
  }

  try {
    const { refreshToken } = await exchangeCode(code, origin);
    if (!refreshToken) {
      // Spotify always returns one for this flow; without it the session could
      // not outlive the hour, so surface it rather than store a dead end.
      throw new Error('no refresh_token returned');
    }
    const sealed = await sealRefreshToken(refreshToken);

    home.searchParams.set('spotify', 'connected');
    const res = NextResponse.redirect(home);
    res.cookies.set(REFRESH_COOKIE, sealed, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      // ~180 days; the refresh token inside is the real source of truth.
      maxAge: 60 * 60 * 24 * 180
    });
    return clearOauthCookies(res);
  } catch (err) {
    console.error('[spotify] callback failed', err);
    return fail();
  }
}
