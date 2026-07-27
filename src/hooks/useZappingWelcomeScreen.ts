import { useCallback, useRef } from 'react';
import { zappingWelcomeScreen } from '../components/GridDisplay/zappingWelcomeScreen';
import { useCustomSources } from './useCustomSources';
import { useDisplayConfig } from './useDisplayConfig';
import { useSavedGrid } from './useSavedGrid';
import { useZappingSources } from './useZappingChannels';

/**
 * Returns the callback that drops the user straight into a working screen of
 * Zapping channels once their account is linked — otherwise a fresh pairing
 * leaves them on the default grid with nothing from the account they just
 * connected. Wired to the activation poll in ClientProviders.
 */
export function useZappingWelcomeScreen() {
  const [, setGrid] = useSavedGrid();
  const [, setDisplayConfig] = useDisplayConfig();
  const { createSource } = useCustomSources();
  // Read at call time, not render time: the catalogue may still be the bundled
  // snapshot when this hook renders, and the callback has to stay stable so it
  // doesn't restart the activation poll.
  const zappingSources = useZappingSources();
  const sourcesRef = useRef(zappingSources);
  sourcesRef.current = zappingSources;

  return useCallback(() => {
    const bySlug = new Map(sourcesRef.current.map(src => [src.slug, src]));
    zappingWelcomeScreen.sources.forEach(({ sourceSlug }) => {
      const source = sourceSlug && bySlug.get(sourceSlug);
      // `createSource` leaves channels the user already has alone, and
      // `useZappingSourceSync` re-points stale urls, so seeding from the
      // snapshot is safe.
      if (source) createSource(source);
    });
    setGrid(zappingWelcomeScreen.sources);
    setDisplayConfig(zappingWelcomeScreen.config);
  }, [createSource, setDisplayConfig, setGrid]);
}
