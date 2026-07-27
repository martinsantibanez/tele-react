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
  /** Fixed height of an item, needed up front to virtualise the list. */
  itemHeight: number;
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
};

/**
 * Keyboard driven carousels sitting side by side as columns: up/down move
 * inside the active one, Tab switches between them. Rows keep their own
 * selection, so switching back and forth doesn't lose the place.
 */
export function RowSlider({ rows, enabled = true, onActiveRowChange }: Props) {
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

  useHotkeys('up', () => move(-1), { preventDefault: true }, [
    enabled,
    activeRow
  ]);
  useHotkeys('down', () => move(1), { preventDefault: true }, [
    enabled,
    activeRow
  ]);
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
    // Side by side columns that own the height they are given, so each one can
    // scroll its own list.
    <div className="flex h-full min-h-0 w-full flex-row items-stretch gap-2">
      {rows.map((row, rowIndex) => (
        <Row
          key={row.key}
          row={row}
          isActive={enabled && rowIndex === activeRowIndex}
          showTabHint={enabled && rows.length > 1}
        />
      ))}
    </div>
  );
}

function Row({
  row,
  isActive,
  showTabHint
}: {
  row: ErasedSliderRow;
  isActive: boolean;
  showTabHint: boolean;
}) {
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
      className={`flex min-h-0 min-w-0 flex-1 flex-col items-center gap-1 transition-opacity ${
        isActive ? 'opacity-100' : 'opacity-40'
      }`}
    >
      <Button
        onClick={() => move(-1)}
        variant="ghost"
        className="flex h-6 w-full shrink-0 flex-col items-center gap-0.5 py-0"
        disabled={row.selectedIndex <= 0}
      >
        <span>{'∧'}</span>
      </Button>
      {!row.items.length && row.emptyState}
      <VirtualList
        items={row.items}
        itemHeight={row.itemHeight}
        activeIndex={row.selectedIndex}
        getItemKey={row.getItemKey}
        renderItem={renderItem}
        className="min-h-0 w-full flex-1"
      />
      <div className="flex w-full shrink-0 flex-col items-center gap-1">
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
          className="flex h-6 w-full flex-col items-center gap-0.5 py-0"
          disabled={row.selectedIndex >= row.items.length - 1}
        >
          <span>{'∨'}</span>
        </Button>
      </div>
    </div>
  );
}
