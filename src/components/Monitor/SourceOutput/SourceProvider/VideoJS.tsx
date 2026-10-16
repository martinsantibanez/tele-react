'use client';
import qualitySelector from 'videojs-hls-quality-selector';
import { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

type Props = {
  src: string;
  muted?: boolean;
  /**
   * Holds the player still: no decoding, no keeping it running. Lifting it
   * picks the stream back up at the live edge rather than where it stopped.
   */
  paused?: boolean;
};
let hlsQualitySelectorRegistered = false;

const STALL_TIMEOUT_MS = 12000;
const WATCHDOG_INTERVAL_MS = 3000;

const VideoPlayer = ({ src, muted = true, paused = false }: Props) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<any>(undefined);
  const currentSrcRef = useRef<string>(src);
  // Read by the handlers below, which are set up once with the player: held,
  // everything that keeps the stream running has to stand down, or the first
  // pause would be undone by the very `pause` event it fires.
  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  // Undoes the hold, once the player is there to undo it on.
  const resumeRef = useRef<() => void>(() => {});

  useEffect(() => {
    if (!containerRef.current) return;

    if (!hlsQualitySelectorRegistered) {
      videojs.registerPlugin('hlsQualitySelector', qualitySelector);
      hlsQualitySelectorRegistered = true;
    }

    const videoElement = document.createElement('video-js');
    videoElement.classList.add(
      'video-js',
      'vjs-default-skin',
      'vjs-big-play-centered',
      'vjs-fill'
    );
    containerRef.current.appendChild(videoElement);

    const videoJsOptions: videojs.PlayerOptions = {
      preload: 'auto',
      // Held from the start, it waits for the hold to lift before playing.
      autoplay: paused ? false : 'any',
      techOrder: ['html5'],
      controls: true,
      muted,
      userActions: {
        click: false,
        doubleClick: false
      },
      responsive: true,
      fill: true,
      controlBar: {
        volumePanel: {
          inline: true
        }
      },
      poster: '/imagenes/SinSenal.png',
      sources: [
        {
          src: src,
          type: 'application/vnd.apple.mpegurl'
          // type: "application/x-mpegURL",
        }
      ]
    };

    const p = videojs(videoElement, videoJsOptions, function onPlayerReaady() {
      // console.log('onPlayerReady');
    });
    playerRef.current = p;
    currentSrcRef.current = src;

    // Keep the stream running: resume on any pause, and reload it if it stalls.
    const resume = () => {
      if (p.isDisposed() || !p.paused() || pausedRef.current) return;
      const liveTracker = p.liveTracker;
      if (liveTracker?.isLive() && liveTracker.atLiveEdge?.() === false) {
        liveTracker.seekToLiveEdge();
      }
      const playPromise = p.play();
      if (playPromise?.catch) playPromise.catch(() => {});
    };

    const reload = () => {
      if (p.isDisposed() || pausedRef.current) return;
      p.src([
        { src: currentSrcRef.current, type: 'application/vnd.apple.mpegurl' }
      ]);
      p.load();
      resume();
    };

    resumeRef.current = resume;
    p.on('pause', resume);
    p.on('ended', reload);
    p.on('error', reload);

    let lastTime = 0;
    let lastProgressAt = Date.now();
    const watchdog = window.setInterval(() => {
      if (p.isDisposed() || pausedRef.current) return;
      const time = p.currentTime();
      if (time !== lastTime) {
        lastTime = time;
        lastProgressAt = Date.now();
        return;
      }
      if (p.paused()) {
        resume();
        return;
      }
      // Not paused but the clock is frozen: the stream is stuck, re-fetch it.
      if (Date.now() - lastProgressAt > STALL_TIMEOUT_MS) {
        lastProgressAt = Date.now();
        reload();
      }
    }, WATCHDOG_INTERVAL_MS);

    const onVisibilityChange = () => {
      if (!document.hidden) resume();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      window.clearInterval(watchdog);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      if (playerRef.current && !playerRef.current.isDisposed()) {
        playerRef.current.off('pause', resume);
        playerRef.current.off('ended', reload);
        playerRef.current.off('error', reload);
        playerRef.current.dispose();
      }
      playerRef.current = undefined;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!playerRef.current || currentSrcRef.current === src) return;
    currentSrcRef.current = src;
    playerRef.current.src([{ src, type: 'application/vnd.apple.mpegurl' }]);
  }, [src]);

  useEffect(() => {
    playerRef.current?.muted(muted);
  }, [muted]);

  useEffect(() => {
    const player = playerRef.current;
    if (!player || player.isDisposed()) return;
    // Resuming goes through the same path a stray pause does, which is what
    // takes it back to the live edge: a live stream picked up where it was
    // left would be showing the news from however long ago it was covered.
    if (paused) player.pause();
    else resumeRef.current();
  }, [paused]);

  useEffect(() => {
    if (muted) return;
    const unlock = () => {
      const player = playerRef.current;
      if (!player || player.isDisposed() || pausedRef.current) return;
      player.muted(false);
      const playPromise = player.play();
      if (playPromise?.catch) playPromise.catch(() => {});
    };
    const events = ['pointerdown', 'keydown'] as const;
    events.forEach(e =>
      document.addEventListener(e, unlock, { once: true, capture: true })
    );
    return () => {
      events.forEach(e =>
        document.removeEventListener(e, unlock, { capture: true } as never)
      );
    };
  }, [muted]);

  return <div ref={containerRef} data-vjs-player className="w-full h-full" />;
};

export default VideoPlayer;
