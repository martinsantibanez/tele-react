import useLocalStorageState from 'use-local-storage-state';

const FULLSCREEN_ZAPPING_KEY = '_fullscreen_zapping_';

/**
 * Whether fullscreening a screen hands that tile to the zapping reel, so a
 * channel can be surfed without leaving fullscreen. On by default — it is a
 * phone's only way into the reel now that the layouts panel (where "Zapeo"
 * used to be picked as a whole-screen mode) is hidden there. Desktop still
 * has that panel, and this is where it can turn the behaviour back off.
 */
export function useFullscreenZapping(): [boolean, (enabled: boolean) => void] {
  const [enabled, setEnabled] = useLocalStorageState<boolean>(
    FULLSCREEN_ZAPPING_KEY,
    { defaultValue: true }
  );
  return [enabled, setEnabled];
}
