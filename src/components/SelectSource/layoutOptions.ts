import { defaultDisplayConfig } from '../../hooks/defaultScreen';
import { DisplayConfig, DisplayMode, GridSize } from '../../types/Monitor';
import {
  initialLayout,
  twoBigLayout,
  twoSideBySideLayout
} from '../Monitor/predefinedLayouts';

export type PossibleLayout = {
  name: string;
  config: DisplayConfig;
};

/**
 * A grid that fills its rows exactly. Only counts that tile the 16:9 monitor
 * without leaving a gap or squashing the pictures are offered.
 */
const grid = (size: GridSize, count: number): DisplayConfig => ({
  mode: DisplayMode.Grid,
  layout: initialLayout,
  grid: { size, count }
});

/**
 * Every arrangement there is, by number of screens. Each one has a fixed
 * count: a smaller one hides the channels past its end rather than dropping
 * them (see `fillSlots`).
 */
export const possibleLayouts: PossibleLayout[] = [
  { name: 'Una pantalla', config: grid(1, 1) },
  {
    // Two pictures are what a TV box can play smoothly at once.
    name: 'Lado a lado',
    config: {
      mode: DisplayMode.Layout,
      layout: twoSideBySideLayout,
      grid: { size: 1 }
    }
  },
  { name: '2 × 2', config: grid(2, 4) },
  {
    name: 'Dos destacadas',
    config: {
      mode: DisplayMode.Layout,
      layout: twoBigLayout,
      grid: { size: 1 }
    }
  },
  { name: 'Una destacada', config: defaultDisplayConfig },
  { name: '3 × 3', config: grid(3, 9) },
  { name: '4 × 3', config: grid(4, 12) }
];

/** How many screens an arrangement shows. */
export const layoutScreenCount = ({ mode, layout, grid }: DisplayConfig) =>
  mode === DisplayMode.Layout ? layout.length : (grid.count ?? 0);

/**
 * The dynamic YouTube layout closes the YouTube category rather than sitting in
 * this list — its tiles come from the live channels, not a fixed arrangement.
 * `grid` and `layout` are placeholders the mode never reads.
 */
export const YOUTUBE_LAYOUT_NAME = 'YouTube en vivo';
export const youtubeLayoutConfig: DisplayConfig = {
  mode: DisplayMode.Youtube,
  grid: { size: 1 },
  layout: initialLayout
};

/**
 * Zapping's most watched channels, as many as fill the wall: nine on a
 * computer, four on a TV box, which struggles past that.
 */
export const ZAPPING_TOP_NAME = 'Lo más visto';
export const zappingTopConfig = (isTv: boolean): DisplayConfig => ({
  mode: DisplayMode.ZappingTop,
  layout: initialLayout,
  grid: isTv ? { size: 2, count: 4 } : { size: 3, count: 9 }
});

export const findLayoutIndex = (config: DisplayConfig) =>
  possibleLayouts.findIndex(layout =>
    layout.config.mode !== config.mode
      ? false
      : config.mode === DisplayMode.Grid
        ? layout.config.grid.size === config.grid.size &&
          layout.config.grid.count === config.grid.count
        : JSON.stringify(layout.config.layout) === JSON.stringify(config.layout)
  );
