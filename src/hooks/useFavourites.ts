'use client';
import { useCallback, useEffect } from 'react';
import useLocalStorageState from 'use-local-storage-state';
import { serializableSource, SourceType } from '../sources';

/** The registry favourites used to live in, as a flag on each stored source. */
const LEGACY_CUSTOM_SOURCES_KEY = '_tele_custom_source_';

// Module-level: the legacy key is read and dropped once per page load, however
// many components hold the hook.
let hasMigrated = false;

function readLegacyFavourites(): SourceType[] {
  try {
    const raw = window.localStorage.getItem(LEGACY_CUSTOM_SOURCES_KEY);
    if (!raw) return [];
    const stored: (SourceType & { favourite?: boolean })[] = JSON.parse(raw);
    if (!Array.isArray(stored)) return [];
    return stored
      .filter(source => source?.slug && source.favourite)
      .map(serializableSource);
  } catch {
    return [];
  }
}

/**
 * The channels the user starred. Stored whole rather than as slugs: a favourite
 * outlives the list it came from — a YouTube channel is only in the live feed
 * while it is on air — and the tab has something to draw before any feed has
 * answered. `useResolveSource` still prefers the catalogue when it holds the
 * same slug, so a stored copy never goes stale on screen.
 */
export function useFavourites() {
  const [favourites, setFavourites, favouritesMeta] = useLocalStorageState<
    SourceType[]
  >('_tele_favourites_', { defaultValue: [] });

  // Favourites were a `favourite` flag on the custom-source registry, which no
  // longer exists; carry them over and take the registry with us.
  useEffect(() => {
    if (hasMigrated) return;
    hasMigrated = true;
    const legacy = readLegacyFavourites();
    window.localStorage.removeItem(LEGACY_CUSTOM_SOURCES_KEY);
    if (!legacy.length) return;
    setFavourites(current => {
      const bySlug = new Map(current.map(fav => [fav.slug, fav]));
      legacy.forEach(fav => {
        if (!bySlug.has(fav.slug)) bySlug.set(fav.slug, fav);
      });
      return Array.from(bySlug.values());
    });
  }, [setFavourites]);

  const isFavourite = useCallback(
    (slug: string) => favourites.some(fav => fav.slug === slug),
    [favourites]
  );

  const toggleFavourite = useCallback(
    (source: SourceType) => {
      setFavourites(current =>
        current.some(fav => fav.slug === source.slug)
          ? current.filter(fav => fav.slug !== source.slug)
          : [...current, serializableSource(source)]
      );
    },
    [setFavourites]
  );

  return { favourites, isFavourite, toggleFavourite, favouritesMeta };
}
