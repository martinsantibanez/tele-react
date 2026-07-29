'use client';
import { Dispatch, SetStateAction, useCallback } from 'react';
import useLocalStorageState from 'use-local-storage-state';
import { LayoutType } from '../types/Monitor';
import { uuid } from '../utils/uuid';

export type CustomLayout = {
  id: string;
  name: string;
  layout: LayoutType;
};

const CUSTOM_LAYOUTS_KEY = '_custom_layouts_';

/**
 * The layouts the user has drawn themselves. They live beside `possibleLayouts`
 * rather than in it: that list ships with the app, this one belongs to the
 * browser it was drawn in.
 */
export function useCustomLayouts(): [
  CustomLayout[],
  Dispatch<SetStateAction<CustomLayout[]>>
] {
  const [layouts, setLayouts] = useLocalStorageState<CustomLayout[]>(
    CUSTOM_LAYOUTS_KEY,
    { defaultValue: [] }
  );
  return [layouts, setLayouts];
}

/** Saves under a name, replacing the layout already going by it. */
export function useSaveCustomLayout() {
  const [, setLayouts] = useCustomLayouts();
  return useCallback(
    (name: string, layout: LayoutType) => {
      const id = uuid();
      setLayouts(saved => {
        const existing = saved.findIndex(entry => entry.name === name);
        if (existing < 0) return [...saved, { id, name, layout }];
        return saved.map((entry, idx) =>
          idx === existing ? { ...entry, name, layout } : entry
        );
      });
    },
    [setLayouts]
  );
}
