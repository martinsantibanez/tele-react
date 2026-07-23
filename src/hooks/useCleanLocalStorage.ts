'use client';
import { useCustomSources } from './useCustomSources';
import { useDisplayConfig } from './useDisplayConfig';
import { useFeaturedScreen } from './useFeaturedScreen';
import { useSavedGrid } from './useSavedGrid';
import { useSavedSelectedItem } from './useSavedSelectedItem';
import {
  useZappingLoginToken,
  useZappingToken
} from './useZappingConfig';

export const useCleanLocalStorage = () => {
  const [, , gridStorage] = useSavedGrid();
  const [, , featuredScreenStorage] = useFeaturedScreen();
  const [, , selectedItemStorage] = useSavedSelectedItem();
  const { customSourcesMeta } = useCustomSources();
  const [, , displayConfigStorage] = useDisplayConfig();
  const [, , zappingTokenMeta] = useZappingToken();
  const [, , zappingLoginTokenMeta] = useZappingLoginToken();

  return () => {
    gridStorage.removeItem();
    selectedItemStorage.removeItem();
    featuredScreenStorage.removeItem();
    customSourcesMeta.removeItem();
    displayConfigStorage.removeItem();
    zappingTokenMeta.removeItem();
    zappingLoginTokenMeta.removeItem();
  };
};
