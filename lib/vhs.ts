// The bits of VHS (video.js's HLS engine) the players reach into.
export type VhsPlaylist = {
  disabled?: boolean;
  excludeUntil?: number;
  attributes?: { BANDWIDTH?: number };
  resolvedUri?: string;
  mediaSequence?: number;
  segments?: { duration: number }[];
};
export type Vhs = {
  playlists?: {
    master?: { playlists?: VhsPlaylist[] };
    /** The media playlist being played. */
    media?: () => VhsPlaylist | undefined;
  };
  selectPlaylist: () => VhsPlaylist | undefined;
};

type Player = {
  tech: (iWillNotUseThisInPlugins: boolean) => unknown;
  seekable: () => TimeRanges;
};

/** A video.js player's VHS, once it is playing HLS. */
export const vhsOf = (player: Player) =>
  (player.tech(true) as { vhs?: Vhs } | undefined)?.vhs;

/**
 * What a stream holds, in player seconds: from where it can be sought to the
 * end of its last segment. Past the end of `seekable`, which on a live stream
 * stops three segments short of live, though the player plays on into them.
 */
export const heldRange = (player: Player) => {
  const seekable = player.seekable();
  if (!seekable?.length) return undefined;
  const start = seekable.start(0);
  const listed = (vhsOf(player)?.playlists?.media?.()?.segments ?? []).reduce(
    (end, segment) => end + segment.duration,
    start
  );
  return {
    start,
    end: Math.max(seekable.end(seekable.length - 1), listed)
  };
};

/**
 * The highest-bandwidth rendition VHS has not ruled out (for failing, or for
 * a codec the device can't play).
 */
export const topPlaylist = (vhs: Vhs) => {
  const now = Date.now();
  return (vhs.playlists?.master?.playlists ?? [])
    .filter(pl => !pl.disabled && !((pl.excludeUntil ?? 0) > now))
    .reduce<VhsPlaylist | undefined>(
      (best, pl) =>
        !best ||
        (pl.attributes?.BANDWIDTH ?? 0) > (best.attributes?.BANDWIDTH ?? 0)
          ? pl
          : best,
      undefined
    );
};
