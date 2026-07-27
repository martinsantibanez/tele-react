import { ReactNode, useEffect, useRef } from 'react';

export type SliderRow<T = unknown> = {
  /** Stable identity for the row. */
  key: string;
  items: T[];
  /** Index of the item currently selected inside this row, -1 when none. */
  selectedIndex: number;
  onSelect: (index: number, item: T) => void;
  renderItem: (item: T, ctx: { index: number; isSelected: boolean }) => ReactNode;
  /** Shown instead of the items when the row is empty. */
  emptyState?: ReactNode;
  getItemKey?: (item: T, index: number) => string;
};

/**
 * A row whose item type has been erased so rows of different types can live in
 * the same list. Build these with {@link sliderRow}.
 */
export type ErasedSliderRow = SliderRow<never>;

export const sliderRow = <T,>(row: SliderRow<T>): ErasedSliderRow =>
  row as unknown as ErasedSliderRow;

type Props = {
  rows: ErasedSliderRow[];
};

/**
 * Strips of thumbnails stacked on top of each other. Each row owns its own
 * shortcut — see {@link import('../SelectSource/LayoutsPanel').LayoutsPanel} —
 * so this only draws them and keeps the selection in view.
 */
export function RowSlider({ rows }: Props) {
  return (
    <div className="flex w-full flex-col gap-2">
      {rows.map(row => (
        <SliderStrip key={row.key} row={row} />
      ))}
    </div>
  );
}

/**
 * The lists are short — a handful of arrangements and the screens the user has
 * saved — so every item is mounted and the strip just scrolls sideways.
 */
function SliderStrip({ row }: { row: ErasedSliderRow }) {
  const selectedRef = useRef<HTMLDivElement>(null);

  // The shortcuts can walk the selection past the edge of the strip.
  useEffect(() => {
    selectedRef.current?.scrollIntoView({
      block: 'nearest',
      inline: 'nearest'
    });
  }, [row.selectedIndex]);

  return (
    <div className="flex w-full min-w-0 shrink-0 flex-row items-center gap-1">
      {!row.items.length && row.emptyState}
      <div className="flex min-w-0 flex-1 flex-row items-center gap-1 overflow-x-auto overscroll-contain touch-pan-x">
        {row.items.map((item, index) => (
          <div
            key={row.getItemKey?.(item, index) ?? index}
            ref={index === row.selectedIndex ? selectedRef : undefined}
            className="shrink-0"
            onClick={() => row.onSelect(index, item)}
          >
            {row.renderItem(item, {
              index,
              isSelected: index === row.selectedIndex
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
