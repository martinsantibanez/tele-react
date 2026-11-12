import { PLACEHOLDER_SOURCE_SLUG } from '../../sources/placeholder';
import {
  DisplayConfig,
  DisplayMode,
  LayoutType,
  SourceNode
} from '../../types/Monitor';
import { uuid } from '../../utils/uuid';

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

// 2 side by side, each one the full height
export const twoSideBySideLayout: LayoutType = [
  {
    cols: 6,
    rows: 9
  },
  {
    cols: 6,
    rows: 9
  }
];

/**
 * How many screens a config shows. A fixed layout has one per slot and a grid
 * its count; a phone's grid has no count and shows every channel it holds.
 * The live walls (YouTube, Más vistos) are as many as they are handed.
 */
export const slotCount = (config: DisplayConfig, sources: SourceNode[]) => {
  switch (config.mode) {
    case DisplayMode.Layout:
      return config.layout.length;
    case DisplayMode.Grid:
      return config.grid.count === undefined
        ? sources.length
        : gridSlotCount(config.grid.count, sources);
    case DisplayMode.Zapping:
      return 1;
    default:
      return sources.length;
  }
};

/**
 * A grid's count is of the tiles that are always there. The `liveOnly` ones
 * ride along on top of it — however many sit before the last of them, and any
 * straight after it — so setting one never pushes a regular channel off the
 * end. Short of the count, it is topped up with empty slots (`fillSlots`).
 */
const gridSlotCount = (count: number, sources: SourceNode[]) => {
  let always = 0;
  for (let idx = 0; idx < sources.length; idx++) {
    if (sources[idx].liveOnly) continue;
    if (always === count) return idx;
    always++;
  }
  return sources.length + (count - always);
};

/** The channels a screen shows: the ones past its slots are kept, unseen. */
export const visibleSources = (config: DisplayConfig, sources: SourceNode[]) =>
  sources.slice(0, slotCount(config, sources));

/**
 * Tops a screen up with empty slots until it fills `count`. It never takes
 * any away: a smaller arrangement only hides the channels past its end, so
 * coming back to a bigger one finds them where they were.
 */
export const fillSlots = (
  sources: SourceNode[],
  count: number
): SourceNode[] =>
  sources.length >= count
    ? sources
    : [
        ...sources,
        ...Array.from({ length: count - sources.length }, () => ({
          sourceSlug: PLACEHOLDER_SOURCE_SLUG,
          uuid: uuid()
        }))
      ];
