import useLocalStorageState from 'use-local-storage-state';

export function useFeaturedSource() {
  return useLocalStorageState<string | undefined>('__tele_featured__', {
    ssr: true,
    defaultValue: undefined
  });
}
