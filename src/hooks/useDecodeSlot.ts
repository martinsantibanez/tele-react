'use client';
import {
  createContext,
  useContext,
  useEffect,
  useId,
  useSyncExternalStore
} from 'react';
import { isTvDevice } from './useIsTv';

/**
 * How many video.js players a TV can keep decoding at once, and which ones
 * get to.
 *
 * TV hardware runs out in one of two ways. Some boxes have a fixed number of
 * hardware decoders and refuse the next one outright: the player sits on its
 * buffer with no picture, and the WebView never falls back to software. Others
 * hand out decoders freely but slow down all together once there are too many
 * streams, dropping frames on every tile. Either way, a tile over the limit
 * makes the ones under it worse, so it is better parked than playing.
 *
 * The wrapper tells us what the hardware claims (`(decoders=N)` in the user
 * agent), which is only a ceiling: a box claiming 16 keeps up with 4. The
 * players then report when they starve or stutter, and the cap comes down to
 * what the TV actually holds. It is kept, so the next visit starts there.
 *
 * Desktops and phones have no cap.
 */

const STORAGE_KEY = '_tv_decode_cap_';
/** Nothing above this was ever seen to hold, whatever the hardware claims. */
const MAX_CAP = 4;
/** What a TV whose wrapper does not say gets to try. */
const DEFAULT_CAP = MAX_CAP;
/** Players need a while to settle after the cap moves; reports in it are noise. */
const SETTLE_MS = 20000;
/** Two stuttering players within this window mean the TV, not one stream. */
const SLOW_WINDOW_MS = 15000;
/** A cap learned this long ago gets to try one more, in case it was a bad day. */
const RETRY_AFTER_MS = 7 * 24 * 60 * 60 * 1000;

/** `at`: when the cap was last lowered. */
type Stored = { declared: number | null; cap: number; at?: number };

const declaredDecoders = (): number | null => {
  const match = navigator.userAgent.match(/TeleTV\/\S+ \(decoders=(\d+)\)/);
  return match ? Number(match[1]) : null;
};

const readStored = (): Stored | undefined => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Stored) : undefined;
  } catch {
    return undefined;
  }
};

const writeStored = (stored: Stored) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  } catch {
    // Without storage the cap is relearned each visit; nothing breaks.
  }
};

let cap: number | undefined;
let declared: number | null = null;

/** The cap, worked out on first use: desktops never get here. */
const currentCap = () => {
  if (cap !== undefined) return cap;
  declared = declaredDecoders();
  const ceiling = Math.max(1, Math.min(declared ?? DEFAULT_CAP, MAX_CAP));
  const stored = readStored();
  // A new wrapper may say something different about the same TV; what was
  // learned under the old claim no longer applies.
  if (!stored || stored.declared !== declared) {
    cap = ceiling;
  } else {
    const stale = Date.now() - (stored.at ?? 0) > RETRY_AFTER_MS;
    cap = Math.max(1, Math.min(stored.cap + (stale ? 1 : 0), ceiling));
  }
  return cap;
};

type Claim = {
  id: string;
  screen: number;
  preferred: boolean;
  order: number;
};

const claims = new Map<string, Claim>();
let granted = new Set<string>();
/** Screens whose player is waiting for a slot; replaced, never mutated. */
let parkedScreens: ReadonlySet<number> = new Set();
let nextOrder = 0;
let lastLoweredAt = 0;
const slowReports = new Map<string, number>();
const listeners = new Set<() => void>();

const sameSet = <T>(a: ReadonlySet<T>, b: ReadonlySet<T>) =>
  a.size === b.size && Array.from(a).every(x => b.has(x));

const recompute = () => {
  const ranked = Array.from(claims.values()).sort(
    (a, b) =>
      Number(b.preferred) - Number(a.preferred) ||
      a.screen - b.screen ||
      a.order - b.order
  );
  const next = new Set(ranked.slice(0, currentCap()).map(c => c.id));
  const parked = new Set(
    ranked.filter(c => !next.has(c.id)).map(c => c.screen)
  );
  const grantedChanged = !sameSet(next, granted);
  const parkedChanged = !sameSet(parked, parkedScreens);
  granted = next;
  if (parkedChanged) parkedScreens = parked;
  if (grantedChanged || parkedChanged) listeners.forEach(l => l());
};

const lowerCap = (kind: 'starved' | 'slow') => {
  const now = Date.now();
  if (now - lastLoweredAt < SETTLE_MS) return;
  // Only a TV at its cap has learned anything: below it, the trouble is the
  // stream's own.
  const live = granted.size;
  if (live < 2 || live < currentCap()) return;
  lastLoweredAt = now;
  slowReports.clear();
  cap = live - 1;
  writeStored({ declared, cap, at: now });
  console.info(`[decode] ${kind}: down to ${cap} playing at once`);
  recompute();
};

/**
 * A playing player saying the TV is not keeping up with it:
 * - `starved`: its buffer is full but no frame has come out, the mark of a
 *   decoder refused. One is enough.
 * - `slow`: it decodes but drops a good share of its frames. A single stream
 *   can do that on its own, so it takes two at once.
 */
export const reportDecodeTrouble = (id: string, kind: 'starved' | 'slow') => {
  if (!granted.has(id)) return;
  const now = Date.now();
  if (now - lastLoweredAt < SETTLE_MS) return;
  if (kind === 'starved') return lowerCap(kind);
  slowReports.set(id, now);
  const recent = Array.from(slowReports.values()).filter(
    at => now - at < SLOW_WINDOW_MS
  );
  if (recent.length >= 2) lowerCap(kind);
};

/**
 * Where a player sits on the wall: its screen, whether it is the selected one
 * (first in line for a decoder), and whether it fills the screen.
 */
export const DecodeSlotContext = createContext<{
  screen: number;
  preferred: boolean;
  fullscreen?: boolean;
}>({ screen: Number.MAX_SAFE_INTEGER, preferred: false });

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

/**
 * Whether this player may decode, and its id for reporting trouble. A player
 * that is not `active` (held paused) needs no decoder and always may stay.
 * The selected tile goes first, then the wall in order.
 */
export const useDecodeSlot = (active: boolean) => {
  const id = useId();
  const { screen, preferred } = useContext(DecodeSlotContext);
  const tv = typeof navigator !== 'undefined' && isTvDevice();
  const enabled = tv && active;

  useEffect(() => {
    if (!enabled) return;
    const existing = claims.get(id);
    claims.set(id, {
      id,
      screen,
      preferred,
      order: existing?.order ?? nextOrder++
    });
    recompute();
  }, [enabled, id, screen, preferred]);

  useEffect(() => {
    if (!enabled) return;
    return () => {
      claims.delete(id);
      slowReports.delete(id);
      recompute();
    };
  }, [enabled, id]);

  const live = useSyncExternalStore(
    subscribe,
    () => granted.has(id),
    () => true
  );
  // Before its first claim lands a player has no answer yet; holding it back
  // a frame is cheaper than starting one that is let go straight after.
  return { id, live: !enabled || live };
};

const noParkedScreens: ReadonlySet<number> = new Set();

/**
 * The screens on the wall whose player is parked for want of a decoder, so
 * the wall can shrink them and give the room to the ones playing.
 */
export const useParkedScreens = () =>
  useSyncExternalStore(
    subscribe,
    () => parkedScreens,
    () => noParkedScreens
  );
