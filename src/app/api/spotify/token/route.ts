import { NextRequest, NextResponse } from 'next/server';
import { REFRESH_COOKIE, getAccessTokenFromCookie } from '../oauth';

// The client calls this to get a usable access token: on load, and again
// whenever the one it holds is close to expiring or the Web API 401s. The
// encrypted refresh token in the cookie means this silently returns a fresh
// token with no user interaction. A missing or dead refresh token answers 401,
// which the UI reads as "connect again".
//
// Unlike Google's, Spotify's refresh may hand back a *replacement* refresh
// token, and the old one dies with it — so when it does, the new ciphertext is
// written straight back to the cookie here. That also rules out caching the
// response: a cached hit would skip the Set-Cookie and strand the client on a
// refresh token Spotify has already retired.
export async function GET(request: NextRequest) {
  const sealed = request.cookies.get(REFRESH_COOKIE)?.value;
  if (!sealed) {
    return NextResponse.json({ error: 'not connected' }, { status: 401 });
  }

  const result = await getAccessTokenFromCookie(sealed);
  if (!result.ok) {
    // A dead grant is the only thing worth disconnecting over, and the cookie
    // goes with it. A refusal Spotify might not repeat answers 503 instead: the
    // client reads that as "no token this time" and keeps the one it holds,
    // rather than as "you are logged out" — which it cannot undo without
    // sending the user back through the consent screen.
    if (!result.grantDead) {
      return NextResponse.json(
        { error: 'refresh failed' },
        { status: 503, headers: { 'Cache-Control': 'no-store' } }
      );
    }
    const res = NextResponse.json({ error: 'not connected' }, { status: 401 });
    res.cookies.delete(REFRESH_COOKIE);
    return res;
  }

  const res = NextResponse.json(
    { accessToken: result.accessToken, expiresIn: result.expiresIn },
    { headers: { 'Cache-Control': 'no-store' } }
  );
  if (result.sealed) {
    res.cookies.set(REFRESH_COOKIE, result.sealed, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 180
    });
  }
  return res;
}
