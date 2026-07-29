import { LayoutType } from '../../types/Monitor';

// Layouts are laid out on a 12 cols x 9 rows grid and must tile it completely,
// otherwise the screens only cover part of the monitor.

// 1 big + 5 small
export const initialLayout: LayoutType = [
  {
    cols: 8,
    rows: 6
  },
  {
    cols: 4,
    rows: 3
  },
  {
    cols: 4,
    rows: 3
  },
  {
    cols: 4,
    rows: 3
  },
  {
    cols: 4,
    rows: 3
  },
  {
    cols: 4,
    rows: 3
  }
];

/** The same tile, several times over — most walls are mostly one shape. */
const repeat = (count: number, tile: LayoutType[number]): LayoutType =>
  Array.from({ length: count }, () => ({ ...tile }));

// The layouts below are the ones the editor starts you with. Each tiles the
// 12x9 exactly, and every tile is either 16:9 (cols/rows = 4/3) or the 4:3 the
// square-ish ones fall on — a shape a television picture sits in without a
// band of black down its sides.

// One screen the height of the monitor, with three 16:9 down the right.
export const mainAndRailLayout: LayoutType = [
  { cols: 8, rows: 9 },
  ...repeat(3, { cols: 4, rows: 3 })
];

// The newsroom wall: a big one, two beside it, four along the bottom.
export const newsroomLayout: LayoutType = [
  { cols: 8, rows: 6 },
  ...repeat(2, { cols: 4, rows: 3 }),
  ...repeat(4, { cols: 3, rows: 3 })
];

// A wider main — for the channel that is on, with the rest kept small.
export const wideMainLayout: LayoutType = [
  { cols: 9, rows: 6 },
  ...repeat(2, { cols: 3, rows: 3 }),
  ...repeat(3, { cols: 4, rows: 3 })
];

// Two halves of the monitor, four along the bottom.
export const twoHalvesLayout: LayoutType = [
  ...repeat(2, { cols: 6, rows: 6 }),
  ...repeat(4, { cols: 3, rows: 3 })
];

// Nine equal 16:9 — one per number key, which is as many as the shortcuts go.
export const nineUpLayout: LayoutType = repeat(9, { cols: 4, rows: 3 });

// The rail on the left and the main on the right, which the tiles cannot say
// on their own — they carry a size and no position. What puts the main over
// there is being written second: the first small tile takes the top-left
// corner, and the big one goes to the only place it still fits.
export const railLeftLayout: LayoutType = [
  { cols: 4, rows: 3 },
  { cols: 8, rows: 9 },
  ...repeat(2, { cols: 4, rows: 3 })
];

// A wall of nine where one channel is worth four of the others.
export const featuredWallLayout: LayoutType = [
  { cols: 6, rows: 6 },
  ...repeat(8, { cols: 3, rows: 3 })
];

// A strip across the bottom, too short for a picture and the right shape for
// a clock, a radio or whatever is playing.
export const bannerLayout: LayoutType = [
  { cols: 8, rows: 6 },
  ...repeat(2, { cols: 4, rows: 3 }),
  { cols: 12, rows: 3 }
];

// A column down the right the height of the monitor: standing up rather than
// lying down, the way a timeline or a chat reads.
export const sideColumnLayout: LayoutType = [
  { cols: 8, rows: 6 },
  { cols: 4, rows: 9 },
  ...repeat(2, { cols: 4, rows: 3 })
];

// 2 big on top + 3 small below
export const twoBigLayout: LayoutType = [
  {
    cols: 6,
    rows: 5
  },
  {
    cols: 6,
    rows: 5
  },
  {
    cols: 4,
    rows: 4
  },
  {
    cols: 4,
    rows: 4
  },
  {
    cols: 4,
    rows: 4
  }
];
