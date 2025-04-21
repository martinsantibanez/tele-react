'use client';

import useLocalStorageState from 'use-local-storage-state';

export function useSavedSelectedItem() {
  return useLocalStorageState<string | undefined>('__tele_selected__');
}
