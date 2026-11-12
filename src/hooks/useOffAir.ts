import { useCallback, useMemo } from 'react';
import { SourceNode } from '../types/Monitor';
import { useYoutubeLiveSources, YOUTUBE_LIVE_SLUG_PREFIX } from './useYoutubeLiveSubs';

/**
 * Whether a channel is one that can go off air — and so one a tile can be set
 * to show only while it is on. A YouTube live is the one there is a feed of
 * being on or not; everything else is on all the time, as far as the app can
 * tell.
 */
export const canBeOffAir = (slug?: string) =>
  !!slug?.startsWith(YOUTUBE_LIVE_SLUG_PREFIX);

/**
 * Tells a `liveOnly` tile whose channel is not on air right now. Such a tile
 * keeps its place in the screen, and its number, and is simply not drawn. Not
 * signed in to YouTube counts as off air: there is nothing to show either way.
 */
export function useOffAir() {
  const youtube = useYoutubeLiveSources();
  const onAir = useMemo(() => new Set(youtube.map(src => src.slug)), [youtube]);
  return useCallback(
    (node?: SourceNode) =>
      !!node?.liveOnly &&
      canBeOffAir(node.sourceSlug) &&
      !onAir.has(node.sourceSlug!),
    [onAir]
  );
}
