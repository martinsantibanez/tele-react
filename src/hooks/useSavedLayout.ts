import useLocalStorageState from 'use-local-storage-state';
import { initialLayout } from '../pages/layout/initialLayout';
import { LayoutType } from '../pages/layout/types';

export function useSavedLayout() {
  return useLocalStorageState<LayoutType | undefined>('__tele_layout__', {
    ssr: true,
    defaultValue: initialLayout
  });
}
