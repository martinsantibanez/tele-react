'use client';
import { useEffect, useRef, useState } from 'react';

/** Milliseconds, both of them. The event carries more; this is what is used. */
type PlaybackUpdate = { data?: { position?: number; duration?: number } };

type EmbedController = {
  play: () => void;
  resume: () => void;
  pause: () => void;
  destroy: () => void;
  addListener: (
    event: 'playback_update',
    callback: (update: PlaybackUpdate) => void
  ) => void;
};

type IFrameApi = {
  createController: (
    element: HTMLElement,
    options: { uri: string; width?: string | number; height?: string | number },
    callback: (controller: EmbedController) => void
  ) => void;
};

declare global {
  interface Window {
    onSpotifyIframeApiReady?: (api: IFrameApi) => void;
  }
}

const IFRAME_API_SRC = 'https://open.spotify.com/embed/iframe-api/v1';

// The API hands itself over through a single global callback, so it can only be
// loaded once for the whole page however many Spotify tiles are on screen. The
// promise is module-level for the same reason it is in the catalogues: React
// mounts twice in development, and both mounts should wait on the one script.
let apiPromise: Promise<IFrameApi> | undefined;

function loadIframeApi(): Promise<IFrameApi> {
  apiPromise =
    apiPromise ??
    new Promise<IFrameApi>(resolve => {
      window.onSpotifyIframeApiReady = api => resolve(api);
      const script = document.createElement('script');
      script.src = IFRAME_API_SRC;
      script.async = true;
      document.body.appendChild(script);
    });
  return apiPromise;
}

type Props = {
  /** Canonical `spotify:type:id`; see `parseSpotifyRef`. */
  uri: string;
  muted?: boolean;
};

/**
 * A Spotify tile, played inside its own iframe.
 *
 * This is the fallback now, not the default — see `SpotifyConnect`, which plays
 * through a real Spotify Connect device instead and is what a connected Premium
 * account gets. The embed is what is left for everyone else: a free account, a
 * browser without the DRM the Web Playback SDK needs, a phone. Its defining
 * limitation is the reason the other one exists — the audio belongs to this
 * iframe, so two embeds are two players, and nothing outside the page (your
 * phone, the Spotify app) knows it is playing at all.
 *
 * Muting means pausing here, which is not what it means anywhere else in the
 * wall: the embed's API exposes transport controls and no volume, so silence is
 * only reachable by stopping the music. That reads the same way from the
 * outside — the tile the user un-mutes is the one they hear, and the ones they
 * mute go quiet — and it is what a track wants anyway: a muted TV channel is a
 * channel you are still watching, a muted song is one you are skipping past.
 *
 * A tile that arrives muted therefore stays silent and untouched until it is
 * asked for; nothing autoplays behind the user's back, which is also what the
 * browser would insist on — there is nothing muted here for autoplay to allow.
 * What it plays is Spotify's business: a logged-out browser gets thirty-second
 * previews and then an upsell panel, a logged-in one gets the whole thing.
 */
export function SpotifyEmbed({ uri, muted = true }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [controller, setController] = useState<EmbedController>();
  // Whether this controller has ever been asked to play. `resume` picks up
  // where the track was left; the first command has nothing to pick up from.
  const startedRef = useRef(false);
  // Where the embed says it got to. `resume` is a no-op at the end of what it
  // has to play, which is where a logged-out preview stops after its 30
  // seconds, so un-muting has to know the difference.
  const positionRef = useRef({ position: 0, duration: 0 });

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let cancelled = false;
    let created: EmbedController | undefined;

    // `createController` replaces the element it is handed with the iframe, so
    // it gets a throwaway child rather than the host we keep the ref on.
    const target = document.createElement('div');
    host.appendChild(target);
    startedRef.current = false;
    positionRef.current = { position: 0, duration: 0 };

    loadIframeApi().then(api => {
      if (cancelled) return;
      api.createController(
        target,
        { uri, width: '100%', height: '100%' },
        embedController => {
          if (cancelled) {
            embedController.destroy();
            return;
          }
          created = embedController;
          embedController.addListener('playback_update', update => {
            const { position = 0, duration = 0 } = update?.data ?? {};
            positionRef.current = { position, duration };
          });
          setController(embedController);
        }
      );
    });

    return () => {
      cancelled = true;
      created?.destroy();
      setController(undefined);
      // Whatever the iframe left behind goes with it: the next run builds its
      // own target, and a stale player must not linger under the new one.
      host.replaceChildren();
    };
  }, [uri]);

  useEffect(() => {
    if (!controller) return;
    if (muted) {
      // Nothing has played yet, so there is nothing to silence — and pausing an
      // untouched embed would only make it flash its controls.
      if (startedRef.current) controller.pause();
      return;
    }
    // With nothing left to pick up from, `resume` is ignored and the tile would
    // sit there bordered and silent; playing from the top is what takes.
    const { position, duration } = positionRef.current;
    const atEnd = duration > 0 && position >= duration - 1000;
    if (startedRef.current && !atEnd) controller.resume();
    else {
      controller.play();
      startedRef.current = true;
    }
  }, [controller, muted]);

  return <div ref={hostRef} className="w-full h-full" />;
}
