import { defaultGrid } from '../components/GridDisplay/initialGrid';
import { gridConfig } from '../components/SelectSource/layoutOptions';
import {
  DisplayConfig,
  DisplayMode,
  GridSize,
  ScreenType
} from '../types/Monitor';
import type { SavedScreen } from './useSavedScreens';

/** What a computer starts on: the six channels of the default grid, 3 × 2. */
export const defaultScreen: ScreenType = {
  config: gridConfig(3, defaultGrid.length),
  sources: defaultGrid
};

/**
 * What a phone starts on. The six-way grid is a wall of postage stamps on a
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

/**
 * What a TV starts on. A TV box plays one or two streams smoothly, so the
 * first screen is two channels side by side; four in a grid is the next one,
 * a Channel Up away, for a box that copes. Unnamed, like any new screen: the
 * thumbnails tell them apart.
 */
export const tvSavedScreens: SavedScreen[] = [
  {
    name: '',
    screen: {
      config: gridConfig(2, 2),
      sources: defaultGrid.slice(0, 2)
    }
  },
  {
    name: '',
    screen: {
      config: gridConfig(2, 4),
      sources: defaultGrid.slice(0, 4)
    }
  }
];

/** Every screen the app starts a device on, before the user touches any. */
const starterScreens: ScreenType[] = [
  ...defaultSavedScreens,
  ...mobileSavedScreens,
  ...tvSavedScreens
].map(saved => saved.screen);

/** What makes two screens the same to look at: arrangement and channels. */
const screenShape = ({ config, sources }: ScreenType) =>
  JSON.stringify({
    mode: config.mode,
    grid: config.grid.size,
    count: config.grid.count,
    sources: sources.map(node => [node.sourceSlug, node.activeSignal])
  });

const starterShapes = new Set(starterScreens.map(screenShape));

/**
 * Whether a screen is still one the app started the user on, untouched. Such a
 * screen is the app's placeholder rather than the user's, and can be swapped
 * for better ones (see `useZappingPresetScreens`) without losing anything.
 */
export const isStarterScreen = (screen: ScreenType) =>
  starterShapes.has(screenShape(screen));
