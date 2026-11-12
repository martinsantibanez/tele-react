'use client';
import { useEffect, useRef, useState } from 'react';
import useLocalStorageState from 'use-local-storage-state';
import { useTabLock } from './useTabLock';

/**
 * Remote control from a Stream Deck, through the plugin in `streamdeck/`.
 *
 * A page cannot accept connections, so the plugin is the one listening, on
 * localhost: the page follows its commands as Server-Sent Events and posts
 * back what it is showing, for the keys to draw. Keep the port in step with
 * the plugin's.
 */
const BRIDGE_URL = 'http://127.0.0.1:39741';

/**
 * Opt-in, per browser: reaching localhost from the deployed site makes Chrome
 * ask for permission, which nobody without a deck should be asked. Turned on
 * with `?streamdeck=1` in the address (and off with `?streamdeck=0`).
 */
const ENABLED_KEY = '_streamdeck_';
/** Only one tab answers the deck: the visible one that got there first. */
const LOCK_KEY = '_streamdeck_tab_';

/**
 * What a key press asks for. A tile is pressed to be heard, and pressed again
 * to go fullscreen and back.
 */
export type StreamDeckCommand =
  | { type: 'screen'; index: number }
  | { type: 'tile'; index: number }
  | { type: 'mute' };

/** Where a tile sits on the monitor, as fractions of it: x0, y0, x1, y1. */
export type TileRect = [number, number, number, number];

/**
 * What the keys show. The deck copies the monitor's arrangement onto its keys,
 * so each tile goes with its place (measured when it is sent).
 */
export type StreamDeckState = {
  screens: { name: string }[];
  activeScreen: number;
  tiles: { name: string; logo?: string }[];
  selectedTile: number;
  fullscreen: boolean;
  muted: boolean;
  /** The browser is holding the sound back until a click in the page. */
  audioBlocked: boolean;
};

const isCommand = (value: unknown): value is StreamDeckCommand => {
  if (!value || typeof value !== 'object') return false;
  const command = value as Record<string, unknown>;
  if (command.type === 'mute') return true;
  return (
    (command.type === 'screen' || command.type === 'tile') &&
    Number.isInteger(command.index)
  );
};

function useStreamDeckEnabled() {
  const [enabled, setEnabled] = useLocalStorageState<boolean>(ENABLED_KEY, {
    defaultValue: false
  });
  useEffect(() => {
    const flag = new URLSearchParams(window.location.search).get('streamdeck');
    if (flag === null) return;
    setEnabled(flag !== '0' && flag !== 'false');
  }, [setEnabled]);
  return enabled;
}

function useDocumentVisible() {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const update = () => setVisible(document.visibilityState === 'visible');
    update();
    document.addEventListener('visibilitychange', update);
    return () => document.removeEventListener('visibilitychange', update);
  }, []);
  return visible;
}

/**
 * Connects this tab to the deck. `measureTiles` is asked for the tiles' places
 * every time the state goes out, after the page has rendered; `layoutKey`
 * changes whenever they may have moved with nothing else changing.
 */
export function useStreamDeck({
  state,
  onCommand,
  measureTiles,
  layoutKey
}: {
  state: StreamDeckState;
  onCommand: (command: StreamDeckCommand) => void;
  measureTiles: () => (TileRect | undefined)[];
  layoutKey: string;
}) {
  const enabled = useStreamDeckEnabled();
  const visible = useDocumentVisible();
  const isHost = useTabLock(LOCK_KEY, enabled && visible);

  // Read through refs: the connection outlives every render.
  const commandRef = useRef(onCommand);
  const measureRef = useRef(measureTiles);
  useEffect(() => {
    commandRef.current = onCommand;
    measureRef.current = measureTiles;
  });
  const stateJson = JSON.stringify(state);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!isHost) return;
    // EventSource tries again on its own while the plugin is not running.
    const events = new EventSource(`${BRIDGE_URL}/events`);
    events.onopen = () => setConnected(true);
    events.onerror = () => setConnected(false);
    events.onmessage = event => {
      let command: unknown;
      try {
        command = JSON.parse(event.data);
      } catch {
        return;
      }
      if (isCommand(command)) commandRef.current(command);
    };
    return () => {
      events.close();
      setConnected(false);
    };
  }, [isHost]);

  // Every change goes to the deck, and the whole state again on connecting,
  // since the plugin may have been restarted with nothing to draw.
  useEffect(() => {
    if (!connected) return;
    const sent: StreamDeckState = JSON.parse(stateJson);
    const rects = measureRef.current();
    fetch(`${BRIDGE_URL}/state`, {
      method: 'POST',
      // Plain text keeps it a simple request: no preflight for every change.
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({
        ...sent,
        tiles: sent.tiles.map((tile, idx) => ({
          ...tile,
          // The plugin fetches it from outside the page.
          logo: tile.logo
            ? new URL(tile.logo, window.location.href).href
            : undefined,
          rect: rects[idx]
        }))
      })
    }).catch(() => {
      // The plugin went away; the event stream notices and reconnects.
    });
  }, [connected, stateJson, layoutKey]);
}
