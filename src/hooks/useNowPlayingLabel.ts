'use client';
import { useCallback } from 'react';
import { SourceType } from '../sources';
import { useZappingNowPlaying } from './useZappingNowPlaying';

/**
 * What a channel is showing right now, in one line.
 *
 * Zapping's comes from the live EPG, keyed by slug so a channel starred into
 * Favourites keeps saying what is on it there too; every other catalogue carries
 * its own on the source (YouTube puts the stream's title there). Shared by the
 * picker's rows and the zapping reel's peek strips, so the two can never end up
 * naming the same programme differently.
 */
export function useNowPlayingLabel() {
  const { nowBySlug } = useZappingNowPlaying();
  return useCallback(
    (source?: SourceType) =>
      source ? (nowBySlug.get(source.slug)?.title ?? source.description) : undefined,
    [nowBySlug]
  );
}
