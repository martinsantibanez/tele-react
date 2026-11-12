import { useSyncExternalStore } from 'react';

/**
 * Which YouTube videos a player on the page is still in the middle of.
 *
 * The live poll says when a broadcast has ended, but the viewer is never at the
 * broadcast's edge: there is the player's own latency, and whatever the viewer
 * rewound. A channel dropped from the poll is kept for as long as a player is
 * still going through its stream (see `useYoutubeLiveSources`), so the end of a
 * live is the end of what the viewer was watching, not the moment the
 * broadcaster stopped.
 *
 * Keyed by video id, since that is all a player knows about itself; each
 * player holds its own claim, so two tiles on the same stream do not let go of
 * it for one another.
 */
const claims = new Map<string, Set<symbol>>();
const releases = new Map<symbol, ReturnType<typeof setTimeout>>();
const listeners = new Set<() => void>();
let snapshot: ReadonlySet<string> = new Set();

/**
 * How long a player that went away keeps its stream. Moving a tile between the
 * wall and fullscreen can mount a new player for it, which takes a moment to
 * report back — the stream must not drop out in between.
 */
const RELEASE_GRACE_MS = 10_000;

function publish() {
  snapshot = new Set(claims.keys());
  listeners.forEach(listener => listener());
}

function setClaim(videoId: string, player: symbol, playing: boolean) {
  const pending = releases.get(player);
  if (pending) {
    clearTimeout(pending);
    releases.delete(player);
  }
  const holders = claims.get(videoId);
  if (playing) {
    if (holders?.has(player)) return;
    claims.set(videoId, new Set(holders).add(player));
  } else {
    if (!holders?.has(player)) return;
    const rest = new Set(holders);
    rest.delete(player);
    if (rest.size) claims.set(videoId, rest);
    else claims.delete(videoId);
  }
  publish();
}

/** A player is still going through `videoId` (playing, paused or loading). */
export const claimPlayback = (videoId: string, player: symbol) =>
  setClaim(videoId, player, true);

/** A player has come to the end of `videoId`, or given up on it. */
export const releasePlayback = (videoId: string, player: symbol) =>
  setClaim(videoId, player, false);

/** A player went away; its claim lapses unless it is back within the grace. */
export function releasePlaybackSoon(videoId: string, player: symbol) {
  if (!claims.get(videoId)?.has(player) || releases.has(player)) return;
  releases.set(
    player,
    setTimeout(() => {
      releases.delete(player);
      setClaim(videoId, player, false);
    }, RELEASE_GRACE_MS)
  );
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
const getSnapshot = () => snapshot;

/** The video ids some player on the page has not finished with. */
export const useStillPlaying = () =>
  useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
