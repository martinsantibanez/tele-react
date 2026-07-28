import { Dispatch, SetStateAction, useCallback } from 'react';
import { DisplayConfig } from '../types/Monitor';
import { useActiveScreen } from './useSavedScreens';

/**
 * How the screen on air is arranged. A view over the active saved screen, so
 * changing the layout edits the screen the user is working on — there is no
 * separate live config to save afterwards.
 */
export function useDisplayConfig(): [
  DisplayConfig,
  Dispatch<SetStateAction<DisplayConfig>>
] {
  const [screen, setScreen] = useActiveScreen();

  const setDisplayConfig = useCallback<
    Dispatch<SetStateAction<DisplayConfig>>
  >(
    update =>
      setScreen(current => ({
        ...current,
        config: typeof update === 'function' ? update(current.config) : update
      })),
    [setScreen]
  );

  return [screen.config, setDisplayConfig];
}
