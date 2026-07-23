import { useEffect, useMemo } from 'react';
import useLocalStorageState from 'use-local-storage-state';
import {
  fetchZappingChannels,
  zappingLogoUrl,
  ZappingChannel
} from '@/lib/zapping';
import { canalesZapping } from '../components/SelectSource/ZappingSelector/canales';
import { SourceType } from '../sources';
import { useCustomSources } from './useCustomSources';
import { useZappingLoginToken } from './useZappingConfig';

/** How long a cached catalogue is served without re-fetching. */
const TTL_MS = 12 * 60 * 60 * 1000;

type CachedChannels = {
  channels: Record<string, ZappingChannel>;
  fetchedAt: number;
};

// Several components call `useZappingChannels`; this keeps them from all
// firing the same request on mount (and from retrying it in a tight loop when
// the endpoint is down).
let inFlight: Promise<Record<string, ZappingChannel>> | undefined;
let lastAttempt = 0;
const RETRY_MS = 60 * 1000;

/**
 * The Zapping catalogue, refreshed from their endpoint and cached in
 * localStorage. Stale-while-revalidate: the cached list (or the bundled
 * `canales.ts` snapshot on first run) renders immediately while a fresh copy
 * is fetched in the background.
 */
export function useZappingChannels() {
  const [cache, setCache] = useLocalStorageState<CachedChannels | undefined>(
    'zappingChannels',
    { defaultValue: undefined }
  );
  const [loginToken] = useZappingLoginToken();

  const isStale = !cache || Date.now() - cache.fetchedAt > TTL_MS;

  useEffect(() => {
    if (!isStale) return;
    if (Date.now() - lastAttempt < RETRY_MS) return;
    lastAttempt = Date.now();
    // Not gated on unmount: the result goes to a shared cache, so an in-flight
    // fetch should still land if the component that started it went away
    // (which it always does on StrictMode's double-mount).
    inFlight = inFlight ?? fetchZappingChannels(loginToken);
    inFlight
      .then(channels => setCache({ channels, fetchedAt: Date.now() }))
      .catch(err => console.error('[zapping] channel list fetch failed', err))
      .finally(() => {
        inFlight = undefined;
      });
  }, [isStale, loginToken, setCache]);

  /** Sorted by channel number, which is how Zapping presents the catalogue. */
  const channels = useMemo(
    () =>
      Object.values(cache?.channels ?? canalesZapping).sort(
        (a, b) => a.number - b.number
      ),
    [cache]
  );

  return { channels, isFallback: !cache };
}

export const zappingSlug = (channel: ZappingChannel) =>
  `custom_zapping_${channel.id}`;

/**
 * Mount once (see ClientProviders). `createSource` never overwrites an existing
 * entry, so zapping channels the user already selected would keep playing the
 * stream URL from whenever they were first added. Re-point them at the URL from
 * the refreshed catalogue.
 */
export function useZappingSourceSync() {
  const { channels, isFallback } = useZappingChannels();
  const { customSources, setCustomSources } = useCustomSources();

  useEffect(() => {
    if (isFallback) return;
    const urlBySlug = new Map(channels.map(c => [zappingSlug(c), c.url]));
    const needsUpdate = customSources.some(src => {
      const url = urlBySlug.get(src.slug);
      return url && url !== src.zappingChannel;
    });
    if (!needsUpdate) return;
    setCustomSources(sources =>
      sources.map(src => {
        const url = urlBySlug.get(src.slug);
        return url && url !== src.zappingChannel
          ? { ...src, zappingChannel: url }
          : src;
      })
    );
  }, [channels, isFallback, customSources, setCustomSources]);
}

/** The catalogue mapped onto the app's `SourceType`. */
export function useZappingSources(): SourceType[] {
  const { channels } = useZappingChannels();
  return useMemo(
    () =>
      channels.map(canal => ({
        slug: zappingSlug(canal),
        zappingChannel: canal.url,
        name: canal.name,
        imageUrl: zappingLogoUrl(canal.image)
      })),
    [channels]
  );
}
