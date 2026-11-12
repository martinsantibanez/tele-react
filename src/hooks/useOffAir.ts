import { useCallback, useMemo } from 'react';
import {
  isPastGrid,
  slotCount
} from '../components/Monitor/predefinedLayouts';
import { LiveOnlyView } from '../context/TeleContext';
import { DisplayConfig, DisplayMode, SourceNode } from '../types/Monitor';
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

/**
 * The grid tiles that keep their place and number but are not drawn: regular
 * channels past the grid's end, and the live-only ones as `view` says — off
 * air ones for `live`, every one of them for `hide`, none for `all`.
 */
export function hiddenTiles(
  config: DisplayConfig,
  sources: SourceNode[],
  isOffAir: (node?: SourceNode) => boolean,
  view: LiveOnlyView
) {
  const hidden = new Set<number>();
  if (config.mode !== DisplayMode.Grid) return hidden;
  const isHiddenLiveOnly = (node?: SourceNode) =>
    view === 'hide' ? !!node?.liveOnly : view === 'live' && isOffAir(node);
  sources.slice(0, slotCount(config, sources)).forEach((node, idx) => {
    if (isPastGrid(config, node, idx) || isHiddenLiveOnly(node))
      hidden.add(idx);
  });
  return hidden;
}
