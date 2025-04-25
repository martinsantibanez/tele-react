import useLocalStorageState from 'use-local-storage-state';
import { defaultGrid } from '../components/GridDisplay/initialGrid';
import { SourceNode } from '../types/Monitor';

export function useSavedGrid() {
  return useLocalStorageState<SourceNode[]>('__tele_grid__', {
    defaultValue: defaultGrid
  });
}
