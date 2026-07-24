'use client';
import { useCallback, useEffect, useRef } from 'react';

type Props = {
  videoId?: string;
  channelId?: string;
  muted?: boolean;
};

// YouTube embeds bake the mute state into the URL, so changing `muted` would
// otherwise force a full reload. Instead we enable the IFrame API and drive
// mute/unMute over postMessage, which toggles audio without reloading.
export function YoutubeSource({ videoId, channelId, muted = true }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Always start muted: browsers only allow autoplay while muted. We unmute
  // afterwards via the API when requested.
  const src = videoId
    ? `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&modestbranding=1&showinfo=0&enablejsapi=1`
    : `https://www.youtube-nocookie.com/embed/live_stream?channel=${channelId}&autoplay=1&mute=1&modestbranding=1&showinfo=0&enablejsapi=1`;

  const post = useCallback((func: 'mute' | 'unMute') => {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: 'command', func, args: [] }),
      '*'
    );
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

  return (
    <iframe
      ref={iframeRef}
      src={src}
      className="w-full h-full"
      frameBorder="0"
      allow="autoplay; encrypted-media"
      onLoad={() => post(muted ? 'mute' : 'unMute')}
    />
  );
}
