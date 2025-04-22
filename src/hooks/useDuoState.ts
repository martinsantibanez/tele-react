import useLocalStorageState from 'use-local-storage-state';

export const DEFAULT_GRID_SIZE = 3;
export type DuoState = {
  preview: string;
  program: string;
};

export function useDuoState() {
  return useLocalStorageState<DuoState>('__tele_duo__', {
    defaultValue: {
      preview: 'Barras',
      program: 'Barras'
    }
  });
}
