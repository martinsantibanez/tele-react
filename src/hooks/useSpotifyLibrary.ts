'use client';
import { useEffect, useMemo } from 'react';
import useLocalStorageState from 'use-local-storage-state';
import {
  SpotifyAuthError,
  SpotifyLibrary,
  SpotifyLibraryItem,
  fetchSpotifyLibrary,
  parseSpotifyRef
} from '../../lib/spotify';
import { SourceType } from '../sources';
import { spotifySlug, useSpotifySources } from './useCustomSpotifyItems';
import { useSpotifyAuth } from './useSpotifyAuth';

/**
 * A connected account's recently played mixes, playlists, albums, podcasts and
 * top artists — the Spotify tab's catalogue once the user logs in, where before
 * there was only what they had pasted in by hand.
 *
 * A library changes on a human timescale, so an hour-old copy is a good one:
 * cached in localStorage, stale-while-revalidate, and only re-fetched when the
 * tab is opened with the cache past its TTL. The recent row moves faster than
 * that and is refreshed on the same clock anyway — an hour-old idea of what you
 * were listening to is still a list of things you were listening to.
 */
const TTL_MS = 60 * 60 * 1000;
const RETRY_MS = 60 * 1000;

type CachedLibrary = SpotifyLibrary & { fetchedAt: number };

// Module-level so multiple mounting components (and StrictMode's double-mount)
// don't stampede the API, and don't retry in a tight loop when it's down.
let inFlight: Promise<SpotifyLibrary | undefined> | undefined;
let lastAttempt = 0;

export function useSpotifyLibrary() {
  const { isConnected, getAccessToken } = useSpotifyAuth();
  const [cache, setCache] = useLocalStorageState<CachedLibrary | undefined>(
    'spotifyLibrary',
    { defaultValue: undefined }
  );

  const stale = !cache || Date.now() - cache.fetchedAt > TTL_MS;

  useEffect(() => {
    if (!isConnected || !stale) return;
    if (Date.now() - lastAttempt < RETRY_MS) return;
    lastAttempt = Date.now();
    inFlight =
      inFlight ??
      (async () => {
        const token = await getAccessToken();
        if (!token) return undefined;
        try {
          return await fetchSpotifyLibrary(token);
        } catch (err) {
          // The token had expired under us; one retry against a fresh one.
          if (!(err instanceof SpotifyAuthError)) throw err;
          const fresh = await getAccessToken(true);
          if (!fresh) return undefined;
          return fetchSpotifyLibrary(fresh);
        }
      })();
    inFlight
      .then(library => {
        // `undefined` means the fetch never ran (no token / transient
        // failure). Caching that as an empty library would blank the tab for a
        // full hour; leaving the cache stale lets the 60s retry have a go.
        if (library) setCache({ ...library, fetchedAt: Date.now() });
      })
      .catch(err => console.error('[spotify] library fetch failed', err))
      .finally(() => {
        inFlight = undefined;
      });
  }, [isConnected, stale, getAccessToken, setCache]);

  // A disconnected account has no library, and the last one read must not
  // outlive the session it was read from.
  const items = isConnected ? (cache?.items ?? []) : [];

  return {
    items,
    isConnected,
    /** Connected, nothing listed yet, and no cached copy to show meanwhile. */
    isLoading: isConnected && !cache,
    /** Connected on a grant issued before `user-read-recently-played`. */
    recentDenied: isConnected && !!cache?.recentDenied
  };
}

const kindLabels: Record<SpotifyLibraryItem['kind'], string> = {
  playlist: 'Playlist',
  album: 'Álbum',
  show: 'Podcast',
  artist: 'Artista'
};

/**
 * A library entry as a source. The slug is the same `custom_spotify_<type>_<id>`
 * the pasted items get, deliberately: a playlist added to a layout from the
 * account's list and the same playlist pasted in by hand are one channel, and
 * `categoryOfSlug` sends both to this tab.
 */
export function spotifyLibrarySource(item: SpotifyLibraryItem): SourceType {
  const ref = parseSpotifyRef(item.uri);
  return {
    slug: ref ? spotifySlug(ref) : `custom_spotify_${item.uri}`,
    name: item.name,
    description: item.subtitle
      ? `${kindLabels[item.kind]} · ${item.subtitle}`
      : kindLabels[item.kind],
    imageUrl: item.imageUrl,
    spotifyUri: item.uri
  };
}

/**
 * Library items as sources, each listed once. A playlist can arrive twice from
 * the same section — a saved album is also one of your top artists' — and the
 * first row that listed it wins, so Spotify's own ordering is kept.
 *
 * `drop` takes out slugs another section has already claimed.
 */
function toSources(
  items: SpotifyLibraryItem[],
  drop?: Set<string>
): SourceType[] {
  const bySlug = new Map<string, SourceType>();
  items.forEach(item => {
    const source = spotifyLibrarySource(item);
    if (drop?.has(source.slug) || bySlug.has(source.slug)) return;
    bySlug.set(source.slug, source);
  });
  return Array.from(bySlug.values());
}

/** One of the Spotify tab's headed runs of rows. */
export type SpotifyTabSection = {
  id: string;
  label: string;
  sources: SourceType[];
};

/**
 * The whole Spotify tab, in the three runs it reads as: what was pasted in by
 * hand, then what the account has been playing, then what it has saved.
 *
 * A pasted item that also lives in the library keeps the pasted copy and only
 * that one — it is the one the user can remove, and the row's «Quitar» button
 * has to mean something. The recent run is left to overlap both: it is a list
 * of what was played and when, and a playlist you own and played this morning
 * belongs in it as much as in your library.
 *
 * Empty runs are dropped, so a user who has pasted nothing sees no header for
 * it, and one with a single run gets no headers at all — see the caller.
 */
export function useSpotifyTabSections(): SpotifyTabSection[] {
  const custom = useSpotifySources();
  const { items } = useSpotifyLibrary();
  return useMemo(() => {
    const pasted = new Set(custom.map(source => source.slug));
    // A library cached by an older build has no `section`; it was all library.
    const recent = items.filter(item => item.section === 'recent');
    const saved = items.filter(item => item.section !== 'recent');
    return [
      { id: 'pasted', label: 'Agregados', sources: custom },
      {
        id: 'recent',
        label: 'Escuchado hace poco',
        sources: toSources(recent)
      },
      {
        id: 'library',
        label: 'Tu biblioteca',
        sources: toSources(saved, pasted)
      }
    ].filter(section => section.sources.length);
  }, [custom, items]);
}
