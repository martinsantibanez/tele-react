import useLocalStorageState from 'use-local-storage-state';
import { ScreenType } from '../types/Monitor';
import { defaultScreen } from './defaultScreen';

export function useFeaturedScreen() {
  return useLocalStorageState<ScreenType>('_tele_featured_monitor_', {
    defaultValue: defaultScreen
  });
}
