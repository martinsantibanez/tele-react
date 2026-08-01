'use client';
import { PointerEvent as ReactPointerEvent, useRef } from 'react';
import { ColValues, LayoutType, RowValues } from '../../types/Monitor';
import { getSourceShortcutLabel } from '../../utils/sourceShortcut';
import {
  clampCols,
  clampRows,
  GRID_CELLS,
  GRID_COLS,
  GRID_ROWS,
  Placement
} from './layoutPlacement';

type Props = {
  layout: LayoutType;
  placement: Placement;
  selectedIdx: number;
  onSelect: (idx: number) => void;
  onResize: (idx: number, cols: ColValues, rows: RowValues) => void;
};

/** A colour per tile, so a shape can be followed from the board to the list. */
export const tileColor = (idx: number) => `hsl(${(idx * 47 + 205) % 360} 55% 42%)`;

/**
 * The board. The tiles are laid out exactly as `Layout` lays them out — spans
 * and no positions, the browser packs them — so what is drawn here is what the
 * monitor will do with the same layout, holes and all.
 */
export function LayoutCanvas({
  layout,
  placement,
  selectedIdx,
  onSelect,
  onResize
}: Props) {
  const boardRef = useRef<HTMLDivElement>(null);
  // The drag reads the placement as it stands *now*: resizing reflows the board
  // under the pointer, and an anchor taken once at pointer-down would drift the
  // moment the tile it belongs to moved.
  const placementRef = useRef(placement);
  placementRef.current = placement;

  const startResize = (idx: number) => (event: ReactPointerEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const handle = event.currentTarget as HTMLElement;
    handle.setPointerCapture(event.pointerId);
    onSelect(idx);

    const resizeTo = (clientX: number, clientY: number) => {
      const board = boardRef.current;
      if (!board) return;
      const rect = board.getBoundingClientRect();
      const cellWidth = rect.width / GRID_COLS;
      const cellHeight = rect.height / GRID_ROWS;
      const tile = placementRef.current.tiles[idx];
      if (!tile) return;
      const left = rect.left + tile.col * cellWidth;
      const top = rect.top + tile.row * cellHeight;
      onResize(
        idx,
        clampCols((clientX - left) / cellWidth),
        clampRows((clientY - top) / cellHeight)
      );
    };

    const move = (moveEvent: PointerEvent) =>
      resizeTo(moveEvent.clientX, moveEvent.clientY);
    const end = () => {
      handle.removeEventListener('pointermove', move);
      handle.removeEventListener('pointerup', end);
      handle.removeEventListener('pointercancel', end);
    };
    handle.addEventListener('pointermove', move);
    handle.addEventListener('pointerup', end);
    handle.addEventListener('pointercancel', end);
  };

  return (
    <div ref={boardRef} className="relative h-full w-full bg-black">
      {/* The 12x9 the layouts are drawn against, faint under the tiles. */}
      <div
        className="pointer-events-none absolute inset-0 grid"
        style={{
          gridTemplateColumns: `repeat(${GRID_COLS}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${GRID_ROWS}, minmax(0, 1fr))`
        }}
      >
        {Array.from({ length: GRID_CELLS }, (_, cell) => (
          <div key={cell} className="border border-white/10" />
        ))}
      </div>

      <div
        className="absolute inset-0 grid"
        style={{
          gridTemplateColumns: `repeat(${GRID_COLS}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${GRID_ROWS}, minmax(0, 1fr))`
        }}
      >
        {layout.map((tile, idx) => {
          const isSelected = idx === selectedIdx;
          const isOverflowing = placement.overflowing.includes(idx);
          return (
            <div
              key={idx}
              role="button"
              tabIndex={0}
              onClick={() => onSelect(idx)}
              onKeyDown={event => {
                if (event.key === 'Enter' || event.key === ' ') onSelect(idx);
              }}
              className={`group relative flex cursor-pointer items-center justify-center overflow-hidden text-white outline-none ${
                isSelected ? 'ring-2 ring-white' : 'ring-1 ring-black/40'
              }`}
              style={{
                gridColumn: `span ${tile.cols ?? 1}`,
                gridRow: `span ${tile.rows ?? 1}`,
                backgroundColor: tileColor(idx),
                opacity: isOverflowing ? 0.45 : 1
              }}
            >
              <div className="pointer-events-none text-center leading-tight">
                <div className="text-lg font-bold">
                  {getSourceShortcutLabel(idx)}
                </div>
                <div className="text-[11px] opacity-80">
                  {tile.cols}×{tile.rows}
                </div>
                {isOverflowing && (
                  <div className="text-[10px] font-semibold text-yellow-200">
                    fuera del monitor
                  </div>
                )}
              </div>

              {/* Bottom-right corner: drag it to size the tile in whole cells. */}
              <div
                onPointerDown={startResize(idx)}
                title="Arrastrar para redimensionar"
                className="absolute right-0 bottom-0 h-4 w-4 cursor-nwse-resize touch-none bg-white/70 opacity-0 transition-opacity group-hover:opacity-100 [clip-path:polygon(100%_0,100%_100%,0_100%)]"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
