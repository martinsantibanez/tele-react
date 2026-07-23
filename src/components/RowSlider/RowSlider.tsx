import { ReactNode, useEffect, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { Button } from '@/components/ui/button';

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

const DEFAULT_WINDOW_RADIUS = 2;

/**
 * Stack of horizontal, keyboard driven carousels: left/right move inside the
 * active row, Tab moves between rows. Rows keep their own selection, so
 * switching back and forth doesn't lose the place.
 */
export function RowSlider({ rows, enabled = true, onActiveRowChange }: Props) {
  const [activeRowIndex, setActiveRowIndex] = useState(0);

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

  useHotkeys('left', () => move(-1), { preventDefault: true }, [
    enabled,
    activeRow
  ]);
  useHotkeys('right', () => move(1), { preventDefault: true }, [
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
    <div className="flex w-full flex-col gap-2">
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
  const radius = row.windowRadius ?? DEFAULT_WINDOW_RADIUS;
  const startIndex = Math.max(row.selectedIndex - radius, 0);
  const endIndex = Math.min(row.items.length - 1, row.selectedIndex + radius);

  const move = (delta: number) => {
    const nextIndex = Math.min(
      Math.max(row.selectedIndex + delta, 0),
      row.items.length - 1
    );
    row.onSelect(nextIndex, row.items[nextIndex]);
  };

  return (
    <div
      className={`flex w-full items-center justify-between transition-opacity ${
        isActive ? 'opacity-100' : 'opacity-40'
      }`}
    >
      <Button
        onClick={() => move(-1)}
        variant="ghost"
        className="h-full flex flex-col items-center gap-0.5"
        disabled={row.selectedIndex <= 0}
      >
        <span>{'<'}</span>
      </Button>
      {!row.items.length && row.emptyState}
      {row.items.map((item, index) => {
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
      })}
      <div className="flex items-center gap-1">
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
          className="h-full flex flex-col items-center gap-0.5"
          disabled={row.selectedIndex >= row.items.length - 1}
        >
          <span>{'>'}</span>
        </Button>
      </div>
    </div>
  );
}
