'use client';
import { useCallback, useMemo, useSyncExternalStore } from 'react';

/**
 * A hand-held, either way up. Narrow enough that the sidebar would leave no
 * room for the monitor — or, held sideways, wide but far too short for it.
 * Desktop windows are never that short, so the height half of the query is
 * what keeps a phone in landscape on the touch UI.
 */
export const MOBILE_QUERY =
  '(max-width: 767px), (max-height: 500px) and (pointer: coarse)';

const LANDSCAPE_QUERY = '(orientation: landscape)';

/**
 * Read outside React, for the one decision that cannot wait for an effect: the
 * screen a first-time visitor is given is written to storage by the very first
 * render, so the viewport has to be known before it.
 */
export const isMobileViewport = () =>
  typeof window !== 'undefined' && window.matchMedia(MOBILE_QUERY).matches;

/** Server-side there is no viewport to measure, and desktop is the safe guess. */
const serverSnapshot = () => false;

export function useMediaQuery(query: string) {
  const subscribe = useMemo(
    () => (onChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener('change', onChange);
      return () => list.removeEventListener('change', onChange);
    },
    [query]
  );
  const getSnapshot = useCallback(
    () => window.matchMedia(query).matches,
    [query]
  );
  return useSyncExternalStore(subscribe, getSnapshot, serverSnapshot);
}

export const useIsMobile = () => useMediaQuery(MOBILE_QUERY);

/**
 * What the UI is being laid out on. Landscape only says anything once we are on
 * a phone: a phone on its side has almost no height to spare, so the bars have
 * to give theirs back to the picture.
 */
export function useViewport() {
  const isMobile = useIsMobile();
  const isLandscape = useMediaQuery(LANDSCAPE_QUERY);
  return {
    isMobile,
    isLandscape,
    isMobileLandscape: isMobile && isLandscape
  };
}
