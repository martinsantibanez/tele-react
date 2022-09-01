import useLocalStorageState from 'use-local-storage-state';
import { initialGrid } from '../components/GridDisplay/initialGrid';
import { SourceNode } from '../pages/monitor/types';

export function useSavedGrid() {
  return useLocalStorageState<SourceNode[]>('__tele_grid__', {
    defaultValue: initialGrid,
    ssr: true
  });
}
