export const ZAPPING_MINT_URL =
  'https://drhouse.zappingtv.com/login/v20/webplayer';
export const ZAPPING_HEARTBEAT_URL =
  'https://drhouse.zappingtv.com/hb/v1/webplayer/';
export const ZAPPING_CHANNELS_URL =
  'https://alquinta.zappingtv.com/v31/webplayer/channelswithurl';

export const ZAPPING_GETCODE_URL =
  'https://benja.zappingtv.com/activation/v20/smarttv/getcode';
export const ZAPPING_LINKED_URL =
  'https://benja.zappingtv.com/activation/v20/smarttv/linked';
export const zappingLinkUrl = (code: string) =>
  `https://www.zapping.com/smart/${code}`;

export const ZAPPING_ACTIVATION_TTL_MS = 600 * 1000;

/** A channel as returned by `channelswithurl` (and by the bundled fallback). */
export type ZappingChannel = {
  id: number;
  name: string;
  /** Logo slug, see `zappingLogoUrl`. */
  image: string;
  desc_short: string;
  package_id: number;
  /** Channel number; the natural ordering of the catalogue. */
  number: number;
  has_sub: boolean;
  has_hd: boolean;
  catch_up: number;
  reverse_epg: number;
  start_over: boolean;
  /** Always the placeholder `"a"` — the real token is appended client-side. */
  token: string;
  url: string;
  url_sub: string;
  parental: number;
  locked: boolean;
};

type MintResponse = {
  status: boolean;
  data?: { playToken?: string; uuid?: string; askForLocation?: boolean };
};

type ChannelsResponse = {
  status: boolean;
  data?: Record<string, ZappingChannel>;
};

type HeartbeatResponse = {
  status: boolean;
  data?: { platform?: string; nextHB?: number };
};

type ActivationCodeResponse = {
  status: boolean;
  data?: { code?: number | string; uuid?: string } | null;
};

type LinkedResponse = {
  status: boolean;
  data?: {
    logged?: boolean;
    /** Seconds until the device should poll again (~3s). */
    nextQuery?: number;
    /** The loginToken, once the code has been linked to an account. */
    data?: string;
    email?: string;
    name?: string;
  } | null;
};

const form = (params: Record<string, string>) =>
  Object.entries(params)
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join('&');

export type ZappingActivationCode = { code: string; uuid: string };

/**
 * Start a pairing: returns the code the user has to enter at
 * `zappingLinkUrl(code)` and the device uuid the session should adopt. Pass the
 * browser's current uuid to keep it, or nothing on a first run — either way the
 * backend decides, and the linked account is bound to whatever it returns.
 */
export async function requestActivationCode(
  uuid?: string
): Promise<ZappingActivationCode> {
  const res = await fetch(ZAPPING_GETCODE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form({ uuid: uuid || '', acquisition: 'smarttv' })
  });
  const json: ActivationCodeResponse = await res.json();
  const code = json?.data?.code;
  const issuedUuid = json?.data?.uuid;
  if (!json?.status || code == null || !issuedUuid) {
    throw new Error('Zapping: no se pudo obtener un código de vinculación');
  }
  return { code: String(code), uuid: issuedUuid };
}

export type ZappingLinkResult =
  | { logged: false; nextQuery: number }
  | { logged: true; loginToken: string; email?: string; name?: string };

/**
 * Poll a pending pairing code. Stays `logged: false` until the user completes
 * the link, then yields the durable loginToken. An unknown/expired code answers
 * `status: false`, which is reported as "not linked yet" — callers time the
 * code out themselves with `ZAPPING_ACTIVATION_TTL_MS`, exactly as the TV app
 * does.
 */
export async function checkLinkedCode(
  code: string
): Promise<ZappingLinkResult> {
  const res = await fetch(ZAPPING_LINKED_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form({ code })
  });
  const json: LinkedResponse = await res.json();
  const data = json?.data;
  const nextQuery =
    typeof data?.nextQuery === 'number' ? Math.max(2, data.nextQuery) : 3;
  if (!json?.status || !data?.logged || !data?.data) {
    return { logged: false, nextQuery };
  }
  return {
    logged: true,
    loginToken: data.data,
    email: data.email,
    name: data.name
  };
}

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

export async function fetchZappingChannels(
  loginToken?: string
): Promise<Record<string, ZappingChannel>> {
  const res = await fetch(ZAPPING_CHANNELS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form({
      token: loginToken || '',
      quality: 'high',
      hevc: '0',
      is3g: '0',
      lowLatency: '0'
    })
  });
  const json: ChannelsResponse = await res.json();
  const channels = json?.data;
  if (!json?.status || !channels || typeof channels !== 'object') {
    throw new Error('Zapping: no se pudo obtener la lista de canales');
  }
  return channels;
}

/** Logo for a channel's `image` slug, at one of Zapping's rendered sizes. */
export const zappingLogoUrl = (image: string, size = 62) =>
  `https://davinci.zappingtv.com/gato/media/${size}/canales/white/${image}.png`;
