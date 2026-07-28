export const ZAPPING_MINT_URL =
  'https://drhouse.zappingtv.com/login/v20/webplayer';
export const ZAPPING_HEARTBEAT_URL =
  'https://drhouse.zappingtv.com/hb/v1/webplayer/';
export const ZAPPING_CHANNELS_URL =
  'https://alquinta.zappingtv.com/v31/webplayer/channelswithurl';
export const ZAPPING_NOWPLAYING_URL =
  'https://charly.zappingtv.com/v3/webplayer/nowplaying';

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

/** One entry of a channel's schedule. */
export type ZappingProgram = {
  /** Unix **seconds**, not ms. */
  start_time: number;
  end_time: number;
  /** Display title; `"Programa | Episodio"` when there is an episode. */
  title: string;
  /** Series title, without the episode suffix. */
  program_title: string;
  image_wide: string;
  parent_image_wide: string;
  is_live: boolean;
  episode_info: { title: string; season: number; number: number } | null;
  sub_type: string;
  zapping_type: string;
  program_id: string;
  parent_id: string;
  listing_id: number;
  has_moments?: boolean;
  sport_extended: boolean;
  sport_extended_id: number | null;
};

/** What is on a channel: the last two programs, the current one, the next two. */
export type ZappingScheduleEntry = {
  past: ZappingProgram[];
  now: ZappingProgram | null;
  next: ZappingProgram[];
};

export type ZappingNowPlaying = {
  /** Milliseconds until the data is worth re-fetching (~60s). */
  nextUpdate: number;
  /** Keyed by channel **alias** — resolve through `zappingAliasIndex`. */
  schedule: Record<string, ZappingScheduleEntry>;
  /** The "Más vistos" ranking, best first, as aliases. */
  topChannels: string[];
};

type NowPlayingResponse = {
  data?: {
    next_update?: number;
    schedule?: Record<string, ZappingScheduleEntry>;
    top_channels?: string[];
  };
};

/** Artwork for a program's `image_wide`. */
export const zappingProgramImageUrl = (imageWide: string, width = 500) =>
  `https://davinci.zappingtv.com/epg/${imageWide}?w=${width}`;

/**
 * The `<track>` slug of a channel's HLS url (`ringeling…/v1/<track>/…`). Not
 * unique — `mega` and `hbo2` each cover two channels — so it is only ever a
 * fallback key, never the primary one.
 */
export const zappingTrackOf = (channel: ZappingChannel) =>
  channel.url.match(/\/v1\/([^/]+)\//)?.[1];

/**
 * The catalogue indexed by the alias `nowplaying` keys its data on.
 *
 * That alias is `image` for most channels and the HLS track slug for the rest
 * (they agree for only 132 of 178), so both are indexed. `image` is unique and
 * wins every collision; the track only fills gaps. There are exactly two
 * collisions — `mega` and `hbo2` — and in both the alias is one channel's
 * `image` and a duplicate signal's track, so preferring `image` picks the
 * primary channel.
 *
 * Zapping's own webplayer looks these up by `image` alone, which is why its
 * "Más vistos" silently renders 11 of the 20 ranked channels and drops
 * Chilevisión, Canal 13 and TVN. Indexing both resolves all 20.
 */
export function zappingAliasIndex(channels: ZappingChannel[]) {
  const index = new Map<string, ZappingChannel>();
  for (const channel of channels) {
    const track = zappingTrackOf(channel);
    if (track && !index.has(track)) index.set(track, channel);
  }
  for (const channel of channels) index.set(channel.image, channel);
  return index;
}

/**
 * What every channel is airing right now, plus the most-viewed ranking.
 *
 * Takes **no credential** — the webplayer posts its loginToken but the endpoint
 * answers the same to an empty body, and it serves `access-control-allow-origin:
 * *`. So unlike the heartbeat it is callable straight from the browser, on
 * `localhost` included, with no proxy.
 */
export async function fetchZappingNowPlaying(): Promise<ZappingNowPlaying> {
  const res = await fetch(ZAPPING_NOWPLAYING_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'data='
  });
  const json: NowPlayingResponse = await res.json();
  const schedule = json?.data?.schedule;
  if (!schedule || typeof schedule !== 'object') {
    throw new Error('Zapping: no se pudo obtener la programación actual');
  }
  return {
    nextUpdate:
      typeof json.data?.next_update === 'number' && json.data.next_update > 0
        ? json.data.next_update
        : 60_000,
    schedule,
    topChannels: json.data?.top_channels ?? []
  };
}
