import { PLACEHOLDER_SOURCE_SLUG } from '../../sources/placeholder';
import { DisplayConfig, DisplayMode, SourceNode } from '../../types/Monitor';
import { uuid } from '../../utils/uuid';

/**
 * How many screens a config shows. A grid shows its count; a phone's grid has
 * no count and shows every channel it holds.
 * The live walls (YouTube, Más vistos) are as many as they are handed.
 */
export const slotCount = (config: DisplayConfig, sources: SourceNode[]) => {
  switch (config.mode) {
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
 * A grid's count is its own tiles, the first ones of the screen. The
 * `liveOnly` tiles past them are extras that ride along on top — the grid
 * reaches as far as the last of them — while the regular channels kept past
 * the count stay out of sight in between (see `isPastGrid`). Adding an extra,
 * or setting one, so never moves anything that is already on the wall.
 */
const gridSlotCount = (count: number, sources: SourceNode[]) => {
  for (let idx = sources.length - 1; idx >= count; idx--)
    if (sources[idx].liveOnly) return idx + 1;
  return count;
};

/**
 * A regular channel kept past the end of a grid that reaches further, for the
 * live-only extras after it: within the screen's slots, never drawn.
 */
export const isPastGrid = (
  config: DisplayConfig,
  node: SourceNode | undefined,
  idx: number
) =>
  config.mode === DisplayMode.Grid &&
  config.grid.count !== undefined &&
  idx >= config.grid.count &&
  !node?.liveOnly;

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
