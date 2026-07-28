import { defaultGrid } from '../components/GridDisplay/initialGrid';
import { initialLayout } from '../components/Monitor/predefinedLayouts';
import { DisplayConfig, DisplayMode, ScreenType } from '../types/Monitor';
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
 * The list is never empty: there is no screen outside it, so the first one has
 * to exist before the user has saved anything.
 */
export const defaultSavedScreens: SavedScreen[] = [
  { name: 'Pantalla 1', screen: defaultScreen }
];
