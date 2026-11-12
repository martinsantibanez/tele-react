import { TileRect } from './parkedWall';

/**
 * The fewest tiles the focus wall is laid out for. With two there is one
 * preview, and the wall would be mostly empty cells.
 */
export const FOCUS_MIN_TILES = 3;

/**
 * Where each tile goes with one of them enlarged: the wall split into an m×m
 * grid, the focused tile on its top-left (m−1)×(m−1) block, and a cell for
 * every tile down the right column and along the bottom row, in their own
 * order. Wall and pictures are both 16:9, so every cell is a 16:9 picture and
 * nothing is letterboxed.
 *
 * Every tile keeps its cell whichever one is enlarged — the enlarged one's is
 * left to mark where it went (`home`) — so bringing another in only moves
 * the two of them, and a preview is always found where it was. That makes
 * 2m−1 cells for the tiles: an odd count fills them exactly, an even one
 * leaves the last, bottom right, free (`spare`).
 */
export const focusWallRects = (
  screens: number[],
  focused: number
):
  | { rects: Map<number, TileRect>; home: TileRect; spare: TileRect[] }
  | undefined => {
  const at = screens.indexOf(focused);
  if (screens.length < FOCUS_MIN_TILES || at < 0) return undefined;
  const size = Math.max(3, Math.ceil((screens.length + 1) / 2));
  const cell = 100 / size;
  const big = (size - 1) * cell;
  const slots: TileRect[] = [];
  for (let row = 0; row < size - 1; row++)
    slots.push({ left: big, top: row * cell, width: cell, height: cell });
  for (let col = 0; col < size; col++)
    slots.push({ left: col * cell, top: big, width: cell, height: cell });

  const rects = new Map<number, TileRect>();
  screens.forEach((idx, n) => rects.set(idx, slots[n]));
  rects.set(focused, { left: 0, top: 0, width: big, height: big });
  return { rects, home: slots[at], spare: slots.slice(screens.length) };
};
