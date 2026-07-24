import { NextRequest, NextResponse } from 'next/server';
import { REFRESH_COOKIE, revokeFromCookie } from '../oauth';

// Revokes the grant on Google's side (best-effort) and clears the encrypted
// refresh-token cookie. After this the user is fully disconnected.
export async function POST(request: NextRequest) {
  const sealed = request.cookies.get(REFRESH_COOKIE)?.value;
  if (sealed) await revokeFromCookie(sealed);

  const res = NextResponse.json({ ok: true });
  res.cookies.delete(REFRESH_COOKIE);
  return res;
}
