import { useEffect, useRef, useState } from 'react';
import {
  YOUTUBE_LAYOUT_NAME,
  youtubeLayoutConfig
} from '../components/SelectSource/layoutOptions';
import { DisplayMode, ScreenType } from '../types/Monitor';
import {
  useActiveScreenIndex,
  useAddSavedScreen,
  useSavedScreens
} from './useSavedScreens';

/**
 * The flag the OAuth callback bounces back with, on the page the connect was
 * launched from.
 */
const CONNECTED_PARAM = 'youtube';
const CONNECTED_VALUE = 'connected';

/**
 * The dynamic view as a screen: its tiles are the channels that are live at
 * render time, so there is nothing to store beside the mode.
 */
export const youtubeLiveScreen: ScreenType = {
  config: youtubeLayoutConfig,
  sources: []
};

// One arrival, one screen. Connecting is a full page load
// (`useYoutubeAuth.connect` assigns the location), so this is false again every
// time the user really comes back from Google; what it stops is StrictMode's
// double-mount seeding twice.
let handled = false;

/**
 * Mount once, on the page the picker lives on: linking a YouTube account is
 * only ever done to watch the live subscriptions, so completing the login puts
 * that view on the strip as a screen of its own and leaves the user on it —
 * instead of a connected account that shows nothing until the layout is found
 * by hand.
 *
 * Like the Zapping presets, the screen is the user's from then on: it is theirs
 * to rename, edit or delete, and connecting again switches to the one already
 * there rather than piling up copies.
 */
export function useYoutubeLoginScreen() {
  const [savedScreens] = useSavedScreens();
  const [, setActiveIndex] = useActiveScreenIndex();
  const addSavedScreen = useAddSavedScreen();
  const [justConnected, setJustConnected] = useState(false);

  // Read at seeding time, not render time: this fires off the arrival, and the
  // user editing their screens afterwards is no reason to run it again.
  const savedScreensRef = useRef(savedScreens);
  savedScreensRef.current = savedScreens;

  // Reading the URL is a first-render job; adding the screen is not — the
  // stored list is only itself once the page has hydrated, so the flag is what
  // puts the seeding on the far side of a render.
  useEffect(() => {
    if (handled) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get(CONNECTED_PARAM) !== CONNECTED_VALUE) return;
    handled = true;

    // Drop the flag from the URL, so reloading the page the user was returned
    // to isn't another arrival.
    params.delete(CONNECTED_PARAM);
    const query = params.toString();
    window.history.replaceState(
      null,
      '',
      `${window.location.pathname}${query ? `?${query}` : ''}${
        window.location.hash
      }`
    );
    setJustConnected(true);
  }, []);

  useEffect(() => {
    if (!justConnected) return;
    setJustConnected(false);

    // Reconnecting — a lapsed session, another account — has the screen it
    // would add already on the strip, so it is switched to rather than doubled.
    const existing = savedScreensRef.current.findIndex(
      saved => saved.screen.config.mode === DisplayMode.Youtube
    );
    if (existing >= 0) {
      setActiveIndex(existing);
      return;
    }
    addSavedScreen(YOUTUBE_LAYOUT_NAME, youtubeLiveScreen);
  }, [justConnected, addSavedScreen, setActiveIndex]);
}
