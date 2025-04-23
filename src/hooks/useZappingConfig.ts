import useSessionStorageState from 'use-session-storage-state';

export function useZappingToken() {
  const [zappingToken, setZappingToken, zappingTokenMeta] =
    useSessionStorageState<string | undefined>('playToken', {
      defaultValue: undefined
    });

  return { zappingToken, setZappingToken, zappingTokenMeta };
}
