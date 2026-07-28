import { useCallback } from 'react';
import useLocalStorageState from 'use-local-storage-state';
import { useFavourites } from '../../hooks/useFavourites';
import { useSourceCatalog } from '../../hooks/useSourceCatalog';
import { pruebasSources } from '../../sources/pruebas';
import { HOME_COUNTRY } from './tvChannels';

/** The test bench is for trying sources out, so it never ships to production. */
export const showPruebas = process.env.NODE_ENV === 'development';

export type SelectorCategories =
  | 'tv'
  | 'twitch'
  | 'zapping'
  | 'youtube'
  | 'favourites'
  | 'pruebas'
  | 'layouts';

export const categoryOrder: SelectorCategories[] = [
  'tv',
  'zapping',
  'youtube',
  'favourites',
  'twitch',
  ...(showPruebas ? (['pruebas'] as SelectorCategories[]) : []),
  'layouts'
];

export const useActiveCategory = () => {
  return useLocalStorageState<SelectorCategories>('_active_category_', {
    defaultValue: 'tv'
  });
};

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

  return useCallback(
    (slug?: string) => {
      // Favourites gathers channels from every catalogue, so a starred channel
      // is already listed where the user is standing.
      if (slug && activeCategory === 'favourites' && isFavourite(slug)) return;

      const category = slug ? categoryOfSlug(slug) : undefined;
      if (!category) {
        // A built-in (or an empty screen) is under no tab; the most the picker
        // can do is get off the layouts tab and show the channels.
        setActiveCategory(current => (current === 'layouts' ? 'tv' : current));
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
    [activeCategory, isFavourite, setActiveCategory, setOpenCountries, tvGroups]
  );
}
