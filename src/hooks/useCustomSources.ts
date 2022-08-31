import { useCallback } from 'react';
import useLocalStorageState from 'use-local-storage-state';
import { Source } from '../sources';

export function useCustomSources() {
  const [customSources, setCustomSources] = useLocalStorageState<Source[]>(
    '__tele_custom_source__',
    {
      defaultValue: [],
      ssr: true
    }
  );
  const createSource = useCallback(
    (newSource: Source) => {
      if (customSources.some(source => source.slug === newSource.slug)) return;
      setCustomSources(v => [...(v || []), newSource]);
    },
    [customSources, setCustomSources]
  );

  return { customSources, setCustomSources, createSource };
}
