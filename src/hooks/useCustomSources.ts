import { useCallback } from 'react';
import useLocalStorageState from 'use-local-storage-state';
import { Source } from '../sources';

export function useCustomSources() {
  const [customSources, setCustomSources, customSourcesMeta] =
    useLocalStorageState<Source[]>('__tele_custom_source__', {
      defaultValue: [],
      ssr: true
    });
  const createSource = useCallback(
    (newSource: Source) => {
      setCustomSources(v => {
        if (v.some(source => source.slug === newSource.slug)) return v;
        return [...(v || []), newSource];
      });
    },
    [setCustomSources]
  );

  return { customSources, setCustomSources, createSource, customSourcesMeta };
}
