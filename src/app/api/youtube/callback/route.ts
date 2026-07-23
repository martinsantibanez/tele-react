import { NextRequest, NextResponse } from 'next/server';
import {
  REFRESH_COOKIE,
  STATE_COOKIE,
  VERIFIER_COOKIE,
  exchangeCode,
  isConfigured,
  sealRefreshToken
} from '../oauth';

// Google redirects here with ?code. We validate the state/verifier cookies from
// /login, swap the code for tokens, encrypt the refresh token, and stash the
// ciphertext in an httpOnly cookie before bouncing back to the app. The access
// token is never persisted here — /token mints those from the sealed refresh
// token on demand. No server-side storage involved.
export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const home = new URL('/', origin);

  if (!isConfigured()) {
    home.searchParams.set('youtube', 'error');
    return NextResponse.redirect(home);
  }

  const code = request.nextUrl.searchParams.get('code');
  const state = request.nextUrl.searchParams.get('state');
  const expectedState = request.cookies.get(STATE_COOKIE)?.value;
  const verifier = request.cookies.get(VERIFIER_COOKIE)?.value;

  const clearOauthCookies = (res: NextResponse) => {
    res.cookies.delete(STATE_COOKIE);
    res.cookies.delete(VERIFIER_COOKIE);
    return res;
  };

  if (!code || !state || !verifier || state !== expectedState) {
    home.searchParams.set('youtube', 'error');
    return clearOauthCookies(NextResponse.redirect(home));
  }

  try {
    const { refreshToken } = await exchangeCode(code, verifier, origin);
    if (!refreshToken) {
      // No refresh token means Google didn't grant offline access (usually a
      // returning user without prompt=consent). Surface it rather than storing
      // a session that can't be refreshed.
      throw new Error('no refresh_token returned');
    }
    const sealed = await sealRefreshToken(refreshToken);

    home.searchParams.set('youtube', 'connected');
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
    console.error('[youtube] callback failed', err);
    home.searchParams.set('youtube', 'error');
    return clearOauthCookies(NextResponse.redirect(home));
  }
}
