import useLocalStorageState from 'use-local-storage-state';

export type ZappingConfig = {
  endpoint: string;
  token: string;
};

export function useZappingConfig() {
  const [zappingConfig, setZappingConfig, zappingConfigMeta] =
    useLocalStorageState<ZappingConfig>('__tele_zapping_config__', {
      defaultValue: undefined,
      ssr: true
    });

  return { zappingConfig, setZappingConfig, zappingConfigMeta };
}
