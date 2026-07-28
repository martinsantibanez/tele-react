'use client';
import { useCustomTwitchAccounts } from './useCustomTwitchAccounts';
import { useDisplayConfig } from './useDisplayConfig';
import { useFavourites } from './useFavourites';
import { useFeaturedScreen } from './useFeaturedScreen';
import { useSavedGrid } from './useSavedGrid';
import { useSavedSelectedItem } from './useSavedSelectedItem';
import {
  useZappingActivationState,
  useZappingLoginToken,
  useZappingToken
} from './useZappingConfig';

export const useCleanLocalStorage = () => {
  const [, , gridStorage] = useSavedGrid();
  const [, , featuredScreenStorage] = useFeaturedScreen();
  const [, , selectedItemStorage] = useSavedSelectedItem();
  const { favouritesMeta } = useFavourites();
  const [, , twitchAccountsMeta] = useCustomTwitchAccounts();
  const [, , displayConfigStorage] = useDisplayConfig();
  const [, , zappingTokenMeta] = useZappingToken();
  const [, , zappingLoginTokenMeta] = useZappingLoginToken();
  const [, , zappingActivationMeta] = useZappingActivationState();

  return () => {
    gridStorage.removeItem();
    selectedItemStorage.removeItem();
    featuredScreenStorage.removeItem();
    favouritesMeta.removeItem();
    twitchAccountsMeta.removeItem();
    displayConfigStorage.removeItem();
    zappingTokenMeta.removeItem();
    zappingLoginTokenMeta.removeItem();
    zappingActivationMeta.removeItem();
  };
};
