import useLocalStorageState from 'use-local-storage-state';
import { ScreenType } from '../types/Monitor';

export type SavedScreen = {
  name: string;
  screen: ScreenType;
};

export function useSavedScreens() {
  return useLocalStorageState<SavedScreen[]>('_saved_screens_', {
    defaultValue: []
  });
}
