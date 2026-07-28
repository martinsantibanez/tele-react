import { Dispatch, SetStateAction, useCallback, useRef } from 'react';
import useLocalStorageState from 'use-local-storage-state';
import { ScreenType } from '../types/Monitor';
import {
  defaultDisplayConfig,
  defaultSavedScreens,
  defaultScreen
} from './defaultScreen';

export type SavedScreen = {
  name: string;
  screen: ScreenType;
};

const SAVED_SCREENS_KEY = '_saved_screens_';
const ACTIVE_SCREEN_KEY = '_active_screen_';

// The screen on air used to live on its own, beside the saved list; it is now
// simply the active entry of that list.
const LEGACY_GRID_KEY = '_tele_grid_';
const LEGACY_CONFIG_KEY = '_tele_display_config_v2_';

/**
 * Folds a pre-tabs setup into the list, as the screen the user is left on, so
 * upgrading doesn't drop whatever they had on air. Runs once at import time,
 * before any hook reads the storage, and clears the old keys so it can't run
 * twice.
 */
function migrateLegacyScreen() {
  if (typeof window === 'undefined') return;
  const storedSources = window.localStorage.getItem(LEGACY_GRID_KEY);
  const storedConfig = window.localStorage.getItem(LEGACY_CONFIG_KEY);
  if (!storedSources && !storedConfig) return;
  window.localStorage.removeItem(LEGACY_GRID_KEY);
  window.localStorage.removeItem(LEGACY_CONFIG_KEY);
  try {
    const storedScreens = window.localStorage.getItem(SAVED_SCREENS_KEY);
    const saved: SavedScreen[] = storedScreens ? JSON.parse(storedScreens) : [];
    const screen: ScreenType = {
      config: storedConfig ? JSON.parse(storedConfig) : defaultDisplayConfig,
      sources: storedSources ? JSON.parse(storedSources) : defaultScreen.sources
    };
    window.localStorage.setItem(
      SAVED_SCREENS_KEY,
      JSON.stringify([{ name: 'Pantalla actual', screen }, ...saved])
    );
    window.localStorage.setItem(ACTIVE_SCREEN_KEY, '0');
  } catch {
    // A setup we can't read isn't worth keeping the user out of the app for.
  }
}

migrateLegacyScreen();

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
