import { useCallback } from 'react';
import useLocalStorageState from 'use-local-storage-state';
import { useFavourites } from '../../hooks/useFavourites';
import { useIsTv } from '../../hooks/useIsTv';
import { useSourceCatalog } from '../../hooks/useSourceCatalog';
import { SourceType } from '../../sources';
import { pruebasSources } from '../../sources/pruebas';
import { HOME_COUNTRY } from './tvChannels';

/** The test bench is for trying sources out, so it never ships to production. */
export const showPruebas = process.env.NODE_ENV === 'development';

export type SelectorCategories =
  | 'tv'
  | 'twitch'
  | 'zapping'
  | 'youtube'
  | 'spotify'
  | 'favourites'
  | 'pruebas'
  | 'screens'
  | 'layouts';

export const categoryOrder: SelectorCategories[] = [
  'tv',
  'zapping',
  'youtube',
  'favourites',
  'twitch',
  // Spotify is left out for now, to keep the tabs down to the ones in use;
  // its catalogue and its screens still work, there is just no tab for it.
  ...(showPruebas ? (['pruebas'] as SelectorCategories[]) : []),
  'screens',
  'layouts'
];

/** The tabs that are not a catalogue of channels. */
export const isPanelCategory = (category: SelectorCategories) =>
  category === 'screens' || category === 'layouts';

export const useActiveCategory = () => {
  return useLocalStorageState<SelectorCategories>('_active_category_', {
    defaultValue: 'tv'
  });
};

/**
 * The tabs worth showing. Layouts is where the grid's arrangement gets
 * picked, which is nothing a phone has any say over — it always shows a
 * fixed count in a fixed shape — so the tab is dropped there rather than
 * opening on a panel with nothing a phone can use in it. Screens go with it:
 * the phone fits whichever one is opened to its own shape, so switching
 * through them there would rewrite every one. The TV tab goes once Zapping or
 * YouTube is connected (see `useShowTvCatalog`). A TV box drops Twitch,
 * YouTube, Favourites and the test bench too (see `TV_HIDDEN_CATEGORIES`).
 */
export const visibleCategoryOrder = (
  isMobile: boolean,
  showTv: boolean,
  isTvDevice: boolean
): SelectorCategories[] =>
  categoryOrder.filter(
    category =>
      !(isMobile && isPanelCategory(category)) &&
      (showTv || category !== 'tv') &&
      !(isTvDevice && TV_HIDDEN_CATEGORIES.includes(category))
  );

/**
 * Tabs a TV box goes without: Twitch and YouTube sign in through a browser
 * redirect the WebView has no good way to finish (see `useConnectedProviders`
 * for YouTube), and the test bench is for trying sources out at a desk, not
 * from the sofa. Favourites go too, to keep the remote's tabs down to the
 * catalogue and the screens.
 */
export const TV_HIDDEN_CATEGORIES: SelectorCategories[] = [
  'twitch',
  'youtube',
  'favourites',
  'pruebas'
];

/**
 * Countries whose channels are unfolded in the TV list. Only the home country
 * starts open, so the catalogue reads as a short list of countries.
 */
export const useOpenCountries = () => {
  return useLocalStorageState<string[]>('_open_tv_countries_', {
    defaultValue: [HOME_COUNTRY]
  });
};

/**
 * What the search box compares: lowercase and unaccented, so «senal» finds
 * «Señal» and «TVN» finds «tvn». Both sides of the comparison go through it.
 */
export function normalizeSearch(text: string) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/** Whether a channel answers to `query`, which is already normalized. */
export function sourceMatches(source: SourceType, query: string) {
  return normalizeSearch(source.name ?? source.slug).includes(query);
}

/**
 * The tab a channel is listed under. Each catalogue stamps its own prefix on
 * the slugs it hands out, which is what a saved grid keeps, so the tab can be
 * told from the slug alone — no catalogue has to have answered yet. The bare
 * `custom_` prefix is the TV feed's; the built-ins carry no prefix and belong
 * to no tab at all.
 */
function categoryOfSlug(slug: string): SelectorCategories | undefined {
  if (slug.startsWith('custom_zapping_')) return 'zapping';
  if (slug.startsWith('custom_twitch-')) return 'twitch';
  if (slug.startsWith('custom_yt_live_')) return 'youtube';
  if (slug.startsWith('custom_spotify_')) return 'spotify';
  if (slug.startsWith('custom_')) return 'tv';
  if (showPruebas && Object.values(pruebasSources).some(s => s.slug === slug))
    return 'pruebas';
  return undefined;
}

/**
 * Brings a channel into view in the sidebar: opens the tab it is listed under
 * and, in the TV list, unfolds the country holding it. The list scrolls itself
 * from there — it follows the selected row.
 *
 * Called when a screen is picked for editing, so the picker always opens on
 * what that screen is playing instead of wherever it was left.
 */
export function useRevealSource() {
  const [activeCategory, setActiveCategory] = useActiveCategory();
  const [, setOpenCountries] = useOpenCountries();
  const { isFavourite } = useFavourites();
  const { tvGroups } = useSourceCatalog();
  const isTv = useIsTv();

  return useCallback(
    (slug?: string) => {
      // Favourites gathers channels from every catalogue, so a starred channel
      // is already listed where the user is standing — unless on a TV, which
      // has no Favourites tab to be standing in.
      if (slug && !isTv && activeCategory === 'favourites' && isFavourite(slug))
        return;

      const category = slug ? categoryOfSlug(slug) : undefined;
      if (!category) {
        // A built-in (or an empty screen) is under no tab; the most the picker
        // can do is get off the panels and show the channels.
        setActiveCategory(current =>
          isPanelCategory(current) ? 'tv' : current
        );
        return;
      }

      setActiveCategory(category);
      if (category !== 'tv') return;

      // A folded country renders no row for its channels, so there would be
      // nothing for the list to scroll to.
      const country = tvGroups.find(group =>
        group.categories.some(cat =>
          cat.sources.some(source => source.slug === slug)
        )
      )?.country;
      if (!country) return;
      setOpenCountries(open =>
        open.includes(country) ? open : [...open, country]
      );
    },
    [
      activeCategory,
      isFavourite,
      isTv,
      setActiveCategory,
      setOpenCountries,
      tvGroups
    ]
  );
}
