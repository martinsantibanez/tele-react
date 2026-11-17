import { TileRect } from './parkedWall';

/**
 * The fewest tiles the focus wall is laid out for. With two there is one
 * preview, and the wall would be mostly empty cells.
 */
export const FOCUS_MIN_TILES = 3;

/**
 * The fewest tiles the previews go two cells deep for, when that is turned on.
 * Below it the enlarged tile would shrink to a quarter of the wall or less for
 * previews barely any bigger.
 */
export const FOCUS_TWO_DEEP_MIN_TILES = 10;

/**
 * Where each tile goes with one of them enlarged: the wall split into an m×m
 * grid, the focused tile on its top-left block, and a cell for every tile in
 * the L down the right and along the bottom, in their own order (reading
 * order: right arm row by row, then the bottom rows). Wall and pictures are
 * both 16:9, so every cell is a 16:9 picture and nothing is letterboxed.
 *
 * The L is one cell deep, which gives 2m−1 cells and the focused tile
 * (m−1)×(m−1). With `twoDeep`, and enough tiles, it is two deep: 4m−4 cells
 * around an (m−2)×(m−2) tile. The grid then grows half as fast with the count,
 * so the previews stay bigger and the enlarged tile stops growing.
 *
 * Every tile keeps its cell whichever one is enlarged — the enlarged one's is
 * left to mark where it went (`home`) — so bringing another in only moves
 * the two of them, and a preview is always found where it was. Cells the
 * tiles do not fill, bottom right, are left free (`spare`).
 */
export const focusWallRects = (
  screens: number[],
  focused: number,
  twoDeep = false
):
  | { rects: Map<number, TileRect>; home: TileRect; spare: TileRect[] }
  | undefined => {
  const at = screens.indexOf(focused);
  const count = screens.length;
  if (count < FOCUS_MIN_TILES || at < 0) return undefined;
  const depth = twoDeep && count >= FOCUS_TWO_DEEP_MIN_TILES ? 2 : 1;
  const size =
    depth === 2
      ? Math.ceil(count / 4) + 1
      : Math.max(3, Math.ceil((count + 1) / 2));
  const cell = 100 / size;
  const big = (size - depth) * cell;
  const slots: TileRect[] = [];
  for (let row = 0; row < size; row++)
    for (let col = 0; col < size; col++)
      if (row >= size - depth || col >= size - depth)
        slots.push({
          left: col * cell,
          top: row * cell,
          width: cell,
          height: cell
        });

  const rects = new Map<number, TileRect>();
  screens.forEach((idx, n) => rects.set(idx, slots[n]));
  rects.set(focused, { left: 0, top: 0, width: big, height: big });
  return { rects, home: slots[at], spare: slots.slice(count) };
};
