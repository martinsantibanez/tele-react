'use client';

import useLocalStorageState from 'use-local-storage-state';

export function useSavedSelectedItem() {
  return useLocalStorageState<string | undefined>('_tele_selected_item__');
}
