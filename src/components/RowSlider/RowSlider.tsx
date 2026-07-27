import { ReactNode, useEffect, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { Button } from '@/components/ui/button';
import { VirtualList } from '../VirtualList/VirtualList';

/**
 * Height of a compact (sidebar) row item: a 63px thumbnail plus its padding,
 * gap and label. Rows that use it can be virtualised.
 */
export const COMPACT_ITEM_HEIGHT = 95;

export type SliderRow<T = unknown> = {
  /** Stable identity for the row. */
  key: string;
  items: T[];
  /** Index of the item currently selected inside this row, -1 when none. */
  selectedIndex: number;
  onSelect: (index: number, item: T) => void;
  renderItem: (
    item: T,
    ctx: { index: number; isSelected: boolean; isRowActive: boolean }
  ) => ReactNode;
  /** Shown instead of the items when the row is empty. */
  emptyState?: ReactNode;
  /** How many items to show on each side of the selected one. */
  windowRadius?: number;
  /**
   * Fixed height of an item in the vertical layout. Rows that declare it scroll
   * the whole list (virtualised) instead of showing a window around the
   * selection; ignored by the horizontal layout, which has no room to scroll.
   */
  itemHeight?: number;
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
  /** Arrows and Tab are ignored while false. */
  enabled?: boolean;
  /** Reports the key of the row Tab has landed on, for row specific hotkeys. */
  onActiveRowChange?: (key: string | undefined) => void;
  /**
   * Transposed: the rows sit side by side as columns and up/down move inside
   * the active one. Tab still switches between them.
   */
  vertical?: boolean;
};

const DEFAULT_WINDOW_RADIUS = 2;

/**
 * Stack of keyboard driven carousels: the arrows along the carousel's axis move
 * inside the active row, Tab moves between rows. Rows keep their own selection,
 * so switching back and forth doesn't lose the place.
 */
export function RowSlider({
  rows,
  enabled = true,
  onActiveRowChange,
  vertical
}: Props) {
  // Start on the first row that actually has items, so an empty leading row
  // (e.g. no saved screens yet) hands focus to the next one instead of
  // stranding it on an empty carousel.
  const [activeRowIndex, setActiveRowIndex] = useState(() => {
    const firstFilled = rows.findIndex(row => row.items.length > 0);
    return firstFilled === -1 ? 0 : firstFilled;
  });

  // Rows can appear or disappear as the surrounding tab changes.
  useEffect(() => {
    setActiveRowIndex(current => (current < rows.length ? current : 0));
  }, [rows.length]);

  const activeRow = rows[activeRowIndex] as ErasedSliderRow | undefined;
  const activeRowKey = activeRow?.key;

  useEffect(() => {
    onActiveRowChange?.(activeRowKey);
  }, [activeRowKey, onActiveRowChange]);

  const move = (delta: number) => {
    if (!enabled || !activeRow || !activeRow.items.length) return;
    const nextIndex = Math.min(
      Math.max(activeRow.selectedIndex + delta, 0),
      activeRow.items.length - 1
    );
    if (nextIndex === activeRow.selectedIndex) return;
    activeRow.onSelect(nextIndex, activeRow.items[nextIndex]);
  };

  useHotkeys(
    vertical ? 'up' : 'left',
    () => move(-1),
    { preventDefault: true },
    [enabled, activeRow]
  );
  useHotkeys(
    vertical ? 'down' : 'right',
    () => move(1),
    { preventDefault: true },
    [enabled, activeRow]
  );
  useHotkeys(
    'tab',
    () => {
      if (!enabled || rows.length < 2) return;
      setActiveRowIndex(current => (current + 1) % rows.length);
    },
    { preventDefault: true },
    [enabled, rows.length]
  );

  return (
    <div
      className={`flex w-full gap-2 ${
        // Side by side columns that own the height they are given, so each one
        // can scroll its own list.
        vertical ? 'h-full min-h-0 flex-row items-stretch' : 'flex-col'
      }`}
    >
      {rows.map((row, rowIndex) => (
        <Row
          key={row.key}
          row={row}
          isActive={enabled && rowIndex === activeRowIndex}
          showTabHint={enabled && rows.length > 1}
          vertical={vertical}
        />
      ))}
    </div>
  );
}

function Row({
  row,
  isActive,
  showTabHint,
  vertical
}: {
  row: ErasedSliderRow;
  isActive: boolean;
  showTabHint: boolean;
  vertical?: boolean;
}) {
  const radius = row.windowRadius ?? DEFAULT_WINDOW_RADIUS;
  const startIndex = Math.max(row.selectedIndex - radius, 0);
  const endIndex = Math.min(row.items.length - 1, row.selectedIndex + radius);
  // A sidebar column is tall enough to scroll, so it shows the whole list.
  const itemHeight = vertical ? row.itemHeight : undefined;

  const move = (delta: number) => {
    const nextIndex = Math.min(
      Math.max(row.selectedIndex + delta, 0),
      row.items.length - 1
    );
    row.onSelect(nextIndex, row.items[nextIndex]);
  };

  const renderItem = (item: never, index: number) => (
    <div className="h-full" onClick={() => row.onSelect(index, item)}>
      {row.renderItem(item, {
        index,
        isSelected: index === row.selectedIndex,
        isRowActive: isActive
      })}
    </div>
  );

  return (
    <div
      className={`flex transition-opacity ${
        vertical
          ? 'min-h-0 min-w-0 flex-1 flex-col items-center gap-1'
          : 'w-full items-center justify-between'
      } ${isActive ? 'opacity-100' : 'opacity-40'}`}
    >
      <Button
        onClick={() => move(-1)}
        variant="ghost"
        className={`flex shrink-0 flex-col items-center gap-0.5 ${
          vertical ? 'h-6 w-full py-0' : 'h-full'
        }`}
        disabled={row.selectedIndex <= 0}
      >
        <span>{vertical ? '∧' : '<'}</span>
      </Button>
      {!row.items.length && row.emptyState}
      {itemHeight ? (
        <VirtualList
          items={row.items}
          itemHeight={itemHeight}
          activeIndex={row.selectedIndex}
          getItemKey={row.getItemKey}
          renderItem={renderItem}
          className="min-h-0 w-full flex-1"
        />
      ) : (
        row.items.map((item, index) => {
          if (index < startIndex || index > endIndex) return null;
          return (
            <div
              key={row.getItemKey?.(item, index) ?? index}
              onClick={() => row.onSelect(index, item)}
            >
              {row.renderItem(item, {
                index,
                isSelected: index === row.selectedIndex,
                isRowActive: isActive
              })}
            </div>
          );
        })
      )}
      <div
        className={`flex items-center gap-1 ${
          vertical ? 'w-full shrink-0 flex-col' : ''
        }`}
      >
        {/* Marks the row Tab would jump to; kept in the layout while hidden so
            rows stay aligned. */}
        {showTabHint && (
          <span
            className={`text-[9px] leading-none text-gray-400 ${
              isActive ? 'invisible' : ''
            }`}
          >
            TAB
          </span>
        )}
        <Button
          onClick={() => move(1)}
          variant="ghost"
          className={`flex flex-col items-center gap-0.5 ${
            vertical ? 'h-6 w-full py-0' : 'h-full'
          }`}
          disabled={row.selectedIndex >= row.items.length - 1}
        >
          <span>{vertical ? '∨' : '>'}</span>
        </Button>
      </div>
    </div>
  );
}
