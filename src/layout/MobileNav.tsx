'use client';
import { PropsWithChildren } from 'react';
import { CategoryTabs } from '../components/SelectSource/CategoryTabs';
import {
  useActiveCategory,
  visibleCategoryOrder
} from '../components/SelectSource/sourceCategories';

type Props = {
  /** Whether the picker is unfolded above the bar. */
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  /** A phone on its side has no height to give away, so the bar takes less. */
  isLandscape?: boolean;
};

/**
 * The app's navigation on a phone: a bar of catalogues pinned to the bottom,
 * within reach of a thumb, that unfolds into the channel picker.
 *
 * It sits in the column rather than over it, so opening the picker shrinks the
 * monitor instead of covering it — what is playing stays visible, and the tile
 * being pointed at stays tappable.
 */
export function MobileNav({
  isOpen,
  onOpenChange,
  isLandscape,
  children
}: PropsWithChildren<Props>) {
  const [storedCategory, setActiveCategory] = useActiveCategory();
  const categories = visibleCategoryOrder(true);
  // A stored category can stop existing — `pruebas` outside dev, `layouts` on
  // a phone — and no button in the bar would then be the one lit.
  const activeCategory = categories.includes(storedCategory)
    ? storedCategory
    : 'tv';

  // Tapping the tab already being browsed folds the picker away again; any
  // other tab opens on itself.
  const handleSelect = (category: typeof activeCategory) => {
    if (isOpen && category === activeCategory) {
      onOpenChange(false);
      return;
    }
    setActiveCategory(category);
    onOpenChange(true);
  };

  return (
    <div className="z-30 flex flex-none flex-col border-t border-gray-800 bg-background">
      {/* Sideways the picker stands beside the monitor instead, and the bar is
          left with nothing to fold out. */}
      {isOpen && !!children && (
        <div
          className="flex min-h-0 flex-col overflow-hidden px-2 pt-2"
          style={{ height: '50dvh' }}
        >
          {children}
        </div>
      )}
      <div
        className="flex items-center gap-1 px-2 py-1"
        // Clear of the home indicator and the gesture area, on the phones that
        // have them; zero everywhere else.
        style={{ paddingBottom: 'max(0.25rem, env(safe-area-inset-bottom))' }}
      >
        <CategoryTabs
          activeCategory={activeCategory}
          onSelect={handleSelect}
          categories={categories}
          // Sideways the bar has to give some of its height back to the picture.
          size={isLandscape ? 'sidebar' : 'touch'}
          className="min-w-0 flex-1"
        />
      </div>
    </div>
  );
}
