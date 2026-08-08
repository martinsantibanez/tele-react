'use client';
import {
  FlaskConical,
  Heart,
  LayoutGrid,
  Music,
  TwitchIcon,
  Tv,
  YoutubeIcon
} from 'lucide-react';
import { ComponentType } from 'react';
import { Button } from '../../../components/ui/button';
import { ZappingLogo } from './ZappingSelector/ZappingLogo';
import { categoryOrder, SelectorCategories } from './sourceCategories';

export const categoryLabels: Record<SelectorCategories, string> = {
  tv: 'TV',
  twitch: 'Twitch',
  zapping: 'Zapping',
  youtube: 'YouTube',
  spotify: 'Spotify',
  favourites: 'Favoritos',
  pruebas: 'Pruebas',
  layouts: 'Layouts'
};

/**
 * The nav shows only these; the label rides along as the accessible name.
 * Zapping brings its own wordmark, so the map is not lucide-only.
 */
export const categoryIcons: Record<
  SelectorCategories,
  ComponentType<{ size?: number; 'aria-hidden'?: boolean }>
> = {
  tv: Tv,
  twitch: TwitchIcon,
  zapping: ZappingLogo,
  youtube: YoutubeIcon,
  spotify: Music,
  favourites: Heart,
  pruebas: FlaskConical,
  layouts: LayoutGrid
};

type Props = {
  activeCategory: SelectorCategories;
  onSelect: (category: SelectorCategories) => void;
  /** The bottom bar is thumbed rather than clicked, so its row is taller. */
  size?: 'sidebar' | 'touch';
  className?: string;
  /** Which tabs to lay out, and in what order. Defaults to every catalogue. */
  categories?: SelectorCategories[];
};

/**
 * The row of catalogues to browse. On a desktop it heads the sidebar; on a
 * phone it *is* the navigation, sat at the bottom of the app.
 */
export function CategoryTabs({
  activeCategory,
  onSelect,
  size = 'sidebar',
  className = '',
  categories = categoryOrder
}: Props) {
  const isTouch = size === 'touch';
  return (
    <div
      role="group"
      aria-label="Categorías"
      className={`flex flex-nowrap gap-1 ${className}`}
    >
      {categories.map(category => {
        const Icon = categoryIcons[category];
        const isActive = activeCategory === category;
        return (
          <Button
            key={category}
            variant={isActive ? 'default' : 'outline'}
            onClick={() => onSelect(category)}
            // Equal shares of the row, free to shrink: the nav is one line
            // whatever its width and however many tabs are shown. The padding is
            // spelled out for the icon-only case too, or the button's own
            // `has-[>svg]:px-3` would keep the wider default.
            className={`min-w-0 shrink grow basis-0 px-1 text-xs has-[>svg]:px-1 ${
              isTouch ? 'h-11' : 'h-8'
            }`}
            // The icon carries no text, so the label has to be spelled out for
            // screen readers and pointed out on hover for everyone else.
            aria-label={categoryLabels[category]}
            title={categoryLabels[category]}
            aria-pressed={isActive}
          >
            <Icon size={isTouch ? 20 : 16} aria-hidden />
          </Button>
        );
      })}
    </div>
  );
}
