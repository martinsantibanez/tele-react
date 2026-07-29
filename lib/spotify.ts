// Spotify embeds, from whatever the user pasted.
//
// The player is the public `open.spotify.com` embed, driven by Spotify's IFrame
// API. It needs a canonical `spotify:type:id` uri, while what gets copied out of
// the app or the web player is a share link with a tracking `?si=` on the end
// and sometimes a locale segment in the middle. Everything here is about
// getting from the second to the first.

/** The kinds of thing the embed can play. */
export const SPOTIFY_TYPES = [
  'track',
  'album',
  'playlist',
  'artist',
  'show',
  'episode'
] as const;

export type SpotifyType = (typeof SPOTIFY_TYPES)[number];

export type SpotifyRef = { type: SpotifyType; id: string; uri: string };

const TYPES = SPOTIFY_TYPES.join('|');

// `spotify:playlist:37i9dQZF1DXcBWIGoYBM5M`
const URI_RE = new RegExp(`^spotify:(${TYPES}):([A-Za-z0-9]+)$`);
// Anything link-shaped: the locale (`/intl-es/`) and the `/embed/` prefix both
// sit in front of the type, and the id is followed by the share parameters.
const LINK_RE = new RegExp(`(?:^|/)(${TYPES})/([A-Za-z0-9]+)`);

/**
 * A share link, an embed link or a uri, reduced to the reference the player
 * needs. Undefined for anything that is not one of the embeddable kinds — a
 * user profile link, a search url, a typo.
 */
export function parseSpotifyRef(input: string): SpotifyRef | undefined {
  const text = input.trim();
  if (!text) return undefined;
  const match = URI_RE.exec(text) ?? LINK_RE.exec(text);
  if (!match) return undefined;
  const type = match[1] as SpotifyType;
  const id = match[2];
  return { type, id, uri: `spotify:${type}:${id}` };
}

/** The uri as a page url, which is what oEmbed and the share sheet speak. */
export function spotifyPageUrl({ type, id }: SpotifyRef) {
  return `https://open.spotify.com/${type}/${id}`;
}

const typeLabels: Record<SpotifyType, string> = {
  track: 'Canción',
  album: 'Álbum',
  playlist: 'Playlist',
  artist: 'Artista',
  show: 'Podcast',
  episode: 'Episodio'
};

/** What to call the item before — or instead of — oEmbed answering. */
export function spotifyFallbackName(ref: SpotifyRef) {
  return `${typeLabels[ref.type]} ${ref.id.slice(0, 8)}`;
}

export type SpotifyOembed = { name?: string; imageUrl?: string };


/**
 * The item's real name and cover art. Spotify's oEmbed endpoint is public and
 * CORS-open, so this runs from the browser without a token — but it is only
 * decoration for the picker's row, and the embed plays with or without it.
 */
export async function fetchSpotifyOembed(
  ref: SpotifyRef
): Promise<SpotifyOembed> {
  const url = `https://open.spotify.com/oembed?url=${encodeURIComponent(
    spotifyPageUrl(ref)
  )}`;
  const response = await fetch(url);
  if (!response.ok)
    throw new Error(`spotify oembed responded with ${response.status}`);
  const data: { title?: string; thumbnail_url?: string } =
    await response.json();
  return { name: data.title, imageUrl: data.thumbnail_url };
}

// ---------------------------------------------------------------------------
// Web API — what a connected account has to offer.
//
// This is where the Spotify tab's catalogue comes from once the user has
// logged in, and it is deliberately built out of the account's *own* things.
// Spotify shut the algorithmic doors on 27 November 2024: /v1/recommendations,
// /v1/browse/featured-playlists, a category's playlists, related-artists and
// audio-features all answer 403 for apps created after that date, and the
// editorial playlists they used to surface (Discover Weekly, Release Radar,
// the Daily Mixes, the Top 50s) cannot be read by any endpoint — /v1/playlists
// answers 404 for anything Spotify owns. February 2026 took /v1/browse/new-
// releases with it. So "lo recomendado" cannot be Spotify's recommendations.
//
// What stands in for them is everything the account already says it likes —
// its playlists, its saved albums and shows, its top artists — and, in front
// of those, what it has actually been listening to: see `fetchRecentContexts`,
// which is the one way left to reach a Daily Mix.
//
// All of it is CORS-open and runs from the browser with a bearer token, the
// same way lib/youtube.ts does; the token itself comes from /api/spotify/token.

const API_BASE = 'https://api.spotify.com/v1';

/** A 401 from the Web API: the access token expired or the grant is gone. */
export class SpotifyAuthError extends Error {
  constructor(message = 'spotify unauthorized') {
    super(message);
    this.name = 'SpotifyAuthError';
  }
}

/**
 * A 403 that is specifically «this grant does not cover that call». Refreshing
 * cannot fix it — a refresh token only ever mints the scopes it was issued with
 * — so an account connected before a scope was added keeps failing until the
 * user goes back through the consent screen. Told apart from a 401 for exactly
 * that reason: one is retried, the other is reported.
 *
 * Not every 403 is one of these, and the difference matters: Spotify also uses
 * 403 for throttling and for endpoints closed to the app. Latching «reconnect
 * your account» onto those would send the user through a consent screen that
 * fixes nothing, so only Spotify saying `Insufficient client scope` counts.
 */
export class SpotifyScopeError extends Error {
  constructor(message = 'spotify scope not granted') {
    super(message);
    this.name = 'SpotifyScopeError';
  }
}

/**
 * Asked to slow down. Spotify says this two ways and only one of them is a 429:
 * an app that has run through its quota also gets **403 with an empty body**,
 * on endpoints that answered 200 a second earlier and will again a second
 * later. Both mean the same thing — come back shortly — and neither is a reason
 * to drop a row from the list for an hour.
 */
export class SpotifyRateLimitError extends Error {
  constructor(
    message: string,
    readonly retryAfterMs: number
  ) {
    super(message);
    this.name = 'SpotifyRateLimitError';
  }
}

/** What to wait when Spotify throttles without saying for how long. */
const DEFAULT_RETRY_MS = 1500;

function rateLimitError(path: string, res: Response): SpotifyRateLimitError {
  const header = Number(res.headers.get('retry-after'));
  const wait =
    Number.isFinite(header) && header > 0 ? header * 1000 : DEFAULT_RETRY_MS;
  return new SpotifyRateLimitError(`spotify ${path} rate limited`, wait);
}

/**
 * A 403, told apart by what came with it. A body naming the scope is the grant
 * being short and no amount of retrying will help; an empty body is the quota
 * gate above; anything else is left as it is and reported.
 */
function forbiddenError(path: string, text: string, body: unknown): Error {
  const message = (body as { error?: { message?: string } })?.error?.message;
  if (message && /insufficient (client )?scope/i.test(message))
    return new SpotifyScopeError(`spotify ${path}: ${message}`);
  if (!text.trim())
    return new SpotifyRateLimitError(
      `spotify ${path} refused without a reason (quota)`,
      DEFAULT_RETRY_MS
    );
  return new Error(
    `spotify ${path} responded with 403${message ? `: ${message}` : ''}`
  );
}

/** Reads a body that is only sometimes JSON, without throwing over it. */
function parseBody(text: string): unknown {
  try {
    return text ? JSON.parse(text) : undefined;
  } catch {
    return undefined;
  }
}

/**
 * One retry for a call Spotify merely throttled. A second refusal stands: the
 * point is to ride out the quota gate's every-other-request pattern, not to
 * keep pushing on a door that is closed.
 */
async function retrying<T>(call: () => Promise<T>): Promise<T> {
  try {
    return await call();
  } catch (err) {
    if (!(err instanceof SpotifyRateLimitError)) throw err;
    await new Promise(resolve => setTimeout(resolve, err.retryAfterMs));
    return call();
  }
}

async function spGet<T>(path: string, accessToken: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  if (res.status === 401) throw new SpotifyAuthError();
  if (res.status === 429) throw rateLimitError(path, res);
  if (res.status === 403) {
    const text = await res.text();
    throw forbiddenError(path, text, parseBody(text));
  }
  if (!res.ok) throw new Error(`spotify ${path} responded with ${res.status}`);
  return res.json();
}

/** Cover art, largest first in Spotify's responses; the biggest is the one. */
type ImageObject = { url?: string };
const cover = (images?: ImageObject[]) => images?.[0]?.url;

/** Every list endpoint here answers in this envelope. */
type Page<T> = { items?: (T | null)[]; next?: string | null };

type PlaylistObject = {
  uri?: string;
  name?: string;
  images?: ImageObject[];
  owner?: { display_name?: string };
};
type AlbumObject = {
  uri?: string;
  name?: string;
  images?: ImageObject[];
  artists?: { name?: string }[];
};
type ShowObject = {
  uri?: string;
  name?: string;
  images?: ImageObject[];
  publisher?: string;
};
type ArtistObject = {
  uri?: string;
  name?: string;
  images?: ImageObject[];
  genres?: string[];
};

/**
 * A page's worth is usually the whole thing — 50 playlists is already more
 * than the picker's list wants to scroll through — so this walks `next` only
 * as far as `maxPages` and stops.
 */
async function pagedItems<T>(
  firstPath: string,
  accessToken: string,
  maxPages = 2
): Promise<(T | null)[]> {
  const out: (T | null)[] = [];
  let path: string | undefined = firstPath;
  for (let page = 0; path && page < maxPages; page++) {
    const json: Page<T> = await spGet<Page<T>>(path, accessToken);
    out.push(...(json.items ?? []));
    // `next` comes back absolute; everything here speaks paths.
    path = json.next ? json.next.replace(API_BASE, '') : undefined;
  }
  return out;
}

/** Anything the picker can list has to have both, and Spotify pads with nulls. */
type Listable = { uri?: string; name?: string };
function isListable<T extends Listable>(
  item: T | null | undefined
): item is T & { uri: string; name: string } {
  return Boolean(item?.uri && item?.name);
}

const artistNames = (artists?: { name?: string }[]) =>
  artists
    ?.map(a => a.name)
    .filter(Boolean)
    .join(', ') || undefined;

/** What a listed item is, which is what names the picker's rows. */
export type SpotifyLibraryKind = 'playlist' | 'album' | 'show' | 'artist';

/** Which of the tab's headers an item is listed under. */
export type SpotifySection = 'recent' | 'library';

export type SpotifyLibraryItem = {
  kind: SpotifyLibraryKind;
  section: SpotifySection;
  uri: string;
  name: string;
  imageUrl?: string;
  /** Second line in the picker: the owner, the artist, the publisher. */
  subtitle?: string;
};

/** The user's own and followed playlists. */
export async function fetchMyPlaylists(
  accessToken: string
): Promise<SpotifyLibraryItem[]> {
  const items = await pagedItems<PlaylistObject>(
    '/me/playlists?limit=50',
    accessToken
  );
  return items.filter(isListable).map(playlist => ({
    kind: 'playlist' as const,
    section: 'library' as const,
    uri: playlist.uri,
    name: playlist.name,
    imageUrl: cover(playlist.images),
    subtitle: playlist.owner?.display_name
  }));
}

/** Saved albums, newest addition first (Spotify's own order). */
export async function fetchSavedAlbums(
  accessToken: string
): Promise<SpotifyLibraryItem[]> {
  const saved = await pagedItems<{ album?: AlbumObject | null }>(
    '/me/albums?limit=50',
    accessToken
  );
  return saved
    .map(entry => entry?.album)
    .filter(isListable)
    .map(album => ({
      kind: 'album' as const,
      section: 'library' as const,
      uri: album.uri,
      name: album.name,
      imageUrl: cover(album.images),
      subtitle: artistNames(album.artists)
    }));
}

/** Saved podcasts. */
export async function fetchSavedShows(
  accessToken: string
): Promise<SpotifyLibraryItem[]> {
  const saved = await pagedItems<{ show?: ShowObject | null }>(
    '/me/shows?limit=50',
    accessToken,
    1
  );
  return saved
    .map(entry => entry?.show)
    .filter(isListable)
    .map(show => ({
      kind: 'show' as const,
      section: 'library' as const,
      uri: show.uri,
      name: show.name,
      imageUrl: cover(show.images),
      subtitle: show.publisher
    }));
}

/**
 * The artists this account listens to most. An artist uri is playable on its
 * own — the embed plays the artist's top tracks — which makes this the closest
 * thing left to "more of what you like".
 */
export async function fetchTopArtists(
  accessToken: string
): Promise<SpotifyLibraryItem[]> {
  const items = await pagedItems<ArtistObject>(
    '/me/top/artists?limit=50&time_range=medium_term',
    accessToken,
    1
  );
  return items.filter(isListable).map(artist => ({
    kind: 'artist' as const,
    section: 'library' as const,
    uri: artist.uri,
    name: artist.name,
    imageUrl: cover(artist.images),
    subtitle: artist.genres?.[0]
  }));
}

// ---------------------------------------------------------------------------
// Recently played — the way back in to the things Spotify makes for you.
//
// The Web API will not name a Daily Mix, but it will admit the user listened to
// one. Every play in the history carries the `context` it was started from, and
// for anything played off a playlist that context is the playlist's uri —
// Discover Weekly, Release Radar and the Daily Mixes included. The embed plays
// a uri without asking anyone's permission, and oEmbed will put a name and a
// cover on it, so a uri is the whole of what has to be recovered here.
//
// What this row cannot be is a suggestion the user has never heard: it lists
// the mixes they already played, in the order they last played them. For a wall
// of channels that is arguably the better list anyway.

/** How many distinct things the recent row lists. */
const RECENT_MAX = 16;

/** A page of history, which is also all of it Spotify keeps. */
const HISTORY_PAGE = 50;

/**
 * How far back to walk when a page did not fill the row. Spotify documents the
 * history as the last 50 plays and pages past that usually answer empty, so
 * this is worth asking for and not worth counting on.
 */
const HISTORY_PAGES = 3;

/** A play, as far as this cares: where it was played from, and what it was. */
type PlayHistory = {
  context?: { uri?: string } | null;
  track?: { album?: AlbumObject | null } | null;
};

/**
 * A recent uri, plus what the history already said about it. An album read off
 * a play arrives fully named — Spotify sends the whole album object with the
 * track — and naming it again over oEmbed would be a request for nothing.
 */
export type SpotifyRecentRef = SpotifyRef & {
  known?: { name: string; imageUrl?: string; subtitle?: string };
};

/** The album a played track came from, named from the history itself. */
function albumRef(album?: AlbumObject | null): SpotifyRecentRef | undefined {
  if (!isListable(album)) return undefined;
  const ref = parseSpotifyRef(album.uri);
  if (!ref) return undefined;
  return {
    ...ref,
    known: {
      name: album.name,
      imageUrl: cover(album.images),
      subtitle: artistNames(album.artists)
    }
  };
}

/**
 * The last things listened to, newest first and each listed once: playlists,
 * albums, artists and shows, as uris.
 *
 * Contexts come first, because a context is what the user chose to play *from*
 * and it is the only way a Daily Mix is ever named. But an account that plays
 * single tracks — off search, or out of «Canciones que te gustan», whose
 * `spotify:user:…:collection` context the embed cannot take — has almost none,
 * and used to get a row of two or three. So the albums those plays came from
 * fill the rest of the row: not what was chosen, but certainly what was heard.
 *
 * Paging stops as soon as there is enough to fill the row, which for most
 * accounts is the first page: fifty plays hold more distinct albums than the
 * row shows.
 */
export async function fetchRecentContexts(
  accessToken: string
): Promise<SpotifyRecentRef[]> {
  const seen = new Set<string>();
  const contexts: SpotifyRecentRef[] = [];
  const albums: SpotifyRecentRef[] = [];
  let path: string | undefined = `/me/player/recently-played?limit=${HISTORY_PAGE}`;
  for (let page = 0; path && page < HISTORY_PAGES; page++) {
    const json: Page<PlayHistory> = await spGet<Page<PlayHistory>>(
      path,
      accessToken
    );
    for (const play of json.items ?? []) {
      const uri = play?.context?.uri;
      const context = uri ? parseSpotifyRef(uri) : undefined;
      if (context && !seen.has(context.uri)) {
        seen.add(context.uri);
        contexts.push(context);
      }
      const album = albumRef(play?.track?.album);
      if (album && !seen.has(album.uri)) {
        seen.add(album.uri);
        albums.push(album);
      }
    }
    if (contexts.length + albums.length >= RECENT_MAX) break;
    // `next` comes back absolute; everything here speaks paths.
    path = json.next ? json.next.replace(API_BASE, '') : undefined;
  }
  return [...contexts, ...albums].slice(0, RECENT_MAX);
}

/** The context types worth listing, and what to call each in the picker. */
const contextKinds: Partial<Record<SpotifyType, SpotifyLibraryKind>> = {
  playlist: 'playlist',
  album: 'album',
  artist: 'artist',
  show: 'show'
};

/**
 * Contexts as listable items. One the account already owns is reused from the
 * library rows — its name, cover and subtitle are already in hand and better
 * than oEmbed's — and everything else, which is where the Daily Mixes land, is
 * looked up publicly. A lookup that fails costs its row: an unnamed id is not
 * worth a line in the list.
 */
async function recentItems(
  refs: SpotifyRef[],
  library: SpotifyLibraryItem[]
): Promise<SpotifyLibraryItem[]> {
  const known = new Map(library.map(item => [item.uri, item]));
  const resolved = await Promise.all(
    refs.map(async (ref): Promise<SpotifyLibraryItem | undefined> => {
      const owned = known.get(ref.uri);
      if (owned) return { ...owned, section: 'recent' };
      const kind = contextKinds[ref.type];
      if (!kind) return undefined;
      try {
        const { name, imageUrl } = await fetchSpotifyOembed(ref);
        if (!name) return undefined;
        return { kind, section: 'recent', uri: ref.uri, name, imageUrl };
      } catch (err) {
        console.error('[spotify] oembed lookup failed', ref.uri, err);
        return undefined;
      }
    })
  );
  return resolved.filter((item): item is SpotifyLibraryItem => !!item);
}

export type SpotifyLibrary = {
  items: SpotifyLibraryItem[];
  /**
   * The grant predates `user-read-recently-played`, so the recent row is empty
   * and will stay empty until the user reconnects. Worth saying out loud: from
   * the outside it is indistinguishable from having listened to nothing.
   */
  recentDenied: boolean;
};

/**
 * Everything the connected account has to list, in the order the tab shows it:
 * what it has been playing, then what it has saved.
 *
 * Each row is fetched independently and a failing one is dropped rather than
 * taken as a failure of the whole: a token missing one scope, or an endpoint
 * Spotify has since closed to new apps, should cost that row and nothing else.
 * Only an auth failure propagates — the caller retries those against a fresh
 * token.
 */
export async function fetchSpotifyLibrary(
  accessToken: string
): Promise<SpotifyLibrary> {
  let recentDenied = false;
  const [recentRefs, rows] = await Promise.all([
    retrying(() => fetchRecentContexts(accessToken)).catch((err: unknown) => {
      if (err instanceof SpotifyAuthError) throw err;
      if (err instanceof SpotifyScopeError) recentDenied = true;
      else console.error('[spotify] recently played failed', err);
      return [] as SpotifyRef[];
    }),
    Promise.all(
      [
        fetchMyPlaylists,
        fetchSavedAlbums,
        fetchSavedShows,
        fetchTopArtists
      ].map(fetchRow =>
        retrying(() => fetchRow(accessToken)).catch((err: unknown) => {
          if (err instanceof SpotifyAuthError) throw err;
          console.error('[spotify] library row failed', err);
          return [] as SpotifyLibraryItem[];
        })
      )
    )
  ]);
  // The contexts arrive as bare uris, and the library rows are what spare most
  // of them a lookup — so they are named only once both are in.
  const library = rows.flat();
  const recent = await recentItems(recentRefs, library);
  return { items: [...recent, ...library], recentDenied };
}

// ---------------------------------------------------------------------------
// Player — Spotify Connect.
//
// Everything above reads a catalogue. This reads and drives playback, which is
// a different animal: it does not belong to a tab, or to this app, or to the
// browser. Spotify keeps one playback session per account, on whichever
// *device* is active — a phone, the desktop app, a speaker, or a browser
// running the Web Playback SDK (see `lib/spotifyPlayerSdk.ts`). These calls are
// the remote control for that session, so two tiles, two tabs and the phone in
// your pocket all describe the same thing and all steer the same thing.
//
// Two constraints run through the lot:
//
//   - Premium only. Every endpoint here answers 403 for a free account, which
//     is why `SpotifyScopeError` is not quite the right name for what comes
//     back and `isPremiumRequired` exists to tell the two 403s apart.
//   - There has to be an active device. With nothing playing anywhere Spotify
//     has nowhere to send a command, and `/me/player` answers 204 rather than
//     an error. Passing `device_id` explicitly is what makes a command land on
//     a device that is merely *available* rather than active, and it is how a
//     freshly registered SDK device gets its first instruction.

/** No device to play on: nothing is active and none was named. */
export class SpotifyNoDeviceError extends Error {
  constructor(message = 'spotify has no active device') {
    super(message);
    this.name = 'SpotifyNoDeviceError';
  }
}

/**
 * Whether a 403 from a player endpoint is the Premium wall rather than a
 * missing scope. Spotify says so in the body — `reason: PREMIUM_REQUIRED` on
 * the newer responses, and a plain message on the older ones — and the two need
 * telling apart because only one of them is fixed by reconnecting.
 */
function isPremiumRequired(body: unknown): boolean {
  const error = (body as { error?: { reason?: string; message?: string } })
    ?.error;
  if (!error) return false;
  return (
    error.reason === 'PREMIUM_REQUIRED' ||
    /premium/i.test(error.message ?? '')
  );
}

/** Raised when the account cannot use the player at all. */
export class SpotifyPremiumError extends Error {
  constructor(message = 'spotify premium required') {
    super(message);
    this.name = 'SpotifyPremiumError';
  }
}

/**
 * The player endpoints, read and write.
 *
 * Only a GET here has an answer worth reading. The transport commands reply
 * 204 with nothing, or — when Spotify queues the command for a device rather
 * than applying it outright — **202 with an opaque command id as plain text**,
 * which is not JSON and was never meant to be parsed as any. Every caller below
 * returns `void` anyway, so the body of a command is simply not read: a command
 * that Spotify accepted must not be reported as failed on account of what came
 * back after it.
 */
async function spPlayer<T>(
  path: string,
  accessToken: string,
  init?: { method?: string; body?: unknown }
): Promise<T | undefined> {
  const method = init?.method ?? 'GET';
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(init?.body ? { 'Content-Type': 'application/json' } : {})
    },
    body: init?.body ? JSON.stringify(init.body) : undefined
  });
  if (res.status === 401) throw new SpotifyAuthError();
  if (res.status === 429) throw rateLimitError(path, res);
  if (res.status === 403) {
    const text = await res.text();
    const body = parseBody(text);
    if (isPremiumRequired(body)) throw new SpotifyPremiumError();
    throw forbiddenError(path, text, body);
  }
  if (res.status === 404) {
    // "Device not found" — the device the command named has gone away, which
    // for a wall of tiles is a normal race, not a failure worth a red banner.
    throw new SpotifyNoDeviceError(`spotify ${path} 404`);
  }
  if (!res.ok) throw new Error(`spotify ${path} responded with ${res.status}`);
  if (method !== 'GET' || res.status === 204) return undefined;
  // A 200 with an empty body happens on the reads too, when there is no session.
  const text = await res.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text) as T;
  } catch {
    console.error('[spotify] unparseable body from', path, text.slice(0, 120));
    return undefined;
  }
}

/** One Connect device the account can reach. */
export type SpotifyDevice = {
  id: string;
  name: string;
  type: string;
  isActive: boolean;
  volumePercent?: number;
};

type DeviceObject = {
  id?: string | null;
  name?: string;
  type?: string;
  is_active?: boolean;
  volume_percent?: number | null;
};

const toDevice = (device: DeviceObject): SpotifyDevice | undefined =>
  device.id
    ? {
        id: device.id,
        name: device.name ?? 'Dispositivo',
        type: device.type ?? 'Unknown',
        isActive: Boolean(device.is_active),
        volumePercent: device.volume_percent ?? undefined
      }
    : undefined;

/** Everything the account can currently play on. */
export async function fetchSpotifyDevices(
  accessToken: string
): Promise<SpotifyDevice[]> {
  const json = await spPlayer<{ devices?: DeviceObject[] }>(
    '/me/player/devices',
    accessToken
  );
  return (json?.devices ?? [])
    .map(toDevice)
    .filter((device): device is SpotifyDevice => !!device);
}

/**
 * What the account is playing, wherever it is playing it.
 *
 * This is the shared truth the tiles render: poll it from two tabs and both see
 * the same track at the same position on the same device, because neither of
 * them is where the answer lives.
 */
export type SpotifyPlayback = {
  /** The playlist/album/artist being played *from*, when there is one. */
  contextUri?: string;
  trackUri?: string;
  trackName?: string;
  artists?: string;
  imageUrl?: string;
  isPlaying: boolean;
  /** Milliseconds, both. `duration` is 0 when Spotify does not say. */
  position: number;
  duration: number;
  /** When the position was read, so a renderer can tick on from it. */
  fetchedAt: number;
  deviceId?: string;
  deviceName?: string;
  volumePercent?: number;
  shuffle: boolean;
  repeat: 'off' | 'track' | 'context';
};

type PlaybackObject = {
  device?: DeviceObject | null;
  context?: { uri?: string } | null;
  is_playing?: boolean;
  progress_ms?: number | null;
  shuffle_state?: boolean;
  repeat_state?: string;
  item?: {
    uri?: string;
    name?: string;
    duration_ms?: number;
    artists?: { name?: string }[];
    album?: { images?: ImageObject[] } | null;
    // Podcast episodes carry their art directly and have a `show`, not artists.
    images?: ImageObject[];
    show?: { name?: string; publisher?: string } | null;
  } | null;
};

function toPlayback(json: PlaybackObject): SpotifyPlayback {
  const item = json.item ?? undefined;
  return {
    contextUri: json.context?.uri ?? undefined,
    trackUri: item?.uri,
    trackName: item?.name,
    artists: artistNames(item?.artists) ?? item?.show?.name,
    imageUrl: cover(item?.album?.images) ?? cover(item?.images),
    isPlaying: Boolean(json.is_playing),
    position: json.progress_ms ?? 0,
    duration: item?.duration_ms ?? 0,
    fetchedAt: Date.now(),
    deviceId: json.device?.id ?? undefined,
    deviceName: json.device?.name,
    volumePercent: json.device?.volume_percent ?? undefined,
    shuffle: Boolean(json.shuffle_state),
    repeat:
      json.repeat_state === 'track' || json.repeat_state === 'context'
        ? json.repeat_state
        : 'off'
  };
}

/**
 * The current session, or undefined when there is none — no device active,
 * nothing playing, nothing paused mid-track. `additional_types=episode` is what
 * makes a podcast come back as an item instead of a null; without it a paused
 * episode is indistinguishable from silence.
 */
export async function fetchSpotifyPlayback(
  accessToken: string
): Promise<SpotifyPlayback | undefined> {
  const json = await spPlayer<PlaybackObject>(
    '/me/player?additional_types=track,episode',
    accessToken
  );
  if (!json?.device && !json?.item) return undefined;
  return toPlayback(json);
}

const deviceQuery = (deviceId?: string) =>
  deviceId ? `?device_id=${encodeURIComponent(deviceId)}` : '';

/**
 * Play something. A `track` or `episode` uri is passed as the thing to play;
 * everything else — a playlist, an album, an artist — is a *context*, which is
 * what makes Spotify queue the whole of it and carry on afterwards.
 *
 * With no `uri` this resumes whatever was paused, which is a different call in
 * spirit and the same one on the wire.
 */
export async function startSpotifyPlayback(
  accessToken: string,
  options: { uri?: string; deviceId?: string; positionMs?: number } = {}
): Promise<void> {
  const { uri, deviceId, positionMs } = options;
  const ref = uri ? parseSpotifyRef(uri) : undefined;
  const single = ref?.type === 'track' || ref?.type === 'episode';
  const body = !ref
    ? undefined
    : single
      ? { uris: [ref.uri], position_ms: positionMs ?? 0 }
      : { context_uri: ref.uri, position_ms: positionMs ?? 0 };
  await spPlayer(`/me/player/play${deviceQuery(deviceId)}`, accessToken, {
    method: 'PUT',
    body
  });
}

export async function pauseSpotifyPlayback(
  accessToken: string,
  deviceId?: string
): Promise<void> {
  await spPlayer(`/me/player/pause${deviceQuery(deviceId)}`, accessToken, {
    method: 'PUT'
  });
}

export async function skipSpotifyTrack(
  accessToken: string,
  direction: 'next' | 'previous',
  deviceId?: string
): Promise<void> {
  await spPlayer(`/me/player/${direction}${deviceQuery(deviceId)}`, accessToken, {
    method: 'POST'
  });
}

export async function seekSpotifyPlayback(
  accessToken: string,
  positionMs: number,
  deviceId?: string
): Promise<void> {
  const device = deviceId ? `&device_id=${encodeURIComponent(deviceId)}` : '';
  await spPlayer(
    `/me/player/seek?position_ms=${Math.max(0, Math.round(positionMs))}${device}`,
    accessToken,
    { method: 'PUT' }
  );
}

/**
 * Volume on the *device*, 0–100. Only some devices accept it — Spotify answers
 * 403 for the ones that do not, which is why this swallows a scope error rather
 * than letting a slider throw.
 */
export async function setSpotifyVolume(
  accessToken: string,
  percent: number,
  deviceId?: string
): Promise<void> {
  const clamped = Math.min(100, Math.max(0, Math.round(percent)));
  const device = deviceId ? `&device_id=${encodeURIComponent(deviceId)}` : '';
  try {
    await spPlayer(
      `/me/player/volume?volume_percent=${clamped}${device}`,
      accessToken,
      { method: 'PUT' }
    );
  } catch (err) {
    if (err instanceof SpotifyAuthError || err instanceof SpotifyPremiumError) {
      throw err;
    }
    console.error('[spotify] volume not accepted by device', err);
  }
}

/**
 * Move the session onto a device — the "listening on…" switch in the Spotify
 * app. `play: false` moves it without starting anything, which is what a
 * freshly registered SDK device wants: be the destination, stay quiet until a
 * tile is actually un-muted.
 */
export async function transferSpotifyPlayback(
  accessToken: string,
  deviceId: string,
  play = false
): Promise<void> {
  await spPlayer('/me/player', accessToken, {
    method: 'PUT',
    body: { device_ids: [deviceId], play }
  });
}
