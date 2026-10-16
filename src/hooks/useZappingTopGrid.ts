import { useMemo, useRef } from 'react';
import { SourceType } from '../sources';
import { SourceNode } from '../types/Monitor';
import { useZappingSources, zappingSlug } from './useZappingChannels';
import { useZappingNowPlaying } from './useZappingNowPlaying';

/**
 * The tiles of the "Lo más visto" wall: the top `count` of Zapping's ranking.
 *
 * The ranking is re-polled every minute and reshuffles, but a tile that moves
 * reloads its stream, so a channel keeps its place for as long as it stays in
 * the top `count`; one that drops out hands its place to the one coming in.
 * Fullscreen freezes the wall altogether, so the channel being watched can't
 * be swapped out from under it — the same rules as the YouTube wall (see
 * `useYoutubeGridSources`).
 */
export function useZappingTopGridSources({
  count,
  frozen = false
}: {
  count: number;
  frozen?: boolean;
}) {
  const { topChannels } = useZappingNowPlaying();
  const zappingSources = useZappingSources();

  const top = useMemo(() => {
    const bySlug = new Map(zappingSources.map(source => [source.slug, source]));
    return topChannels
      .map(channel => bySlug.get(zappingSlug(channel)))
      .filter((source): source is SourceType => !!source)
      .slice(0, count);
  }, [topChannels, zappingSources, count]);

  const placesRef = useRef<string[]>([]);
  const nodes = useMemo<SourceNode[]>(() => {
    const bySlug = new Map(top.map(source => [source.slug, source]));
    const incoming = top
      .map(source => source.slug)
      .filter(slug => !placesRef.current.includes(slug));
    // Each place keeps its channel while it still ranks, and the newcomers
    // take the places the fallen ones leave, in ranking order.
    const places = placesRef.current
      .map(slug => (bySlug.has(slug) ? slug : incoming.shift()))
      .filter((slug): slug is string => !!slug);
    placesRef.current = [...places, ...incoming];
    return placesRef.current.map(slug => ({
      sourceSlug: slug,
      source: bySlug.get(slug),
      uuid: slug
    }));
  }, [top]);

  const frozenRef = useRef<SourceNode[] | undefined>(undefined);
  if (!frozen) frozenRef.current = undefined;
  else frozenRef.current ??= nodes;
  return frozenRef.current ?? nodes;
}
