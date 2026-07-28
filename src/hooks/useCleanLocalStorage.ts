'use client';
import { useCustomTwitchAccounts } from './useCustomTwitchAccounts';
import { useFavourites } from './useFavourites';
import { useFeaturedScreen } from './useFeaturedScreen';
import { useActiveScreenIndex, useSavedScreens } from './useSavedScreens';
import { useSavedSelectedItem } from './useSavedSelectedItem';
import {
  useZappingActivationState,
  useZappingLoginToken,
  useZappingToken
} from './useZappingConfig';
import { useZappingPresetsVersion } from './useZappingPresetScreens';

export const useCleanLocalStorage = () => {
  const [, , savedScreensStorage] = useSavedScreens();
  const [, , activeScreenStorage] = useActiveScreenIndex();
  const [, , featuredScreenStorage] = useFeaturedScreen();
  const [, , selectedItemStorage] = useSavedSelectedItem();
  const { favouritesMeta } = useFavourites();
  const [, , twitchAccountsMeta] = useCustomTwitchAccounts();
  const [, , zappingTokenMeta] = useZappingToken();
  const [, , zappingLoginTokenMeta] = useZappingLoginToken();
  const [, , zappingActivationMeta] = useZappingActivationState();
  const [, , zappingPresetsMeta] = useZappingPresetsVersion();

  return () => {
    savedScreensStorage.removeItem();
    activeScreenStorage.removeItem();
    selectedItemStorage.removeItem();
    featuredScreenStorage.removeItem();
    favouritesMeta.removeItem();
    twitchAccountsMeta.removeItem();
    zappingTokenMeta.removeItem();
    zappingLoginTokenMeta.removeItem();
    zappingActivationMeta.removeItem();
    zappingPresetsMeta.removeItem();
  };
};
