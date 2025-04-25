import { useCallback } from 'react';
import useLocalStorageState from 'use-local-storage-state';
import { SourceType } from '../sources';

export function useCustomSources() {
  const [customSources, setCustomSources, customSourcesMeta] =
    useLocalStorageState<SourceType[]>('_tele_custom_source_', {
      defaultValue: []
    });
  const createSource = useCallback(
    (newSource: SourceType) => {
      setCustomSources(v => {
        if (v.some(source => source.slug === newSource.slug)) return v;
        return [...(v || []), newSource];
      });
    },
    [setCustomSources]
  );

  return { customSources, setCustomSources, createSource, customSourcesMeta };
}
