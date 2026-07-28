import { useCallback, useRef } from 'react';
import { zappingWelcomeScreen } from '../components/GridDisplay/zappingWelcomeScreen';
import { embeddedSource } from '../sources';
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
  // Read at call time, not render time: the catalogue may still be the bundled
  // snapshot when this hook renders, and the callback has to stay stable so it
  // doesn't restart the activation poll.
  const zappingSources = useZappingSources();
  const sourcesRef = useRef(zappingSources);
  sourcesRef.current = zappingSources;

  return useCallback(() => {
    const bySlug = new Map(sourcesRef.current.map(src => [src.slug, src]));
    // Seeding from the bundled snapshot is safe: the node only carries a copy,
    // and the live catalogue is preferred over it once it has loaded.
    setGrid(
      zappingWelcomeScreen.sources.map(node => {
        const source = node.sourceSlug && bySlug.get(node.sourceSlug);
        return source ? { ...node, source: embeddedSource(source) } : node;
      })
    );
    setDisplayConfig(zappingWelcomeScreen.config);
  }, [setDisplayConfig, setGrid]);
}
