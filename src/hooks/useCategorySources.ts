'use client';
import { useMemo } from 'react';
import {
  categoryOrder,
  SelectorCategories,
  showPruebas
} from '../components/SelectSource/sourceCategories';
import { SourceType } from '../sources';
import { pruebasSources } from '../sources/pruebas';
import { useFavourites } from './useFavourites';
import { useSourceCatalog } from './useSourceCatalog';
import { useSpotifyTabSections } from './useSpotifyLibrary';
import { useTwitchFollowedSources } from './useTwitchFollowedSources';
import { useYoutubeAuth } from './useYoutubeAuth';
import { useYoutubeLiveSources } from './useYoutubeLiveSubs';
import { zappingSlug, useZappingSources } from './useZappingChannels';
import { useZappingToken } from './useZappingConfig';
import { useZappingNowPlaying } from './useZappingNowPlaying';

/** Hand-written sources for trying things out; they come from no feed. */
const pruebasList = showPruebas ? Object.values(pruebasSources) : [];

/**
 * Each channel once, in the order it was first listed.
 *
 * The picker deliberately lists some channels twice — a Zapping channel in the
 * ranking and again in the catalogue at its number, a TV channel among the
 * recommended and again under its category — because a row is a position in a
 * list. A band being zapped through is the opposite: passing the same channel
 * twice on the way down is just a stutter.
 */
function dedupe(sources: SourceType[]): SourceType[] {
  const seen = new Set<string>();
  return sources.filter(source => {
    if (seen.has(source.slug)) return false;
    seen.add(source.slug);
    return true;
  });
}

export type CategorySources = Record<SelectorCategories, SourceType[]>;

/**
 * Every catalogue as a flat, ordered, de-duplicated list of channels — the bands
 * the zapping reel walks.
 *
 * Deliberately unfiltered. The picker narrows what it draws by its search box
 * and, in the TV list, by which countries are folded open; both are about what
 * is on screen in the sidebar. A ring of channels that shrank because something
 * was typed in a box, or that lost every Chilean channel because a country was
 * folded away, would be a different thing entirely.
 *
 * A catalogue nobody is connected to comes back empty rather than as channels
 * that would only ever show bars — that is what lets the reel skip past a band
 * instead of landing the user on a dead one.
 */
export function useAllCategorySources(): CategorySources {
  const { tvGroups, bySlug: catalogueBySlug } = useSourceCatalog();
  const zappingSources = useZappingSources();
  const { topChannels } = useZappingNowPlaying();
  const [zappingToken] = useZappingToken();
  const youtubeSources = useYoutubeLiveSources();
  const { isConnected: youtubeConnected } = useYoutubeAuth();
  const spotifySections = useSpotifyTabSections();
  const { sources: twitchSources } = useTwitchFollowedSources();
  const { favourites } = useFavourites();

  const tv = useMemo(
    () =>
      dedupe(
        tvGroups.flatMap(group =>
          group.categories.flatMap(category => category.sources)
        )
      ),
    [tvGroups]
  );

  // Headed by the live "Más vistos" ranking, as the picker lists it: the most
  // watched channels are the ones worth reaching first.
  const zapping = useMemo(() => {
    if (!zappingToken) return [];
    const bySlug = new Map(zappingSources.map(source => [source.slug, source]));
    const ranked = topChannels
      .map(channel => bySlug.get(zappingSlug(channel)))
      .filter((source): source is SourceType => !!source);
    return dedupe([...ranked, ...zappingSources]);
  }, [zappingToken, zappingSources, topChannels]);

  const spotify = useMemo(
    () => dedupe(spotifySections.flatMap(section => section.sources)),
    [spotifySections]
  );

  // The stored copy is a snapshot; show the catalogue's when it has one, so a
  // starred channel is zapped to with its current stream and signals.
  const favouriteSources = useMemo(
    () => dedupe(favourites.map(fav => catalogueBySlug.get(fav.slug) ?? fav)),
    [favourites, catalogueBySlug]
  );

  return useMemo(
    () => ({
      tv,
      zapping,
      youtube: youtubeConnected ? youtubeSources : [],
      spotify,
      twitch: twitchSources,
      favourites: favouriteSources,
      pruebas: pruebasList,
      // Not a catalogue at all — it is where the arrangement is picked.
      layouts: []
    }),
    [
      tv,
      zapping,
      youtubeConnected,
      youtubeSources,
      spotify,
      twitchSources,
      favouriteSources
    ]
  );
}

/** The band a single catalogue offers. */
export function useCategorySources(
  category: SelectorCategories
): SourceType[] {
  return useAllCategorySources()[category] ?? [];
}

/**
 * The bands worth switching to, in the order the tabs run. A catalogue with
 * nothing in it is skipped rather than landed on: there is nothing to zap
 * through, and the way out would be another press of the same key.
 */
export function useStockedCategories(): SelectorCategories[] {
  const all = useAllCategorySources();
  return useMemo(
    () => categoryOrder.filter(category => all[category]?.length),
    [all]
  );
}
