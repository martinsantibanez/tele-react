import useLocalStorageState from 'use-local-storage-state';
import { initialLayout } from '../pages/monitor/initialLayout';
import { DisplayConfig, DisplayMode } from '../pages/monitor/types';

const defaultValue: DisplayConfig = {
  mode: DisplayMode.Layout,
  layout: initialLayout,
  grid: { size: 4 }
};
export function useDisplayConfig() {
  return useLocalStorageState<DisplayConfig>('__tele_display_config__', {
    ssr: true,
    defaultValue
  });
}
