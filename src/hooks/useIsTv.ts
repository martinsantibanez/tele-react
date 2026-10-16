'use client';
import { useSyncExternalStore } from 'react';

/** What the Android TV wrapper appends to the WebView's user agent. */
const TV_USER_AGENT_MARK = 'TeleTV/';

/**
 * Whether the app is running inside the TV wrapper. Read outside React too,
 * for the screens a first visit is seeded with (see `useSavedScreens`).
 */
export const isTvDevice = () =>
  typeof navigator !== 'undefined' &&
  navigator.userAgent.includes(TV_USER_AGENT_MARK);

// The user agent never changes under a running page.
const subscribe = () => () => {};
// Server-side there is no user agent to read, and not-a-TV is the safe guess.
const serverSnapshot = () => false;

/**
 * Whether the app is on a TV, driven by a remote: no pointer, no letter keys,
 * and a picture watched from across the room.
 */
export const useIsTv = () =>
  useSyncExternalStore(subscribe, isTvDevice, serverSnapshot);
