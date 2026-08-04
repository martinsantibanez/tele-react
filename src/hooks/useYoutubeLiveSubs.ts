import { useEffect, useMemo, useRef } from 'react';
import useLocalStorageState from 'use-local-storage-state';
import {
  fetchLiveFromChannels,
  fetchSubscriptions,
  Subscription,
  YoutubeAuthError,
  YoutubeLiveVideo
} from '@/lib/youtube';
import { SourceType } from '../sources';
import { SourceNode } from '../types/Monitor';
import { useYoutubeAuth } from './useYoutubeAuth';

/** Subscriptions change rarely; live status is the only thing polled often. */
const TTL_MS = 12 * 60 * 60 * 1000;
const LIVE_TTL_MS = 5 * 60 * 1000;
const RETRY_MS = 60 * 1000;

type CachedSubs = { subscriptions: Subscription[]; fetchedAt: number };
type CachedLive = { live: YoutubeLiveVideo[]; fetchedAt: number };

// Module-level so multiple mounting components (and StrictMode's double-mount)
// don't stampede the API, and don't retry in a tight loop when it's down.
let subsInFlight: Promise<Subscription[]> | undefined;
let subsLastAttempt = 0;
// `undefined` from the in-flight promise means the fetch could not run (no
// token / transient failure) — distinct from a real, empty "nobody is live".
let liveInFlight: Promise<YoutubeLiveVideo[] | undefined> | undefined;
let liveLastAttempt = 0;

/**
 * Run an API call with the current access token, retrying once against a
 * force-refreshed token if the first attempt 401s (the token had expired).
 */
async function withFreshToken<T>(
  getAccessToken: (force?: boolean) => Promise<string | undefined>,
  call: (token: string) => Promise<T>
): Promise<T | undefined> {
  const token = await getAccessToken();
  if (!token) return undefined;
  try {
    return await call(token);
  } catch (err) {
    if (err instanceof YoutubeAuthError) {
      const fresh = await getAccessToken(true);
      if (!fresh) return undefined;
      return call(fresh);
    }
    throw err;
  }
}

/**
 * The signed-in user's subscribed channels that are live right now. Two caches
 * with independent TTLs, both in localStorage and stale-while-revalidate: the
 * subscription list (12h) rarely changes, live status (5min) is the poll. Not
 * gated on unmount — results land in the shared cache.
 */
export function useYoutubeLiveSubs() {
  const { isConnected, getAccessToken } = useYoutubeAuth();
  const [subsCache, setSubsCache] = useLocalStorageState<
    CachedSubs | undefined
  >('youtubeSubscriptions', { defaultValue: undefined });
  const [liveCache, setLiveCache] = useLocalStorageState<
    CachedLive | undefined
  >('youtubeLive', { defaultValue: undefined });

  const subsStale = !subsCache || Date.now() - subsCache.fetchedAt > TTL_MS;
  const liveStale =
    !liveCache || Date.now() - liveCache.fetchedAt > LIVE_TTL_MS;

  // STEP 1 — subscriptions (cheap, cached for hours).
  useEffect(() => {
    if (!isConnected || !subsStale) return;
    if (Date.now() - subsLastAttempt < RETRY_MS) return;
    subsLastAttempt = Date.now();
    subsInFlight =
      subsInFlight ??
      withFreshToken(getAccessToken, token => fetchSubscriptions(token)).then(
        subs => subs ?? []
      );
    subsInFlight
      .then(subscriptions => {
        if (subscriptions.length || !subsCache) {
          setSubsCache({ subscriptions, fetchedAt: Date.now() });
        }
      })
      .catch(err => console.error('[youtube] subscriptions fetch failed', err))
      .finally(() => {
        subsInFlight = undefined;
      });
  }, [isConnected, subsStale, subsCache, getAccessToken, setSubsCache]);

  const channelIds = useMemo(
    () => (subsCache?.subscriptions ?? []).map(s => s.channelId),
    [subsCache]
  );

  // STEPS 3-4 — which of those channels are live (the frequent poll).
  useEffect(() => {
    if (!isConnected || !channelIds.length || !liveStale) return;
    if (Date.now() - liveLastAttempt < RETRY_MS) return;
    liveLastAttempt = Date.now();
    liveInFlight =
      liveInFlight ??
      withFreshToken(getAccessToken, token =>
        fetchLiveFromChannels(token, channelIds)
      );
    liveInFlight
      .then(live => {
        // Only overwrite the cache with a real result. `undefined` means the
        // fetch never ran (token unavailable / transient failure); caching it
        // as `[]` would hide genuinely-live channels for a full LIVE_TTL_MS.
        // Leaving the cache stale instead lets the 60s RETRY_MS re-attempt.
        if (live) setLiveCache({ live, fetchedAt: Date.now() });
      })
      .catch(err => console.error('[youtube] live fetch failed', err))
      .finally(() => {
        liveInFlight = undefined;
      });
  }, [isConnected, channelIds, liveStale, getAccessToken, setLiveCache]);

  return {
    subscriptions: subsCache?.subscriptions ?? [],
    live: liveCache?.live ?? [],
    isConnected
  };
}

/**
 * Slug keyed on channelId, NOT videoId, deliberately: when a channel ends one
 * stream and starts another the slug is stable, so a user who added it to a
 * layout keeps watching the channel instead of a dead video id.
 */
export const youtubeLiveSlug = (channelId: string) =>
  `custom_yt_live_${channelId}`;

/**
 * Assign a unique, stable slug to every live video. A channel almost always has
 * a single live, which keeps the canonical `custom_yt_live_<channelId>` slug so
 * a saved layout keeps following the channel across stream restarts. When a
 * channel runs several simultaneous lives the channel-keyed slug alone would
 * collide, so the earliest-started stream keeps the canonical slug (the channel
 * "slot") and the rest are disambiguated with their videoId. Both consumers
 * (source list + sync) call this so their slugs always agree.
 */
export function assignLiveSlugs(
  live: YoutubeLiveVideo[]
): Array<YoutubeLiveVideo & { slug: string }> {
  const byChannel = new Map<string, YoutubeLiveVideo[]>();
  for (const v of live) {
    const list = byChannel.get(v.channelId) ?? [];
    list.push(v);
    byChannel.set(v.channelId, list);
  }

  const withSlugs: Array<YoutubeLiveVideo & { slug: string }> = [];
  byChannel.forEach((videos, channelId) => {
    if (videos.length === 1) {
      withSlugs.push({ ...videos[0], slug: youtubeLiveSlug(channelId) });
      return;
    }
    // Deterministic order so the same stream keeps the same slug across polls
    // (the API does not return live videos in a stable order): earliest start
    // first, videoId as a tie-break. The primary (longest-running) stream keeps
    // the canonical channel slot; extras are addressed per-video.
    const sorted = [...videos].sort((a, b) => {
      const at = a.actualStartTime ?? '';
      const bt = b.actualStartTime ?? '';
      if (at !== bt) return at < bt ? -1 : 1;
      return a.videoId < b.videoId ? -1 : 1;
    });
    sorted.forEach((v, i) => {
      withSlugs.push({
        ...v,
        slug:
          i === 0
            ? youtubeLiveSlug(channelId)
            : `${youtubeLiveSlug(channelId)}_${v.videoId}`
      });
    });
  });
  return withSlugs;
}

/**
 * The live subs mapped onto the app's `SourceType`. A saved screen keeps only
 * the slug and a snapshot of the channel, and `useResolveSource` prefers
 * whatever this returns, so a tile pointed at a stream that has since ended
 * picks up the channel's current one by being looked up again.
 */
export function useYoutubeLiveSources(): SourceType[] {
  const { live, subscriptions } = useYoutubeLiveSubs();
  // A live's own thumbnail is a still of the stream, so the channel's mark has
  // to come from the subscription it was found through.
  const avatarByChannel = useMemo(
    () => new Map(subscriptions.map(s => [s.channelId, s.thumbnailUrl])),
    [subscriptions]
  );
  return useMemo(
    () =>
      assignLiveSlugs(live).map(v => ({
        slug: v.slug,
        youtubeVideoId: v.videoId,
        youtubeChatVideoId: v.videoId,
        name: v.channelTitle,
        // The row is named for the channel, so the stream's own title is what
        // tells two of its lives apart — and what it is actually showing.
        description: v.title,
        imageUrl: v.thumbnailUrl,
        logoUrl: avatarByChannel.get(v.channelId),
        fuente: `https://www.youtube.com/channel/${v.channelId}`
      })),
    [live, avatarByChannel]
  );
}

const byChannelTitle = (a: SourceType, b: SourceType) => {
  const an = a.name ?? '';
  const bn = b.name ?? '';
  if (an !== bn) return an < bn ? -1 : 1;
  return a.slug < b.slug ? -1 : 1;
};

/**
 * Feeds the dynamic YouTube layout: every live channel as a grid node. Each
 * node carries its source, so the tiles resolve without anything being
 * registered anywhere — these nodes are derived on every render and never
 * stored.
 *
 * Tiles keep the order the channels were first seen live in, rather than being
 * re-sorted alphabetically on every poll. React moves a keyed child that
 * changed place, and moving an <iframe> in the DOM reloads it — so one channel
 * going live under a name early in the alphabet would restart every player on
 * the wall. Channels join at the end (alphabetically among those arriving
 * together) and one going off air takes its own tile with it, leaving the rest
 * exactly where they are.
 *
 * @param frozen Hold the tiles as they are and ignore the poll entirely. A
 * stream being watched fullscreen should not be pulled from under the viewer:
 * not by the list reordering, not by the channel briefly dropping out of it.
 * The list catches up in full the moment it is let go.
 */
export function useYoutubeGridSources({ frozen = false } = {}) {
  const sources = useYoutubeLiveSources();

  const orderRef = useRef<string[]>([]);
  const ordered = useMemo(() => {
    const bySlug = new Map(sources.map(src => [src.slug, src]));
    const kept = orderRef.current.filter(slug => bySlug.has(slug));
    const known = new Set(kept);
    const added = sources
      .filter(src => !known.has(src.slug))
      .sort(byChannelTitle)
      .map(src => src.slug);
    // Idempotent — re-running it with the order it just produced gives the
    // same order back — so a double render can't shuffle anything.
    orderRef.current = [...kept, ...added];
    return orderRef.current.map(slug => bySlug.get(slug)!);
  }, [sources]);

  const nodes = useMemo<SourceNode[]>(
    () =>
      ordered.map(src => ({
        sourceSlug: src.slug,
        source: src,
        uuid: src.slug
      })),
    [ordered]
  );

  const frozenRef = useRef<SourceNode[] | undefined>(undefined);
  if (!frozen) frozenRef.current = undefined;
  else frozenRef.current ??= nodes;
  const visible = frozenRef.current ?? nodes;

  return { nodes: visible, count: visible.length };
}
