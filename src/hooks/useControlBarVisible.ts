import useLocalStorageState from 'use-local-storage-state';
import { useIsMobile } from './useViewport';

const CONTROL_BAR_KEY = '_control_bar_visible_';

/**
 * Whether the strip of saved screens under the monitor is showing.
 *
 * Unset until the user says otherwise, and only then remembered: a phone has no
 * height to spare and starts with the strip out of the way behind its floating
 * button, a desktop starts with it open. Storing the *choice* rather than the
 * state is what lets the same setup do both.
 */
export function useControlBarVisible(): [boolean, (visible: boolean) => void] {
  const isMobile = useIsMobile();
  const [chosen, setChosen] = useLocalStorageState<boolean | null>(
    CONTROL_BAR_KEY,
    { defaultValue: null }
  );

  return [chosen ?? !isMobile, setChosen];
}
