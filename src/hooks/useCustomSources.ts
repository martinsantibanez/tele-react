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

  const updateSource = useCallback(
    (slug: string, patch: Partial<SourceType>) => {
      setCustomSources(v =>
        v.map(source => (source.slug === slug ? { ...source, ...patch } : source))
      );
    },
    [setCustomSources]
  );

  const toggleFavourite = useCallback(
    (source: SourceType) => {
      setCustomSources(v => {
        if (!v.some(s => s.slug === source.slug)) {
          return [...v, { ...source, favourite: true }];
        }
        return v.map(s =>
          s.slug === source.slug ? { ...s, favourite: !s.favourite } : s
        );
      });
    },
    [setCustomSources]
  );

  return {
    customSources,
    setCustomSources,
    createSource,
    updateSource,
    toggleFavourite,
    customSourcesMeta
  };
}
