'use client';
import {
  Loader2,
  Music,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume2
} from 'lucide-react';
import { useEffect, useRef } from 'react';
import {
  useSpotifyPlayer,
  useSpotifyProgress
} from '../../../../hooks/useSpotifyPlayer';

type Props = {
  /** Canonical `spotify:type:id`; see `parseSpotifyRef`. */
  uri: string;
  muted?: boolean;
  /** The channel's own name and art, for when nothing is playing yet. */
  name?: string;
  imageUrl?: string;
};

const clock = (ms: number) => {
  const total = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

/**
 * A Spotify tile backed by a real Connect device.
 *
 * The difference from `SpotifyEmbed` is where the music lives. Nothing here
 * holds any audio: the tile reads the account's one playback session and issues
 * transport commands against it, and the sound comes out of whichever device is
 * active — the browser tab hosting the Web Playback SDK, usually, but equally a
 * phone or a speaker. Two tiles showing the same playlist are therefore two
 * views of one thing, and so are two tabs, and so is the Spotify app on your
 * phone. That is the property the embed could not have.
 *
 * `muted` keeps the meaning it has on the embed — the un-muted tile is the one
 * you hear — but it now means it across the whole session rather than inside an
 * iframe, so un-muting a tile is literally "play this on the device" and muting
 * it is "pause the device". Only *changes* to it are acted on. A tile that
 * simply mounts un-muted, which is what a restored layout looks like, does not
 * start anything: this player can reach the phone in your pocket, and opening a
 * page is not permission to start playing on it.
 */
export function SpotifyConnect({ uri, muted = true, name, imageUrl }: Props) {
  // Not `useSpotifyPlayerTile` — the retain belongs to `SpotifySource`, which
  // holds it whichever of the two views it ends up rendering.
  const { playback, play, pause, skip, status, error } = useSpotifyPlayer();
  const position = useSpotifyProgress(playback);

  // Whether the session is playing *this* tile's channel. A playlist or album
  // is what it is played from — the context — while a single track or episode
  // is the item itself, so both are worth comparing against.
  const isCurrent =
    !!playback && (playback.contextUri === uri || playback.trackUri === uri);
  const isPlaying = isCurrent && playback.isPlaying;

  // Read inside the mute effect without making it re-run when they change:
  // the effect is about the user flipping a switch, not about Spotify's state
  // moving underneath it. Without this, pausing from your phone would be
  // undone instantly by a tile that still considers itself un-muted.
  const stateRef = useRef({ isCurrent, isPlaying });
  stateRef.current = { isCurrent, isPlaying };

  const lastRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    const key = `${uri}|${muted}`;
    const first = lastRef.current === undefined;
    if (lastRef.current === key) return;
    lastRef.current = key;
    // Mounting is not a command. See the note about the phone in your pocket.
    if (first) return;
    if (muted) {
      if (stateRef.current.isCurrent && stateRef.current.isPlaying) pause();
      return;
    }
    // Un-muting the tile that is already the session's just resumes it; any
    // other tile takes the session over.
    play(stateRef.current.isCurrent ? undefined : uri);
  }, [uri, muted, play, pause]);

  const title = isCurrent ? (playback?.trackName ?? name) : name;
  const subtitle = isCurrent ? playback?.artists : undefined;
  const art = (isCurrent ? playback?.imageUrl : undefined) ?? imageUrl;
  const duration = isCurrent ? (playback?.duration ?? 0) : 0;
  const progress = duration ? Math.min(100, (position / duration) * 100) : 0;

  const toggle = () => {
    if (isPlaying) pause();
    else play(isCurrent ? undefined : uri);
  };

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-neutral-950 text-white">
      {art && (
        // The cover, blown up and blurred, is the tile's background — the same
        // trick the Spotify app plays, and it keeps a wall of tiles from being
        // a wall of black rectangles.
        <img
          src={art}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full scale-110 object-cover opacity-40 blur-2xl"
        />
      )}

      <div className="relative flex h-full w-full flex-col items-center justify-center gap-3 p-4 text-center">
        <div className="relative aspect-square w-full max-w-[45%] min-h-0 flex-shrink overflow-hidden rounded-md bg-white/10 shadow-lg">
          {art ? (
            <img
              src={art}
              alt={title ?? 'Spotify'}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Music className="h-1/3 w-1/3 opacity-40" />
            </div>
          )}
        </div>

        <div className="w-full min-w-0">
          <div className="truncate text-sm font-semibold" title={title}>
            {title ?? 'Spotify'}
          </div>
          {subtitle && (
            <div className="truncate text-xs opacity-70" title={subtitle}>
              {subtitle}
            </div>
          )}
        </div>

        {isCurrent && duration > 0 && (
          <div className="flex w-full max-w-[80%] items-center gap-2 text-[10px] tabular-nums opacity-70">
            <span>{clock(position)}</span>
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-white transition-[width] duration-500 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span>{clock(duration)}</span>
          </div>
        )}

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => skip('previous')}
            disabled={!isCurrent}
            aria-label="Anterior"
            className="opacity-70 transition hover:opacity-100 disabled:opacity-20"
          >
            <SkipBack className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={toggle}
            aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black transition hover:scale-105"
          >
            {status === 'loading' ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="ml-0.5 h-5 w-5" />
            )}
          </button>
          <button
            type="button"
            onClick={() => skip('next')}
            disabled={!isCurrent}
            aria-label="Siguiente"
            className="opacity-70 transition hover:opacity-100 disabled:opacity-20"
          >
            <SkipForward className="h-4 w-4" />
          </button>
        </div>

        {/* Where the sound is actually coming out. Worth showing: the whole
            point is that it need not be this tab, and a user wondering why the
            play button did nothing audible is usually a user playing to a
            device in another room. */}
        {isCurrent && playback?.deviceName && (
          <div className="flex items-center gap-1 text-[10px] text-green-400">
            <Volume2 className="h-3 w-3" />
            <span className="truncate">{playback.deviceName}</span>
          </div>
        )}

        {error && (
          <div className="max-w-full px-2 text-[10px] leading-tight text-amber-300">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
