'use client';
import { useCallback, useMemo } from 'react';
import useLocalStorageState from 'use-local-storage-state';
import {
  fetchSpotifyOembed,
  parseSpotifyRef,
  spotifyFallbackName,
  SpotifyRef
} from '../../lib/spotify';
import { SourceType } from '../sources';

/**
 * One saved Spotify item. The name and the cover come from oEmbed at the moment
 * it was added and are kept, not re-fetched: they are what the picker's row
 * shows, and a playlist does not get renamed often enough to pay for a request
 * per row on every load.
 */
export type SpotifyItem = {
  uri: string;
  name?: string;
  imageUrl?: string;
};

/**
 * Playlists, albums and shows pasted in by hand. No feed knows about them — the
 * embed plays whatever uri it is handed and the app has no Spotify account to
 * ask — so this list is the whole catalogue for the tab.
 */
function useStoredSpotifyItems() {
  return useLocalStorageState<SpotifyItem[]>('_tele_spotify_items_', {
    defaultValue: []
  });
}

export function spotifySlug(ref: SpotifyRef) {
  return `custom_spotify_${ref.type}_${ref.id}`;
}

export function spotifySource(item: SpotifyItem): SourceType {
  const ref = parseSpotifyRef(item.uri);
  return {
    slug: ref ? spotifySlug(ref) : `custom_spotify_${item.uri}`,
    name: item.name ?? (ref ? spotifyFallbackName(ref) : item.uri),
    imageUrl: item.imageUrl,
    spotifyUri: item.uri
  };
}

export function useCustomSpotifyItems() {
  const [items, setItems] = useStoredSpotifyItems();

  /**
   * Saves whatever was pasted and hands back the source to play. The name and
   * cover land later: the tile only needs the uri, so nothing waits on oEmbed —
   * and if it never answers, the item stays on its fallback name.
   */
  const addItem = useCallback(
    (input: string): SourceType | undefined => {
      const ref = parseSpotifyRef(input);
      if (!ref) return undefined;
      const item: SpotifyItem = { uri: ref.uri };
      setItems(current =>
        current.some(saved => saved.uri === ref.uri)
          ? current
          : [...current, item]
      );
      fetchSpotifyOembed(ref)
        .then(({ name, imageUrl }) => {
          if (!name && !imageUrl) return;
          setItems(current =>
            current.map(saved =>
              saved.uri === ref.uri ? { ...saved, name, imageUrl } : saved
            )
          );
        })
        .catch(err => console.error('[spotify] oembed lookup failed', err));
      return spotifySource(item);
    },
    [setItems]
  );

  const removeItem = useCallback(
    (uri: string) => setItems(current => current.filter(it => it.uri !== uri)),
    [setItems]
  );

  return { items, addItem, removeItem };
}

/** The saved items as sources, ready for the picker's list. */
export function useSpotifySources(): SourceType[] {
  const { items } = useCustomSpotifyItems();
  return useMemo(() => items.map(spotifySource), [items]);
}
