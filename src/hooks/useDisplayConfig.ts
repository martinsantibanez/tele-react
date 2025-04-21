import useLocalStorageState from 'use-local-storage-state';
import { initialLayout } from '../_pages/monitor/predefinedLayouts';
import { DisplayConfig, DisplayMode } from '../_pages/monitor/types';

export const DEFAULT_GRID_SIZE = 3;

export const defaultDisplayConfig: DisplayConfig = {
  mode: DisplayMode.Layout,
  layout: initialLayout,
  grid: { size: DEFAULT_GRID_SIZE }
};
export function useDisplayConfig() {
  return useLocalStorageState<DisplayConfig>('__tele_display_config__', {
    defaultValue: defaultDisplayConfig
  });
}
