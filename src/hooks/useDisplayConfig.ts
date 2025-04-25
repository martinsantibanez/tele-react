import useLocalStorageState from 'use-local-storage-state';
import { initialLayout } from '../components/Monitor/predefinedLayouts';
import { DisplayConfig, DisplayMode } from '../types/Monitor';

export const DEFAULT_GRID_SIZE = 3;

export const defaultDisplayConfig: DisplayConfig = {
  mode: DisplayMode.Layout,
  layout: initialLayout,
  grid: { size: DEFAULT_GRID_SIZE }
};
export function useDisplayConfig() {
  return useLocalStorageState<DisplayConfig>('_tele_display_config_', {
    defaultValue: defaultDisplayConfig
  });
}
