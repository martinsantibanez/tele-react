import { NextRequest, NextResponse } from 'next/server';
import {
  AUTH_ENDPOINT,
  CLIENT_ID,
  RETURN_COOKIE,
  SCOPE,
  STATE_COOKIE,
  isConfigured,
  randomToken,
  redirectUri,
  requestOrigin,
  safeReturnPath
} from '../oauth';

// Kicks off the OAuth dance. Spotify's authorization-code flow returns a
// refresh token by default — there is no `access_type=offline` to ask for, as
// with Google — so durability needs nothing beyond the grant itself. The state
// rides along in a short-lived httpOnly cookie and is checked in the callback.
//
// `show_dialog` is left off on purpose: a user who has already approved this app
// is bounced straight back, which is what makes reconnecting after a dropped
// cookie feel instant.
export async function GET(request: NextRequest) {
  if (!isConfigured()) {
    return NextResponse.json(
      { error: 'Spotify OAuth is not configured' },
      { status: 500 }
    );
  }

  const origin = requestOrigin(request);
  const state = randomToken(16);

  const params = new URLSearchParams({
    client_id: CLIENT_ID!,
    response_type: 'code',
    redirect_uri: redirectUri(origin),
    scope: SCOPE,
    state
  });

  const res = NextResponse.redirect(`${AUTH_ENDPOINT}?${params.toString()}`);
  const cookie = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 600
  };
  res.cookies.set(STATE_COOKIE, state, cookie);
  res.cookies.set(
    RETURN_COOKIE,
    safeReturnPath(request.nextUrl.searchParams.get('returnTo')),
    cookie
  );
  return res;
}
