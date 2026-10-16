import { defaultGrid } from '../components/GridDisplay/initialGrid';
import {
  initialLayout,
  twoSideBySideLayout
} from '../components/Monitor/predefinedLayouts';
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
      config: {
        mode: DisplayMode.Layout,
        layout: twoSideBySideLayout,
        grid: { size: 1 }
      },
      sources: defaultGrid.slice(0, 2)
    }
  },
  {
    name: '',
    screen: {
      config: {
        mode: DisplayMode.Grid,
        layout: initialLayout,
        grid: { size: 2 }
      },
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
    layout: config.mode === DisplayMode.Layout ? config.layout : undefined,
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
