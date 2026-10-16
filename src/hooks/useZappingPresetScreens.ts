import { useEffect, useRef } from 'react';
import useLocalStorageState from 'use-local-storage-state';
import {
  tvRetiredPresetNames,
  tvZappingPresetScreens,
  zappingPresetScreens
} from '../components/GridDisplay/zappingPresetScreens';
import { embeddedSource } from '../sources';
import { isStarterScreen } from './defaultScreen';
import { isTvDevice } from './useIsTv';
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

/**
 * The TV's own count, so a change to its set replays the seeding on the boxes
 * alone instead of over every desktop and phone that was set up as well. 2
 * takes `Vista general` off the TVs that were seeded with it.
 */
const TV_PRESET_SCREENS_VERSION = 2;

// Versioned with the saved screens (see `useSavedScreens`): a reset list has
// to be seeded again.
const SEEDED_VERSION_KEY = '_zapping_preset_screens_v2_';

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
 * The starter screens go at the same time, as long as they are untouched: they
 * are the open-web channels Zapping replaces, and only ever there as a stand-in
 * until something better was set up. A screen the user changed stays.
 *
 * They arrive as screens of their own, upserted by name — whatever the user was
 * working on is never written over, and re-running this (a version bump, a
 * second pairing) refreshes the presets rather than piling up copies of them.
 * Deleting one makes it stay deleted: the seeding only runs when the stored
 * version says it hasn't.
 */
export function useZappingPresetScreens() {
  const [savedScreens, setSavedScreens] = useSavedScreens();
  const activeIndexState = useActiveScreenIndex();
  const [, setActiveIndex] = activeIndexState;
  const activeIndexRef = useRef(activeIndexState);
  activeIndexRef.current = activeIndexState;
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
    const isTv = isTvDevice();
    const version = isTv ? TV_PRESET_SCREENS_VERSION : PRESET_SCREENS_VERSION;
    if (seededVersion >= version) return;
    setSeededVersion(version);

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

    const presets = isTv ? tvZappingPresetScreens : zappingPresetScreens;
    const before = savedScreensRef.current;
    // A preset the TV has retired goes the way of the starters: the box was
    // only ever holding it because the seeding put it there.
    const kept = before.filter(
      entry =>
        !isStarterScreen(entry.screen) &&
        !(isTv && tvRetiredPresetNames.includes(entry.name))
    );
    const isNew = !before.some(entry => entry.name === presets[0].name);

    const next = [...kept];
    for (const preset of presets) {
      const index = next.findIndex(entry => entry.name === preset.name);
      if (index === -1) next.push(resolve(preset));
      else next[index] = resolve(preset);
    }
    setSavedScreens(next);

    // New presets are where the user should land. Refreshing a set they already
    // have shouldn't pull them off the screen they are on — unless that screen
    // was a starter, and is gone.
    const [activeIndex] = activeIndexRef.current;
    const onAir = before[activeIndex];
    const onAirIndex = onAir ? next.indexOf(onAir) : -1;
    setActiveIndex(
      isNew || onAirIndex === -1
        ? next.findIndex(entry => entry.name === presets[0].name)
        : onAirIndex
    );
  }, [
    loginToken,
    seededVersion,
    setActiveIndex,
    setSavedScreens,
    setSeededVersion
  ]);
}
