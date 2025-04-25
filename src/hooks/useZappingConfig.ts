import useSessionStorageState from 'use-session-storage-state';

export function useZappingToken() {
  return useSessionStorageState<string | undefined>('playToken', {
    defaultValue: window.sessionStorage.getItem('playToken') || undefined
  });
}
