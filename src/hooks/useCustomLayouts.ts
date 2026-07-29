'use client';
import { Dispatch, SetStateAction, useCallback } from 'react';
import useLocalStorageState from 'use-local-storage-state';
import {
  bannerLayout,
  featuredWallLayout,
  mainAndRailLayout,
  newsroomLayout,
  nineUpLayout,
  railLeftLayout,
  sideColumnLayout,
  twoHalvesLayout,
  wideMainLayout
} from '../components/Monitor/predefinedLayouts';
import { LayoutType } from '../types/Monitor';
import { uuid } from '../utils/uuid';

export type CustomLayout = {
  id: string;
  name: string;
  layout: LayoutType;
};

const CUSTOM_LAYOUTS_KEY = '_custom_layouts_';

/**
 * What the list starts as, so the editor opens on something worth watching
 * rather than an empty shelf. They are ordinary entries: load one, change it,
 * save it under another name — or throw it away, and it stays thrown away.
 */
export const starterLayouts: CustomLayout[] = [
  {
    id: 'starter-principal-3',
    name: 'Principal + 3 laterales',
    layout: mainAndRailLayout
  },
  { id: 'starter-principal-6', name: 'Principal + 6', layout: newsroomLayout },
  {
    id: 'starter-principal-ancha-5',
    name: 'Principal ancha + 5',
    layout: wideMainLayout
  },
  { id: 'starter-2-grandes-4', name: '2 grandes + 4', layout: twoHalvesLayout },
  { id: 'starter-mosaico-9', name: 'Mosaico 9', layout: nineUpLayout },
  {
    id: 'starter-principal-derecha',
    name: 'Principal a la derecha',
    layout: railLeftLayout
  },
  { id: 'starter-destacada-8', name: 'Destacada + 8', layout: featuredWallLayout },
  { id: 'starter-franja', name: 'Franja inferior', layout: bannerLayout },
  {
    id: 'starter-columna',
    name: 'Columna vertical',
    layout: sideColumnLayout
  }
];

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
    { defaultValue: starterLayouts }
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
