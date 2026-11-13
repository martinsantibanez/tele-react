import { Dispatch, SetStateAction, useCallback, useRef } from 'react';
import useLocalStorageState from 'use-local-storage-state';
import { fillSlots } from '../components/Monitor/screenSlots';
import { possibleLayouts } from '../components/SelectSource/layoutOptions';
import { CLOCK_SOURCE_SLUG } from '../sources/relojes';
import { DisplayConfig, ScreenType, SourceNode } from '../types/Monitor';
import {
  defaultSavedScreens,
  defaultScreen,
  mobileSavedScreens,
  tvSavedScreens
} from './defaultScreen';
import { isTvDevice } from './useIsTv';
import { isMobileViewport } from './useViewport';

export type SavedScreen = {
  name: string;
  screen: ScreenType;
};

// Versioned: screens from before the arrangements had a fixed number of
// screens each are dropped rather than carried over, and everyone starts again
// from the defaults. Bump both together to do it again.
const SAVED_SCREENS_KEY = '_saved_screens_v2_';
const ACTIVE_SCREEN_KEY = '_active_screen_v2_';
const RETIRED_KEYS = [
  '_saved_screens_',
  '_active_screen_',
  '_tele_grid_',
  '_tele_display_config_v2_',
  '_tele_featured_monitor_',
  '_fullscreen_zapping_',
  '_zapping_preset_screens_'
];

/** Clears what older versions left in storage. Runs once, at import time. */
function dropRetiredKeys() {
  if (typeof window === 'undefined') return;
  try {
    RETIRED_KEYS.forEach(key => window.localStorage.removeItem(key));
  } catch {
    // Storage can be off altogether; then there is nothing to clear either.
  }
}

dropRetiredKeys();

/** A screen as an older version may have stored it. */
type StoredScreen = {
  config: Omit<DisplayConfig, 'mode'> & {
    mode: DisplayConfig['mode'] | 'Layout';
    layout?: unknown[];
  };
  sources?: SourceNode[];
};

/** The clock before the app drew its own: a third-party page in a frame. */
const RETIRED_CLOCK_SLUG = 'RELOJ_CHILE';

/**
 * The desktop starter as it was, a big screen and five small ones, by channel
 * and signal. Untouched, it is still the app's placeholder rather than the
 * user's screen, and becomes the starter as it is now.
 */
const RETIRED_DESKTOP_STARTER = [
  'custom_24-horas|m3u8',
  'custom_t13|m3u8',
  'custom_chilevision|',
  'custom_meganoticias|m3u8',
  'custom_cnn-cl|m3u8',
  `${RETIRED_CLOCK_SLUG}|`
].join(',');

const channelsOf = (sources: SourceNode[]) =>
  sources
    .map(node => `${node.sourceSlug ?? ''}|${node.activeSignal ?? ''}`)
    .join(',');

/**
 * Brings a stored screen up to date. Screens from when an arrangement could
 * also be a fixed layout — a big screen with small ones around it, two side by
 * side — come back as the grid with as many screens: two side by side are
 * still that, the five and six way ones a 3 × 2. The big screen is what the
 * focus wall is for now. The layout they carried goes, so what is stored is
 * what is drawn. The old clock becomes the app's own.
 */
const migrateScreen = ({ config, sources = [] }: StoredScreen): ScreenType => {
  if (
    config.mode === 'Layout' &&
    channelsOf(sources) === RETIRED_DESKTOP_STARTER
  )
    return defaultScreen;
  const { layout, ...rest } = config;
  const nodes = sources.map(node =>
    node.sourceSlug === RETIRED_CLOCK_SLUG
      ? { ...node, sourceSlug: CLOCK_SOURCE_SLUG }
      : node
  );
  if (rest.mode !== 'Layout')
    return { config: rest as DisplayConfig, sources: nodes };
  const slots = layout?.length ?? 0;
  const fit =
    possibleLayouts.find(option => (option.config.grid.count ?? 0) >= slots) ??
    possibleLayouts[possibleLayouts.length - 1];
  // A five way layout lands on a six screen grid: the slot it lacked is an
  // empty one, as picking the grid by hand would give it.
  return {
    config: fit.config,
    sources: fillSlots(nodes, fit.config.grid.count ?? 0)
  };
};

/** Rewrites the stored screens once, at import time, if any is out of date. */
function migrateSavedScreens() {
  if (typeof window === 'undefined') return;
  try {
    const raw = window.localStorage.getItem(SAVED_SCREENS_KEY);
    if (!raw) return;
    const stored: { name: string; screen: StoredScreen }[] = JSON.parse(raw);
    if (!Array.isArray(stored)) return;
    const migrated: SavedScreen[] = stored.map(entry => ({
      ...entry,
      screen: migrateScreen(entry.screen)
    }));
    const next = JSON.stringify(migrated);
    if (next !== raw) window.localStorage.setItem(SAVED_SCREENS_KEY, next);
  } catch {
    // Unreadable or off: the hook falls back to the defaults on its own.
  }
}

migrateSavedScreens();

/**
 * Gives a phone (or a TV) the screens meant for it the first time the app is
 * opened there.
 * Written straight to storage, at import time like the migration above, because
 * `useLocalStorageState` keeps whatever default it is handed on its first
 * render *and* stores it there and then: by the time an effect could report the
 * viewport, the desktop screen would already be the user's.
 *
 * Only the very first visit is seeded — afterwards the screens are the user's,
 * whatever they are being looked at on.
 */
function seedDeviceScreens() {
  if (typeof window === 'undefined') return;
  const seed = isTvDevice()
    ? tvSavedScreens
    : isMobileViewport()
      ? mobileSavedScreens
      : undefined;
  if (!seed) return;
  try {
    if (window.localStorage.getItem(SAVED_SCREENS_KEY)) return;
    window.localStorage.setItem(SAVED_SCREENS_KEY, JSON.stringify(seed));
  } catch {
    // Storage can be off altogether (private mode, blocked cookies); the app
    // still runs, just on the desktop default.
  }
}

seedDeviceScreens();

/**
 * The screens the user works on — tabs rather than snapshots: every change
 * lands on the active one, so there is nothing to save by hand.
 */
export function useSavedScreens() {
  const [stored, setStored, storage] = useLocalStorageState<SavedScreen[]>(
    SAVED_SCREENS_KEY,
    { defaultValue: defaultSavedScreens }
  );

  // An empty list would leave the app with no screen at all, so it falls back
  // to the default one on the way in and on the way out.
  const savedScreens = stored.length ? stored : defaultSavedScreens;

  const setSavedScreens = useCallback<Dispatch<SetStateAction<SavedScreen[]>>>(
    update =>
      setStored(previous => {
        const current = previous.length ? previous : defaultSavedScreens;
        const next = typeof update === 'function' ? update(current) : update;
        return next.length ? next : defaultSavedScreens;
      }),
    [setStored]
  );

  return [savedScreens, setSavedScreens, storage] as const;
}

/**
 * Which screen is on air. Stored on its own — the screens themselves are the
 * only other state, and switching between them rewrites nothing.
 */
export function useActiveScreenIndex() {
  const [savedScreens] = useSavedScreens();
  const [stored, setStored, storage] = useLocalStorageState<number>(
    ACTIVE_SCREEN_KEY,
    { defaultValue: 0 }
  );

  // Deleting screens can leave the stored index pointing past the end of the
  // list, and so can another tab of the app doing it.
  const activeIndex = Math.min(Math.max(stored, 0), savedScreens.length - 1);

  return [activeIndex, setStored, storage] as const;
}

/**
 * The screen on air, as a piece of state that writes straight back into the
 * list: the entry it came from is edited in place.
 */
export function useActiveScreen(): [
  ScreenType,
  Dispatch<SetStateAction<ScreenType>>
] {
  const [savedScreens, setSavedScreens] = useSavedScreens();
  const [activeIndex] = useActiveScreenIndex();

  // Read the target through a ref to keep the setter stable: the hotkeys that
  // edit the grid memoize their handler, so a setter bound to the index at
  // registration time would keep writing to the screen the user has left.
  const activeIndexRef = useRef(activeIndex);
  activeIndexRef.current = activeIndex;

  const setActiveScreen = useCallback<Dispatch<SetStateAction<ScreenType>>>(
    update =>
      setSavedScreens(saved =>
        saved.map((entry, index) =>
          index === activeIndexRef.current
            ? {
                ...entry,
                screen:
                  typeof update === 'function' ? update(entry.screen) : update
              }
            : entry
        )
      ),
    [setSavedScreens]
  );

  return [savedScreens[activeIndex].screen, setActiveScreen];
}

/** Adds a screen to the list and leaves the user working on it. */
export function useAddSavedScreen() {
  const [savedScreens, setSavedScreens] = useSavedScreens();
  const [, setActiveIndex] = useActiveScreenIndex();
  // The new screen goes last, so where it lands is how long the list is now.
  // Read from a ref to keep the callback stable: callers hang it off effects
  // and polls, where a new identity means running the whole thing again.
  const countRef = useRef(savedScreens.length);
  countRef.current = savedScreens.length;

  return useCallback(
    (name: string, screen: ScreenType) => {
      setSavedScreens(saved => [...saved, { name, screen }]);
      setActiveIndex(countRef.current);
    },
    [setSavedScreens, setActiveIndex]
  );
}

/**
 * Starts a new screen as a copy of the one on air, unnamed — its thumbnail is
 * what tells it apart — and leaves the user working on it.
 */
export function useNewSavedScreen() {
  const addSavedScreen = useAddSavedScreen();
  const [activeScreen] = useActiveScreen();
  const activeScreenRef = useRef(activeScreen);
  activeScreenRef.current = activeScreen;

  return useCallback(
    () => addSavedScreen('', activeScreenRef.current),
    [addSavedScreen]
  );
}
