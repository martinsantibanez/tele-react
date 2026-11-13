import { DisplayConfig, DisplayMode, GridSize } from '../../types/Monitor';

export type PossibleLayout = {
  name: string;
  config: DisplayConfig;
};

/**
 * A grid that fills its rows exactly, so no arrangement leaves a gap. Most
 * tile the 16:9 monitor with 16:9 pictures; side by side and 3 × 2 trade some
 * of the picture for fewer, bigger screens.
 */
export const gridConfig = (size: GridSize, count: number): DisplayConfig => ({
  mode: DisplayMode.Grid,
  grid: { size, count }
});

/**
 * Every arrangement there is, by number of screens. Each one has a fixed
 * count: a smaller one hides the channels past its end rather than dropping
 * them (see `fillSlots`).
 */
export const possibleLayouts: PossibleLayout[] = [
  { name: 'Una pantalla', config: gridConfig(1, 1) },
  // Two pictures are what a TV box can play smoothly at once.
  { name: 'Lado a lado', config: gridConfig(2, 2) },
  { name: '2 × 2', config: gridConfig(2, 4) },
  { name: '3 × 2', config: gridConfig(3, 6) },
  { name: '3 × 3', config: gridConfig(3, 9) },
  { name: '4 × 3', config: gridConfig(4, 12) }
];

/**
 * How many columns a grid is drawn with when it holds `drawn` tiles: its own
 * width, or that of the smallest arrangement on offer that holds them, if that
 * is wider — so a 3 × 3 with a live extra or two (or a tile added by hand)
 * becomes a 4 × 3, and grows rows of 4 past that. Fewer tiles keep the width
 * and only lose rows.
 */
export const gridColumnsFor = (size: number, drawn: number) => {
  const fit = possibleLayouts.find(
    ({ config }) => (config.grid.count ?? 0) >= drawn
  );
  return Math.max(size, fit?.config.grid.size ?? 4);
};

/** How many screens an arrangement shows. */
export const layoutScreenCount = ({ grid }: DisplayConfig) => grid.count ?? 0;

/**
 * The dynamic YouTube layout closes the YouTube category rather than sitting in
 * this list — its tiles come from the live channels, not a fixed arrangement.
 * `grid` is a placeholder the mode never reads.
 */
export const YOUTUBE_LAYOUT_NAME = 'YouTube en vivo';
export const youtubeLayoutConfig: DisplayConfig = {
  mode: DisplayMode.Youtube,
  grid: { size: 1 }
};

/**
 * Zapping's most watched channels, as many as fill the wall: nine on a
 * computer, four on a TV box, which struggles past that.
 */
export const ZAPPING_TOP_NAME = 'Lo más visto';
export const zappingTopConfig = (isTv: boolean): DisplayConfig => ({
  mode: DisplayMode.ZappingTop,
  grid: isTv ? { size: 2, count: 4 } : { size: 3, count: 9 }
});

export const findLayoutIndex = ({ mode, grid }: DisplayConfig) =>
  possibleLayouts.findIndex(
    layout =>
      mode === DisplayMode.Grid &&
      layout.config.grid.size === grid.size &&
      layout.config.grid.count === grid.count
  );
