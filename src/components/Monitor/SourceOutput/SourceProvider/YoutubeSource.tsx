'use client';
import { CSSProperties, useCallback, useEffect, useRef, useState } from 'react';

type Props = {
  videoId?: string;
  channelId?: string;
  muted?: boolean;
  /**
   * Whether the embed itself answers to the pointer. Off by default: a click on
   * a YouTube player is a play/pause toggle, so picking a tile on the wall
   * would stop the very stream it was picking. See `shield` below.
   */
  interactive?: boolean;
};

/**
 * The size YouTube has to believe the player is before it serves HD. The
 * embed picks its stream from how big the player measures itself, so these
 * two numbers are what decides the quality of every YouTube tile: raise them
 * for a sharper picture at the cost of bandwidth and decoding, lower them to
 * go easy on a wall full of screens.
 */
const TARGET_WIDTH = 1920;
const TARGET_HEIGHT = 1080;

/**
 * Ceiling on how far a tile may be blown up. A short, wide tile would
 * otherwise ask for an absurd layout — the video only fills part of it, so the
 * factor needed to reach HD grows with how far from 16:9 the tile is.
 */
const MAX_UPSCALE = 4;

/** Tile size measured off the DOM; null until the first measurement lands. */
type Box = { width: number; height: number };

/**
 * A tile in a nine-up grid is a few hundred pixels wide, and at that size the
 * embed settles for 360p — asking for better won't move it, because YouTube
 * sizes the stream to the player rather than to any quality setting. So lay
 * the iframe out at HD and scale it back down: the embedded page measures
 * itself as ~1920x1080 and asks for the stream that matches, while on screen
 * it covers exactly the tile it was given. The blown-up box keeps the tile's
 * own aspect ratio, so nothing ends up stretched or cropped.
 *
 * Until the tile has been measured, and whenever it is already big enough on
 * its own, the iframe just fills its box the plain way.
 */
function scaleToHd(box: Box | null): CSSProperties {
  const fill = { width: '100%', height: '100%' };
  if (!box || box.width <= 0 || box.height <= 0) return fill;

  const upscale = Math.min(
    MAX_UPSCALE,
    Math.max(1, TARGET_WIDTH / box.width, TARGET_HEIGHT / box.height)
  );
  if (upscale <= 1) return fill;

  return {
    width: box.width * upscale,
    height: box.height * upscale,
    transform: `scale(${1 / upscale})`,
    transformOrigin: '0 0'
  };
}

// YouTube embeds bake the mute state into the URL, so changing `muted` would
// otherwise force a full reload. Instead we enable the IFrame API and drive
// mute/unMute over postMessage, which toggles audio without reloading.
export function YoutubeSource({
  videoId,
  channelId,
  muted = true,
  interactive = false
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [box, setBox] = useState<Box | null>(null);

  // Always start muted: browsers only allow autoplay while muted. We unmute
  // afterwards via the API when requested.
  const src = videoId
    ? `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&modestbranding=1&showinfo=0&enablejsapi=1`
    : `https://www.youtube-nocookie.com/embed/live_stream?channel=${channelId}&autoplay=1&mute=1&modestbranding=1&showinfo=0&enablejsapi=1`;

  const post = useCallback((func: string, args: unknown[] = []) => {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: 'command', func, args }),
      '*'
    );
  }, []);

  // Track the tile, since the same source is a ninth of the wall one moment
  // and the whole screen the next.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => {
      const { width, height } = el.getBoundingClientRect();
      setBox(prev =>
        prev && prev.width === width && prev.height === height
          ? prev
          : { width, height }
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const func = muted ? 'mute' : 'unMute';
    // The player may not accept commands until it has finished loading, so we
    // send the command immediately and retry a few times to cover readiness.
    post(func);
    const timers = [200, 600, 1500].map(delay =>
      setTimeout(() => post(func), delay)
    );
    return () => timers.forEach(clearTimeout);
  }, [muted, post]);

  const handleLoad = () => {
    post(muted ? 'mute' : 'unMute');
    // Best effort only: current players treat quality as their own call and
    // ignore this. Kept because it costs one message and still lands on the
    // players that do honour it — `scaleToHd` is what actually works.
    post('setPlaybackQuality', ['hd1080']);
  };

  /**
   * The shield. A click inside the frame is YouTube's to interpret, and what it
   * makes of one on the picture is "pause" — there is no way to take that back
   * from out here, since the event never crosses the frame boundary. So the
   * frame is made deaf to the pointer instead: the press falls through to the
   * tile behind it, which is the thing that wanted the click in the first
   * place. Mute and quality are driven over postMessage regardless, so nothing
   * this component does actually needs the player to be clickable.
   *
   * Fullscreen is the exception — one channel, nothing to pick, and the
   * player's own controls are worth having back.
   */
  const style = {
    ...scaleToHd(box),
    ...(interactive ? {} : { pointerEvents: 'none' as const })
  };

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden">
      <iframe
        ref={iframeRef}
        src={src}
        className="absolute left-0 top-0"
        style={style}
        frameBorder="0"
        allow="autoplay; encrypted-media"
        onLoad={handleLoad}
      />
    </div>
  );
}
