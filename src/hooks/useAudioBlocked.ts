'use client';
import { useSyncExternalStore } from 'react';

/**
 * Whether the browser is holding back the sound: a page may only unmute a
 * video once someone has clicked or pressed a key in it. Switching tiles from
 * the keyboard counts; switching them from a Stream Deck does not, and the
 * browser stops the newly heard tile instead. The player then keeps it going
 * muted and says so here, so the deck can ask for that one click.
 *
 * The next click or key press anywhere in the page lifts it (the players
 * unmute themselves on it as well), and it stays lifted for as long as the page
 * is open.
 */
let blocked = false;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach(listener => listener());

const lift = () => {
  if (!blocked) return;
  blocked = false;
  notify();
};

/** Called by a player the browser would not let play with sound. */
export function markAudioBlocked() {
  if (blocked || typeof document === 'undefined') return;
  blocked = true;
  // Before the players' own listeners, which are also on the capture phase.
  ['pointerdown', 'keydown'].forEach(event =>
    document.addEventListener(event, lift, { once: true, capture: true })
  );
  notify();
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const useAudioBlocked = () =>
  useSyncExternalStore(
    subscribe,
    () => blocked,
    () => false
  );
