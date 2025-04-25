import useLocalStorageState from 'use-local-storage-state';
import { defaultGrid } from '../components/GridDisplay/initialGrid';
import { ScreenType } from '../types/Monitor';
import { defaultDisplayConfig } from './useDisplayConfig';

export function useFeaturedScreen() {
  return useLocalStorageState<ScreenType>('_tele_featured_monitor_', {
    defaultValue: {
      config: defaultDisplayConfig,
      sources: defaultGrid
    }
  });
}
