'use client';
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo
} from 'react';
import useLocalStorageState from 'use-local-storage-state';
import {
  Channel,
  groupChannelsByCountry,
  TvCountryGroup
} from '../components/SelectSource/tvChannels';
import { getSource, SourceType } from '../sources';
import { useYoutubeLiveSources } from './useYoutubeLiveSubs';
import { useZappingSources } from './useZappingChannels';

/** Matches the revalidate window the /api/channels route serves on. */
const TV_TTL_MS = 60 * 60 * 1000;
const RETRY_MS = 60 * 1000;

type CachedChannels = { channels: Channel[]; fetchedAt: number };

// Module-level, as in the Zapping and YouTube catalogues: one request per page
// load however many components mount, and no tight retry loop when it fails.
let tvInFlight: Promise<Channel[]> | undefined;
let tvLastAttempt = 0;

async function fetchTvChannels(): Promise<Channel[]> {
  const response = await fetch('/api/channels');
  if (!response.ok)
    throw new Error(`/api/channels responded with ${response.status}`);
  const { channels }: { channels: Channel[] } = await response.json();
  return channels;
}

/**
 * The TV feed, cached in localStorage and stale-while-revalidate. Cached rather
 * than re-fetched because it is what resolves every `custom_*` slug a saved
 * grid holds: without it a reload would stare at empty tiles until the request
 * came back, and at nothing at all offline.
 */
function useTvGroups(): TvCountryGroup[] {
  const [cache, setCache] = useLocalStorageState<CachedChannels | undefined>(
    'tvChannels',
    { defaultValue: undefined }
  );

  const isStale = !cache || Date.now() - cache.fetchedAt > TV_TTL_MS;

  useEffect(() => {
    if (!isStale) return;
    if (Date.now() - tvLastAttempt < RETRY_MS) return;
    tvLastAttempt = Date.now();
    // Not gated on unmount: the result goes to a shared cache, so an in-flight
    // fetch should still land if the component that started it went away
    // (which it always does on StrictMode's double-mount).
    tvInFlight = tvInFlight ?? fetchTvChannels();
    tvInFlight
      .then(channels => {
        // An empty feed is not worth caching over a good copy for an hour.
        if (channels.length) setCache({ channels, fetchedAt: Date.now() });
      })
      .catch(err => console.error('[tv] channel list fetch failed', err))
      .finally(() => {
        tvInFlight = undefined;
      });
  }, [isStale, setCache]);

  return useMemo(() => groupChannelsByCountry(cache?.channels ?? []), [cache]);
}

type Catalog = {
  /** Everything the live feeds are offering right now, keyed by slug. */
  bySlug: Map<string, SourceType>;
  /** The TV feed grouped for the picker; empty until the fetch lands. */
  tvGroups: TvCountryGroup[];
};

const SourceCatalogContext = createContext<Catalog>({
  bySlug: new Map(),
  tvGroups: []
});

/**
 * The live catalogues — the TV feed, the Zapping channel list and the YouTube
 * subscriptions that are on air — gathered in one place so any slug can be
 * looked up against the freshest copy of its channel. This is what replaced the
 * `_tele_custom_source_` registry: nothing is written to storage to be read
 * back later, the feeds are simply consulted where they are needed.
 *
 * Mounted once, in ClientProviders.
 */
export function SourceCatalogProvider({ children }: PropsWithChildren) {
  const tvGroups = useTvGroups();
  const zappingSources = useZappingSources();
  const youtubeSources = useYoutubeLiveSources();

  const bySlug = useMemo(() => {
    const map = new Map<string, SourceType>();
    tvGroups.forEach(group =>
      group.categories.forEach(category =>
        category.sources.forEach(source => map.set(source.slug, source))
      )
    );
    zappingSources.forEach(source => map.set(source.slug, source));
    youtubeSources.forEach(source => map.set(source.slug, source));
    return map;
  }, [tvGroups, zappingSources, youtubeSources]);

  const value = useMemo(() => ({ bySlug, tvGroups }), [bySlug, tvGroups]);

  return (
    <SourceCatalogContext.Provider value={value}>
      {children}
    </SourceCatalogContext.Provider>
  );
}

export function useSourceCatalog() {
  return useContext(SourceCatalogContext);
}

/**
 * Turns what a grid node stores back into a source.
 *
 * The live catalogue comes first, so a Zapping channel whose stream url moved
 * on, or a YouTube channel that has since started a different stream, is
 * re-pointed on its own — no stored copy to keep in step. The node's own
 * snapshot covers everything the feeds are not carrying right now: a screen
 * saved months ago, one shared from someone else's account, a Twitch channel
 * added by hand. Built-ins resolve from the static table, which is where they
 * live and the only place their React bits survive.
 */
export function useResolveSource() {
  const { bySlug } = useSourceCatalog();
  return useCallback(
    (slug?: string, embedded?: SourceType): SourceType | undefined => {
      if (!slug) return embedded;
      return bySlug.get(slug) ?? embedded ?? getSource(slug);
    },
    [bySlug]
  );
}
