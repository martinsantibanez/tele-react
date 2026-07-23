// Zapping streaming-token service.
//
// Reverse-engineered from https://app.zapping.com/webplayer. The streaming
// token model has two distinct tokens:
//
//   loginToken  — durable account credential (JWT { key }). Lives in the
//                 webplayer's `sessionStorage.loginToken` / cookie `logintoken`.
//                 This is what the user provides once; it does not rotate.
//   playToken   — short-lived streaming token (JWT { userID, uuid }) that is
//                 appended to every HLS URL as `?token=...`. It is GLOBAL across
//                 all channels, and is only honoured by the CDN (`ringeling`)
//                 while its `uuid` has an active, heart-beaten play session.
//
// The playToken is minted from the loginToken + a device uuid, and stays valid
// only while we keep sending heartbeats. Stop heart-beating and the session
// idles out within ~15-30s and the CDN starts returning 403 — which is exactly
// why a manually-copied playToken "dies" after a short time / when switching
// signals. All three endpoints are CORS-open, so this runs client-side.

export const ZAPPING_MINT_URL =
  'https://drhouse.zappingtv.com/login/v20/webplayer';
export const ZAPPING_HEARTBEAT_URL =
  'https://drhouse.zappingtv.com/hb/v1/webplayer/';

type MintResponse = {
  status: boolean;
  data?: { playToken?: string; uuid?: string; askForLocation?: boolean };
};

type HeartbeatResponse = {
  status: boolean;
  data?: { platform?: string; nextHB?: number };
};

const form = (params: Record<string, string>) =>
  Object.entries(params)
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join('&');

/** Exchange the durable loginToken for a fresh streaming playToken. */
export async function mintPlayToken(
  loginToken: string,
  uuid: string
): Promise<string> {
  const res = await fetch(ZAPPING_MINT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form({ token: loginToken, uuid })
  });
  const json: MintResponse = await res.json();
  const playToken = json?.data?.playToken;
  if (!json?.status || !playToken) {
    throw new Error(
      'Zapping: no se pudo generar el playToken (loginToken inválido o expirado)'
    );
  }
  return playToken;
}

/**
 * Keep the play session alive. Returns the server-suggested seconds until the
 * next heartbeat (`nextHB`, ~15s). The stream only becomes authorised after the
 * first couple of heartbeats.
 */
export async function sendHeartbeat(
  playToken: string,
  uuid: string
): Promise<number> {
  const deviceInfo = JSON.stringify({
    platform:
      typeof navigator !== 'undefined' ? navigator.platform : 'webplayer',
    browser: 'webplayer'
  });
  const res = await fetch(ZAPPING_HEARTBEAT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form({ playtoken: playToken, uuid, deviceInfo })
  });
  const json: HeartbeatResponse = await res.json().catch(() => ({
    status: false
  }));
  return typeof json?.data?.nextHB === 'number' ? json.data.nextHB : 15;
}
