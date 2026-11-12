import { DROPPED_TAGS, PLAYLIST_TAGS } from './clip';

/**
 * A rewindable stream caught up to live, as a finished playlist.
 *
 * Zapping's startTime playlist (Wowza's DVR, under `/dvr/`) ends a steady ten
 * segments, a minute, short of live, and the live playlist lists only the
 * last five, half a minute: neither holds the minute that just happened. The
 * DVR serves those segments all the same, named like the rest by their
 * sequence number, which is the same in both playlists. So the startTime
 * playlist is carried on up to the live playlist's last segment, and the
 * whole is played as a VOD playlist from a blob url, which doesn't move under
 * the editor as it is worked on.
 */
export type HlsSnapshot = {
  /** The playlist, a blob url: revoke it once done with it. */
  url: string;
  /** Unix seconds at its end: live, when it was taken. */
  endsAt: number;
  /** Its last segment's sequence number, to tell how far live has moved on. */
  lastSequence: number;
  /** The live media playlist, to ask that of (see `liveLead`). */
  liveMediaUrl: string;
};

type Segment = { tags: string[]; duration: number; uri: string };
type MediaPlaylist = {
  url: string;
  head: string[];
  targetDuration: number;
  mediaSequence: number;
  segments: Segment[];
};

const fetchText = async (url: string, signal?: AbortSignal) => {
  const res = await fetch(url, { cache: 'no-store', signal });
  if (!res.ok) throw new Error(`La señal respondió ${res.status}`);
  return { url: res.url, text: await res.text() };
};

const lines = (text: string) =>
  text
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean);

/** URIs made absolute, in tags (`URI="…"`) as well as segments. */
const absolute = (uri: string, base: string) => new URL(uri, base).href;
const absoluteTag = (tag: string, base: string) =>
  tag.replace(/URI="([^"]+)"/g, (_, uri) => `URI="${absolute(uri, base)}"`);

const parseMedia = (text: string, url: string): MediaPlaylist => {
  const head: string[] = [];
  const segments: Segment[] = [];
  let targetDuration = 0;
  let mediaSequence = 0;
  let tags: string[] = [];
  let duration = 0;
  for (const line of lines(text)) {
    if (line.startsWith('#EXT-X-TARGETDURATION:')) {
      targetDuration = Number(line.split(':')[1]);
      head.push(line);
    } else if (line.startsWith('#EXT-X-MEDIA-SEQUENCE:')) {
      mediaSequence = Number(line.split(':')[1]);
    } else if (DROPPED_TAGS.some(tag => line.startsWith(tag))) {
      continue;
    } else if (PLAYLIST_TAGS.some(tag => line.startsWith(tag))) {
      head.push(line);
    } else if (line.startsWith('#')) {
      if (line.startsWith('#EXTINF:')) duration = parseFloat(line.slice(8));
      tags.push(absoluteTag(line, url));
    } else {
      segments.push({ tags, duration, uri: absolute(line, url) });
      tags = [];
      duration = 0;
    }
  }
  return { url, head, targetDuration, mediaSequence, segments };
};

/**
 * The media playlist `url` leads to: itself, or a master's highest-bandwidth
 * rendition. Undefined for a master whose audio or captions are playlists of
 * their own, which one media playlist can't stand for.
 */
const topMedia = async (url: string, signal?: AbortSignal) => {
  const playlist = await fetchText(url, signal);
  if (!playlist.text.includes('#EXT-X-STREAM-INF')) {
    return parseMedia(playlist.text, playlist.url);
  }
  const all = lines(playlist.text);
  if (all.some(line => line.startsWith('#EXT-X-MEDIA:') && /URI="/.test(line))) {
    return undefined;
  }
  let best: string | undefined;
  let bandwidth = -1;
  all.forEach((line, i) => {
    if (!line.startsWith('#EXT-X-STREAM-INF')) return;
    const bw = Number(/BANDWIDTH=(\d+)/.exec(line)?.[1] ?? 0);
    const uri = all[i + 1];
    if (uri && !uri.startsWith('#') && bw > bandwidth) {
      bandwidth = bw;
      best = absolute(uri, playlist.url);
    }
  });
  if (!best) return undefined;
  const media = await fetchText(best, signal);
  return parseMedia(media.text, media.url);
};

const lastSequenceOf = (p: MediaPlaylist) =>
  p.mediaSequence + p.segments.length - 1;

/**
 * How long the segments of `playlists` are, as far as their last few tell:
 * the length most of them have, as there may be a short one where something
 * was spliced in. Not the target duration, which is only an upper bound (7
 * for segments of 6.006 s, say). Undefined if they are all over the place.
 */
const typicalDuration = (...playlists: MediaPlaylist[]) => {
  const recent = playlists.flatMap(p =>
    p.segments.slice(-30).map(s => s.duration.toFixed(3))
  );
  const counts = new Map<string, number>();
  for (const d of recent) counts.set(d, (counts.get(d) ?? 0) + 1);
  const [duration, count] = Array.from(counts).reduce(
    (best, entry) => (entry[1] > best[1] ? entry : best),
    ['0', 0]
  );
  return count >= recent.length * 0.8 ? Number(duration) : undefined;
};

/**
 * Segment `sequence`'s URI, named after `known`, segment `knownSequence`: the
 * same but for the number it ends in. Undefined if `known` doesn't end in it.
 */
const uriFor = (known: string, knownSequence: number, sequence: number) => {
  const url = new URL(known);
  const match = new RegExp(`${knownSequence}(\\.[a-z0-9]+)$`, 'i').exec(
    url.pathname
  );
  if (!match) return undefined;
  url.pathname =
    url.pathname.slice(0, match.index) + String(sequence) + match[1];
  return url.href;
};

/**
 * Carries `dvr` on from its end up to `live`'s, as far as it can tell what
 * the segments in between are called and how long they are.
 */
const carryOn = (dvr: MediaPlaylist, live: MediaPlaylist): Segment[] => {
  const last = dvr.segments[dvr.segments.length - 1];
  const from = lastSequenceOf(dvr) + 1;
  const to = lastSequenceOf(live);
  if (!last || to < from) return [];
  // Encrypted or fragmented MP4, a segment can't be made out of a name alone.
  const plain = (p: MediaPlaylist) =>
    p.segments.every(s =>
      s.tags.every(t => !/^#EXT-X-(KEY|MAP|BYTERANGE)/.test(t))
    );
  if (!plain(dvr) || !plain(live)) return [];
  // Ones the live playlist doesn't list (any more) are taken to be as long as
  // the rest, which only holds for a stream whose segments all are.
  const typical = typicalDuration(dvr, live);
  const added: Segment[] = [];
  for (let sequence = from; sequence <= to; sequence++) {
    const listed = live.segments[sequence - live.mediaSequence];
    const duration = listed?.duration ?? typical;
    if (duration === undefined) break;
    const uri = uriFor(last.uri, lastSequenceOf(dvr), sequence);
    if (!uri) break;
    added.push({ tags: [`#EXTINF:${duration.toFixed(6)},`], duration, uri });
  }
  return added;
};

/**
 * The stream `dvrUrl` plays, carried on up to where `liveUrl` is now (see
 * `HlsSnapshot`). Undefined for a stream whose renditions are laid out in a
 * way this doesn't handle, to be played from `dvrUrl` as it is instead.
 */
export async function snapshotToLive(
  dvrUrl: string,
  liveUrl: string,
  signal?: AbortSignal
): Promise<HlsSnapshot | undefined> {
  const [dvr, live] = await Promise.all([
    topMedia(dvrUrl, signal),
    topMedia(liveUrl, signal)
  ]);
  const takenAt = Date.now() / 1000;
  if (!dvr?.segments.length || !live?.segments.length) return undefined;

  const added = carryOn(dvr, live);
  const segments = [...dvr.segments, ...added];
  const lastSequence = dvr.mediaSequence + segments.length - 1;
  // Not carried all the way, its end is as far behind live as what is missing.
  const short = Math.max(0, lastSequenceOf(live) - lastSequence);
  const text = [
    '#EXTM3U',
    ...dvr.head,
    '#EXT-X-PLAYLIST-TYPE:VOD',
    `#EXT-X-MEDIA-SEQUENCE:${dvr.mediaSequence}`,
    ...segments.flatMap(s => [...s.tags, s.uri]),
    '#EXT-X-ENDLIST'
  ].join('\n');
  return {
    url: URL.createObjectURL(
      new Blob([text], { type: 'application/vnd.apple.mpegurl' })
    ),
    endsAt:
      takenAt - short * (typicalDuration(live) ?? live.targetDuration),
    lastSequence,
    liveMediaUrl: live.url
  };
}

/** How many seconds live has moved on past `snapshot`'s end. */
export async function liveLead(snapshot: HlsSnapshot, signal?: AbortSignal) {
  const { text, url } = await fetchText(snapshot.liveMediaUrl, signal);
  const live = parseMedia(text, url);
  let lead = 0;
  const last = lastSequenceOf(live);
  for (let sequence = snapshot.lastSequence + 1; sequence <= last; sequence++) {
    lead +=
      live.segments[sequence - live.mediaSequence]?.duration ??
      typicalDuration(live) ??
      live.targetDuration;
  }
  return lead;
}
