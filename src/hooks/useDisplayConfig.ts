import useLocalStorageState from 'use-local-storage-state';
import { initialLayout } from '../pages/monitor/predefinedLayouts';
import { DisplayConfig, DisplayMode } from '../pages/monitor/types';

export const defaultDisplayConfig: DisplayConfig = {
  mode: DisplayMode.Layout,
  layout: initialLayout,
  grid: { size: 4 }
};
export function useDisplayConfig() {
  return useLocalStorageState<DisplayConfig>('__tele_display_config__', {
    defaultValue: defaultDisplayConfig
  });
}
