/**
 * Arrow navigation across the monitor's screens.
 *
 * The arrangements are grids of uneven tiles — one big screen beside a stack of
 * small ones — so which screen sits above or next to another is a matter of
 * geometry, not of index order. Rather than model each layout, the tiles report
 * their own boxes through {@link SOURCE_IDX_ATTR} and a move picks the nearest
 * one lying ahead in the direction travelled.
 */

export type Direction = 'up' | 'down' | 'left' | 'right';

/** Marks a rendered screen with the source index it stands for. */
export const SOURCE_IDX_ATTR = 'data-source-idx';

const ARROW_DIRECTIONS: Record<string, Direction> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right'
};

/** The direction an arrow key stands for, or undefined for any other key. */
export const directionFromKeyEvent = (
  event: KeyboardEvent
): Direction | undefined => ARROW_DIRECTIONS[event.code];

/** Rounding slack, so tiles that share an edge still count as adjacent. */
const EDGE_TOLERANCE = 1;

/**
 * A box turned so the direction travelled always runs along `main`, forwards:
 * `main0` is the edge facing us, `cross` the span it can share with a
 * neighbour. Backwards directions are negated, which makes the comparisons the
 * same for all four.
 */
type Projection = {
  main0: number;
  main1: number;
  cross0: number;
  cross1: number;
};

const project = (rect: DOMRect, direction: Direction): Projection => {
  switch (direction) {
    case 'right':
      return {
        main0: rect.left,
        main1: rect.right,
        cross0: rect.top,
        cross1: rect.bottom
      };
    case 'left':
      return {
        main0: -rect.right,
        main1: -rect.left,
        cross0: rect.top,
        cross1: rect.bottom
      };
    case 'down':
      return {
        main0: rect.top,
        main1: rect.bottom,
        cross0: rect.left,
        cross1: rect.right
      };
    case 'up':
      return {
        main0: -rect.bottom,
        main1: -rect.top,
        cross0: rect.left,
        cross1: rect.right
      };
  }
};

type Candidate = {
  idx: number;
  /** 0 when the tile shares a lane with the current one, 1 when it is diagonal. */
  rank: number;
  score: number;
  tiebreak: number;
};

const isBetter = (candidate: Candidate, best: Candidate | undefined) => {
  if (!best) return true;
  if (candidate.rank !== best.rank) return candidate.rank < best.rank;
  // Tiles that tile a grid share their edges to within a rounding error, so
  // comparisons only count once they are wider than one; anything closer than
  // that is a tie and falls through, ending on the first tile in the layout.
  if (Math.abs(candidate.score - best.score) > EDGE_TOLERANCE)
    return candidate.score < best.score;
  if (Math.abs(candidate.tiebreak - best.tiebreak) > EDGE_TOLERANCE)
    return candidate.tiebreak < best.tiebreak;
  return false;
};

/**
 * The screen the arrows land on when leaving `currentIdx`, or undefined when
 * there is nothing that way. `root` scopes the search to one monitor, so the
 * saved-screen thumbnails and other pages never take part.
 *
 * An arrangement need not draw every slot it has room for, so a selection can
 * end up pointing at nothing; any arrow then brings it back onto the monitor.
 */
export function findNeighbourIdx(
  root: HTMLElement | null,
  currentIdx: number,
  direction: Direction
): number | undefined {
  if (!root) return undefined;

  const tiles = Array.from(
    root.querySelectorAll<HTMLElement>(`[${SOURCE_IDX_ATTR}]`)
  )
    .map(element => ({
      idx: Number(element.getAttribute(SOURCE_IDX_ATTR)),
      box: project(element.getBoundingClientRect(), direction)
    }))
    .filter(tile => Number.isInteger(tile.idx));

  const current = tiles.find(tile => tile.idx === currentIdx);
  if (!current)
    return tiles.reduce<number | undefined>(
      (lowest, tile) =>
        lowest === undefined || tile.idx < lowest ? tile.idx : lowest,
      undefined
    );

  let best: Candidate | undefined;
  tiles.forEach(({ idx, box }) => {
    if (idx === currentIdx) return;
    // Ahead means the tile starts at or past the edge we are leaving, so a
    // neighbour that merely straddles the current one is never a target.
    const gap = box.main0 - current.box.main1;
    if (gap < -EDGE_TOLERANCE) return;
    const overlap =
      Math.min(box.cross1, current.box.cross1) -
      Math.max(box.cross0, current.box.cross0);
    const sharesLane = overlap > EDGE_TOLERANCE;
    const candidate: Candidate = {
      idx,
      rank: sharesLane ? 0 : 1,
      // Straight ahead is judged on distance alone; off to the side, how far
      // sideways counts too, so the closest corner wins.
      score: sharesLane ? gap : gap - overlap,
      // A big screen faces a whole stack of small ones at the same distance;
      // the one to take is the one it sits most squarely over. Tiles it covers
      // equally tie here and are settled by their order in the arrangement.
      tiebreak: -overlap
    };
    if (isBetter(candidate, best)) best = candidate;
  });

  return best?.idx;
}
