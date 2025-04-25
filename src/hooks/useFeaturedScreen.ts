import useLocalStorageState from 'use-local-storage-state';
import { defaultGrid } from '../components/GridDisplay/initialGrid';
import { ScreenType } from '../types/Monitor';
import { defaultDisplayConfig } from './useDisplayConfig';

export function useFeaturedScreen() {
  return useLocalStorageState<ScreenType>('__tele_featured_monitor__', {
    defaultValue: {
      config: defaultDisplayConfig,
      sources: defaultGrid
    }
  });
}
