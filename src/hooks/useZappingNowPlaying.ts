import { useMemo, useSyncExternalStore } from 'react';
import {
  fetchZappingNowPlaying,
  zappingAliasIndex,
  zappingTrackOf,
  ZappingChannel,
  ZappingNowPlaying,
  ZappingProgram
} from '@/lib/zapping';
import { useZappingChannels, zappingSlug } from './useZappingChannels';

/** How long to wait before trying again after a failed fetch. */
const RETRY_MS = 60 * 1000;

/**
 * One poll loop shared by every mounted consumer: the payload covers all 179
 * channels at once, so there is nothing per-component to fetch. The loop only
 * runs while something is listening, and the last answer is kept so a remount
 * (StrictMode's included) paints from it instead of re-fetching.
 */
let snapshot: ZappingNowPlaying | undefined;
let timer: ReturnType<typeof setTimeout> | undefined;
let inFlight = false;
const listeners = new Set<() => void>();

const emit = () => listeners.forEach(listener => listener());

async function poll() {
  if (inFlight) return;
  inFlight = true;
  let wait = RETRY_MS;
  try {
    snapshot = await fetchZappingNowPlaying();
    wait = snapshot.nextUpdate;
    emit();
  } catch (err) {
    console.error('[zapping] now-playing fetch failed', err);
  } finally {
    inFlight = false;
    // A listener may have left while the request was in flight; scheduling the
    // next tick only when someone is still watching is what stops the loop.
    if (listeners.size) timer = setTimeout(poll, wait);
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1 && !timer) void poll();
  return () => {
    listeners.delete(listener);
    if (!listeners.size && timer) {
      clearTimeout(timer);
      timer = undefined;
    }
  };
}

const getSnapshot = () => snapshot;
/** The server renders nothing live; the first client tick fills it in. */
const getServerSnapshot = () => undefined;

export type ZappingNowPlayingView = {
  /** What each Zapping source slug is airing right now. */
  nowBySlug: Map<string, ZappingProgram>;
  /** The "Más vistos" ranking, best first, resolved to catalogue channels. */
  topChannels: ZappingChannel[];
};

/**
 * The live "now playing" per channel and the most-viewed ranking, both from the
 * single unauthenticated `nowplaying` call, re-polled on the interval Zapping
 * asks for (~60s).
 */
export function useZappingNowPlaying(): ZappingNowPlayingView {
  const nowPlaying = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );
  const { channels } = useZappingChannels();

  return useMemo(() => {
    const nowBySlug = new Map<string, ZappingProgram>();
    if (!nowPlaying) return { nowBySlug, topChannels: [] };

    const { schedule, topChannels: aliases } = nowPlaying;
    for (const channel of channels) {
      const entry =
        schedule[channel.image] ?? schedule[zappingTrackOf(channel) ?? ''];
      if (entry?.now) nowBySlug.set(zappingSlug(channel), entry.now);
    }

    const byAlias = zappingAliasIndex(channels);
    const seen = new Set<number>();
    const topChannels: ZappingChannel[] = [];
    for (const alias of aliases) {
      const channel = byAlias.get(alias);
      // An alias can name a channel this account's catalogue doesn't carry, and
      // the ranking is per-signal, so the same channel can rank twice.
      if (!channel || seen.has(channel.id)) continue;
      seen.add(channel.id);
      topChannels.push(channel);
    }
    return { nowBySlug, topChannels };
  }, [nowPlaying, channels]);
}
