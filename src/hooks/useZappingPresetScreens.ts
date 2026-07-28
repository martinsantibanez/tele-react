import { useEffect, useRef } from 'react';
import useLocalStorageState from 'use-local-storage-state';
import { zappingPresetScreens } from '../components/GridDisplay/zappingPresetScreens';
import { embeddedSource } from '../sources';
import {
  SavedScreen,
  useActiveScreenIndex,
  useSavedScreens
} from './useSavedScreens';
import { useZappingSources } from './useZappingChannels';
import { useZappingLoginToken } from './useZappingConfig';

/**
 * Bumping this replays the seeding over the screens it already wrote, so an
 * edit to the presets reaches the people who were set up under the old ones.
 * Their own screens are left alone either way — only the preset names are
 * rewritten.
 */
const PRESET_SCREENS_VERSION = 1;

const SEEDED_VERSION_KEY = '_zapping_preset_screens_';

/**
 * Which version of the presets this browser has been set up with. Zero until it
 * has been, and reset on disconnect so pairing again starts the screens over.
 */
export function useZappingPresetsVersion() {
  return useLocalStorageState<number>(SEEDED_VERSION_KEY, { defaultValue: 0 });
}

/**
 * Mount once (see ClientProviders): fills the screen strip with the Zapping
 * presets once an account is configured, so a pairing lands on channels instead
 * of leaving the user on the default empty grid.
 *
 * They arrive as screens of their own, upserted by name — whatever the user was
 * working on is never written over, and re-running this (a version bump, a
 * second pairing) refreshes the presets rather than piling up copies of them.
 * Deleting one makes it stay deleted: the seeding only runs when the stored
 * version says it hasn't.
 */
export function useZappingPresetScreens() {
  const [savedScreens, setSavedScreens] = useSavedScreens();
  const [, setActiveIndex] = useActiveScreenIndex();
  const [seededVersion, setSeededVersion] = useZappingPresetsVersion();
  const [loginToken] = useZappingLoginToken();
  const zappingSources = useZappingSources();

  // Read at seeding time, not render time: this fires off the account being
  // configured, and neither the catalogue arriving nor the user editing a
  // screen is a reason to run it.
  const sourcesRef = useRef(zappingSources);
  sourcesRef.current = zappingSources;
  const savedScreensRef = useRef(savedScreens);
  savedScreensRef.current = savedScreens;

  useEffect(() => {
    if (!loginToken) return;
    if (seededVersion >= PRESET_SCREENS_VERSION) return;
    setSeededVersion(PRESET_SCREENS_VERSION);

    const bySlug = new Map(sourcesRef.current.map(src => [src.slug, src]));
    // Seeding from the bundled snapshot is safe: the node only carries a copy,
    // and the live catalogue is preferred over it once it has loaded.
    const resolve = (preset: SavedScreen): SavedScreen => ({
      name: preset.name,
      screen: {
        config: preset.screen.config,
        sources: preset.screen.sources.map(node => {
          const source = node.sourceSlug && bySlug.get(node.sourceSlug);
          return source ? { ...node, source: embeddedSource(source) } : node;
        })
      }
    });

    // Where the first preset ends up: the one it already occupies, or the end
    // of the list, since it is the first of them to be appended.
    const before = savedScreensRef.current;
    const firstIndex = before.findIndex(
      entry => entry.name === zappingPresetScreens[0].name
    );

    setSavedScreens(saved => {
      const next = [...saved];
      for (const preset of zappingPresetScreens) {
        const index = next.findIndex(entry => entry.name === preset.name);
        if (index === -1) next.push(resolve(preset));
        else next[index] = resolve(preset);
      }
      return next;
    });

    // Only worth switching to when the presets are new: refreshing a set the
    // user already has shouldn't pull them off the screen they are on.
    if (firstIndex === -1) setActiveIndex(before.length);
  }, [
    loginToken,
    seededVersion,
    setActiveIndex,
    setSavedScreens,
    setSeededVersion
  ]);
}
