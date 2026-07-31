'use client';
import { useCallback } from 'react';
import useLocalStorageState from 'use-local-storage-state';
import { SelectorCategories } from '../components/SelectSource/sourceCategories';

const CURSOR_KEY = '_zapping_cursor_';
const BAND_KEY = '_zapping_band_';

type Cursors = Partial<Record<SelectorCategories, string>>;

/**
 * The last catalogue actually zapped through.
 *
 * The reel follows the picker's tab, but the picker has a tab that is not a
 * catalogue at all — Layouts, which is where the reel itself is switched on
 * from. Standing there the reel has nothing to walk, and this is what it falls
 * back to: the band the user was last watching, rather than the top of the
 * first list in the app.
 */
export function useZappingBand() {
  return useLocalStorageState<SelectorCategories | undefined>(BAND_KEY, {
    defaultValue: undefined
  });
}

/**
 * Where the user was left in each band.
 *
 * Zapping runs in two directions: across the catalogues and down the channels
 * of one. Coming back to a catalogue should land on the channel it was left on,
 * not at the top of it — so the place is kept per band rather than as a single
 * position, and it is kept in storage, because coming back tomorrow is coming
 * back too.
 *
 * Stored as a slug and never as an index. The lists re-order underneath it on
 * their own clocks — the Zapping ranking re-polls every minute, YouTube lives
 * come and go, the TV feed refreshes hourly — and an index would quietly drift
 * onto a different channel while it was being watched.
 */
export function useZappingCursor() {
  const [cursors, setCursors] = useLocalStorageState<Cursors>(CURSOR_KEY, {
    defaultValue: {}
  });

  const setCursor = useCallback(
    (category: SelectorCategories, slug: string) =>
      setCursors(current =>
        current[category] === slug ? current : { ...current, [category]: slug }
      ),
    [setCursors]
  );

  return [cursors, setCursor] as const;
}
