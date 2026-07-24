import { NextRequest, NextResponse } from 'next/server';
import { REFRESH_COOKIE, getAccessTokenFromCookie } from '../oauth';

// The client calls this to get a usable access token: on load, and again
// whenever the one it holds is close to expiring or the YouTube API 401s. The
// encrypted refresh token in the cookie means this silently returns a fresh
// token with no user interaction — that's what makes the connection durable. A
// missing or dead refresh token answers 401, which the UI reads as "connect
// again".
//
// Cached for the token's own lifetime so parallel/rapid callers share one mint.
export async function GET(request: NextRequest) {
  const sealed = request.cookies.get(REFRESH_COOKIE)?.value;
  if (!sealed) {
    return NextResponse.json({ error: 'not connected' }, { status: 401 });
  }

  const result = await getAccessTokenFromCookie(sealed);
  if (!result) {
    const res = NextResponse.json({ error: 'not connected' }, { status: 401 });
    res.cookies.delete(REFRESH_COOKIE);
    return res;
  }

  return NextResponse.json(
    { accessToken: result.accessToken, expiresIn: result.expiresIn },
    {
      headers: {
        'Cache-Control': `private, max-age=${Math.max(0, result.expiresIn - 60)}`
      }
    }
  );
}
