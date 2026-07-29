import { NextResponse } from 'next/server';
import { REFRESH_COOKIE } from '../oauth';

// Clears the encrypted refresh-token cookie, which is all disconnecting can
// mean here: Spotify publishes no revoke endpoint, so the grant itself is
// withdrawn by the user at spotify.com/account/apps. Without the cookie this
// app can no longer act on it — /token has nothing left to decrypt.
export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(REFRESH_COOKIE);
  return res;
}
