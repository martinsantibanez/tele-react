import { defaultGrid } from '../components/GridDisplay/initialGrid';
import { initialLayout } from '../components/Monitor/predefinedLayouts';
import {
  DisplayConfig,
  DisplayMode,
  GridSize,
  ScreenType
} from '../types/Monitor';
import type { SavedScreen } from './useSavedScreens';

export const DEFAULT_GRID_SIZE = 3;

export const defaultDisplayConfig: DisplayConfig = {
  mode: DisplayMode.Layout,
  layout: initialLayout,
  grid: { size: DEFAULT_GRID_SIZE }
};

export const defaultScreen: ScreenType = {
  config: defaultDisplayConfig,
  sources: defaultGrid
};

/**
 * What a phone starts on. The six-way layout is a wall of postage stamps on a
 * hand-held, so it opens on a single column — the first three channels of the
 * usual screen, stacked, each one wide enough to actually watch.
 */
export const MOBILE_GRID_SIZE: GridSize = 1;
export const MOBILE_SOURCE_COUNT = 3;
/** A phone on its side has the width for twice as many — the whole default grid. */
export const MOBILE_LANDSCAPE_SOURCE_COUNT = defaultGrid.length;
/** Three across, two down — the six landscape tiles as a square-ish block. */
export const MOBILE_LANDSCAPE_GRID_COLUMNS = 3;

export const mobileDisplayConfig: DisplayConfig = {
  mode: DisplayMode.Grid,
  layout: initialLayout,
  grid: { size: MOBILE_GRID_SIZE }
};

export const mobileScreen: ScreenType = {
  config: mobileDisplayConfig,
  sources: defaultGrid.slice(0, MOBILE_SOURCE_COUNT)
};

/**
 * The list is never empty: there is no screen outside it, so the first one has
 * to exist before the user has saved anything.
 */
export const defaultSavedScreens: SavedScreen[] = [
  { name: 'Pantalla 1', screen: defaultScreen }
];

export const mobileSavedScreens: SavedScreen[] = [
  { name: 'Pantalla 1', screen: mobileScreen }
];
