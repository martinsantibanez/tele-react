'use client';
import { useEffect, useRef, useState } from 'react';

/**
 * One tab out of however many have the page open, elected to do a thing the
 * others must not.
 *
 * The thing, here, is hosting the Spotify device: the Web Playback SDK
 * registers *one device per instance*, so two tabs each creating a player is
 * two devices in the account's list, playing two different things — exactly the
 * split the Connect player exists to avoid. Electing a host means the audio
 * comes out of one tab and every other tab is a remote control for it.
 *
 * The election is a lease in localStorage: whoever holds it rewrites its
 * timestamp on a heartbeat, and a lease that stops being rewritten is taken to
 * belong to a tab that has gone away. That is the whole protocol, and it is
 * deliberately the whole protocol — localStorage is shared and synchronous
 * across same-origin tabs, and a crashed tab cannot be relied on to clean up
 * after itself, so an expiring lease is the only thing that survives a browser
 * being force-quit.
 *
 * Two tabs can still claim at the same instant, both having read the same stale
 * lease. Last write wins, so the claim is confirmed by reading back a moment
 * later; the loser sees someone else's id and stands down. The window where
 * both believe they hold it is that read-back delay, which the caller should
 * treat as a real possibility rather than an impossible one.
 */

const HEARTBEAT_MS = 2000;
/** How long a lease outlives its last heartbeat before anyone may take it. */
const STALE_MS = 6000;
/** Long enough for a competing write to land before the claim is believed. */
const CONFIRM_MS = 250;

type Lease = { id: string; at: number };

function readLease(key: string): Lease | undefined {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as Lease;
    return typeof parsed?.id === 'string' && typeof parsed?.at === 'number'
      ? parsed
      : undefined;
  } catch {
    return undefined;
  }
}

function writeLease(key: string, lease: Lease) {
  try {
    window.localStorage.setItem(key, JSON.stringify(lease));
  } catch {
    // A full or blocked localStorage costs the election, not the app: every
    // tab simply reads no lease and the caller falls back to not hosting.
  }
}

function clearLease(key: string, id: string) {
  try {
    if (readLease(key)?.id === id) window.localStorage.removeItem(key);
  } catch {
    /* see writeLease */
  }
}

/**
 * Whether this tab holds `key`. `wanted` is what puts the tab in the running at
 * all — a tab with nothing to host should not take the lease away from one that
 * is using it — and dropping it releases the lease immediately rather than
 * making the next tab wait out the staleness window.
 */
export function useTabLock(key: string, wanted: boolean): boolean {
  const [held, setHeld] = useState(false);
  const idRef = useRef<string>('');
  if (!idRef.current) {
    idRef.current =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`;
  }

  useEffect(() => {
    if (!wanted || typeof window === 'undefined') {
      setHeld(false);
      return;
    }
    const id = idRef.current;
    let confirmTimer: ReturnType<typeof setTimeout> | undefined;
    let disposed = false;

    const tick = () => {
      if (disposed) return;
      const lease = readLease(key);
      const mine = lease?.id === id;
      const stale = !lease || Date.now() - lease.at > STALE_MS;
      if (mine) {
        // Holding it: keep it warm.
        writeLease(key, { id, at: Date.now() });
        setHeld(true);
        return;
      }
      if (!stale) {
        setHeld(false);
        return;
      }
      // Up for grabs. Claim, then believe it only if it is still ours.
      writeLease(key, { id, at: Date.now() });
      clearTimeout(confirmTimer);
      confirmTimer = setTimeout(() => {
        if (disposed) return;
        setHeld(readLease(key)?.id === id);
      }, CONFIRM_MS);
    };

    tick();
    const interval = setInterval(tick, HEARTBEAT_MS);

    // Another tab writing the key is worth reacting to at once: it either took
    // the lease from us, or released one we can now take.
    const onStorage = (event: StorageEvent) => {
      if (event.key !== key) return;
      tick();
    };
    // `pagehide` covers the back/forward cache, which `beforeunload` does not.
    const onLeave = () => clearLease(key, id);
    window.addEventListener('storage', onStorage);
    window.addEventListener('pagehide', onLeave);

    return () => {
      disposed = true;
      clearTimeout(confirmTimer);
      clearInterval(interval);
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('pagehide', onLeave);
      clearLease(key, id);
      setHeld(false);
    };
  }, [key, wanted]);

  return held;
}
