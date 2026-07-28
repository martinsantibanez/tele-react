import { Dispatch, SetStateAction, useCallback } from 'react';
import { SourceNode } from '../types/Monitor';
import { useActiveScreen } from './useSavedScreens';

/**
 * What is playing in each slot of the screen on air. Like `useDisplayConfig`,
 * a view over the active saved screen: swapping a channel is a change to that
 * screen, kept the moment it happens.
 */
export function useSavedGrid(): [
  SourceNode[],
  Dispatch<SetStateAction<SourceNode[]>>
] {
  const [screen, setScreen] = useActiveScreen();

  const setSources = useCallback<Dispatch<SetStateAction<SourceNode[]>>>(
    update =>
      setScreen(current => ({
        ...current,
        sources: typeof update === 'function' ? update(current.sources) : update
      })),
    [setScreen]
  );

  return [screen.sources, setSources];
}
