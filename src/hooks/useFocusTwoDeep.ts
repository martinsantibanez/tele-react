'use client';
import useLocalStorageState from 'use-local-storage-state';

/**
 * Whether the focus wall lays its previews two cells deep once there are
 * enough tiles (see `focusWallRects`). Kept for the device rather than each
 * saved screen: it is about how big the previews read on this wall.
 */
export function useFocusTwoDeep() {
  return useLocalStorageState<boolean>('_tele_focus_two_deep_', {
    defaultValue: false
  });
}
