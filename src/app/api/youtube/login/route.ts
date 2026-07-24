import { NextRequest, NextResponse } from 'next/server';
import {
  AUTH_ENDPOINT,
  CLIENT_ID,
  RETURN_COOKIE,
  STATE_COOKIE,
  VERIFIER_COOKIE,
  SCOPE,
  codeChallenge,
  isConfigured,
  randomToken,
  redirectUri,
  safeReturnPath
} from '../oauth';

// Kicks off the OAuth dance. access_type=offline + prompt=consent are what make
// Google actually hand back a refresh token (without them a returning user gets
// none, and durability breaks). State + PKCE verifier ride along in short-lived
// httpOnly cookies and are checked in the callback.
export async function GET(request: NextRequest) {
  if (!isConfigured()) {
    return NextResponse.json(
      { error: 'YouTube OAuth is not configured' },
      { status: 500 }
    );
  }

  const origin = request.nextUrl.origin;
  const state = randomToken(16);
  const verifier = randomToken(32);
  const challenge = await codeChallenge(verifier);

  const params = new URLSearchParams({
    client_id: CLIENT_ID!,
    redirect_uri: redirectUri(origin),
    response_type: 'code',
    scope: SCOPE,
    access_type: 'offline',
    prompt: 'consent',
    include_granted_scopes: 'true',
    state,
    code_challenge: challenge,
    code_challenge_method: 'S256'
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
  res.cookies.set(VERIFIER_COOKIE, verifier, cookie);
  res.cookies.set(
    RETURN_COOKIE,
    safeReturnPath(request.nextUrl.searchParams.get('returnTo')),
    cookie
  );
  return res;
}
