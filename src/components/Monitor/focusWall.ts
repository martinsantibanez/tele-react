import { TileRect } from './parkedWall';

/**
 * The fewest tiles the focus wall is laid out for. With two there is one
 * preview, and the wall would be mostly empty cells.
 */
export const FOCUS_MIN_TILES = 3;

/**
 * Where each tile goes with one of them enlarged: the wall split into an m×m
 * grid, the focused tile on its top-left (m−1)×(m−1) block and the others
 * down the right column and along the bottom row, in their own order. Wall
 * and pictures are both 16:9, so every cell is a 16:9 picture and nothing is
 * letterboxed.
 *
 * That makes 2m−1 previews: an even count of tiles fills the grid exactly, an
 * odd one leaves the last cell, bottom right, empty (`spare`).
 */
export const focusWallRects = (
  screens: number[],
  focused: number
): { rects: Map<number, TileRect>; spare: TileRect[] } | undefined => {
  if (screens.length < FOCUS_MIN_TILES || !screens.includes(focused))
    return undefined;
  const others = screens.filter(idx => idx !== focused);
  const size = Math.max(3, Math.ceil(screens.length / 2));
  const cell = 100 / size;
  const big = (size - 1) * cell;
  const slots: TileRect[] = [];
  for (let row = 0; row < size - 1; row++)
    slots.push({ left: big, top: row * cell, width: cell, height: cell });
  for (let col = 0; col < size; col++)
    slots.push({ left: col * cell, top: big, width: cell, height: cell });

  const rects = new Map<number, TileRect>([
    [focused, { left: 0, top: 0, width: big, height: big }]
  ]);
  others.forEach((idx, n) => rects.set(idx, slots[n]));
  return { rects, spare: slots.slice(others.length) };
};
