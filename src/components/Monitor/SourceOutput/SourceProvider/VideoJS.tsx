'use client';
import qualitySelector from 'videojs-hls-quality-selector';
import { useContext, useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
// Registers `player.qualityLevels()`, which VHS fills with the stream's
// renditions; see the top-rendition lock below.
import 'videojs-contrib-quality-levels';
import {
  DecodeSlotContext,
  reportDecodeTrouble,
  useDecodeSlot
} from '../../../../hooks/useDecodeSlot';
import { isTvDevice } from '../../../../hooks/useIsTv';

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

/** How often a TV player checks it is keeping up, and over what window. */
const HEALTH_INTERVAL_MS = 5000;
const HEALTH_WINDOW_MS = 10000;
/** A player starting up drops frames on any TV; its first while is not judged. */
const WARMUP_MS = 20000;
/** This much buffered with no picture means no decoder, not no data. */
const STARVED_BUFFER_S = 3;
const STARVED_AFTER_MS = 15000;
/** Share of frames dropped over the window that counts as not keeping up. */
const SLOW_DROP_RATIO = 0.15;

const bufferedAhead = (video: HTMLVideoElement) => {
  const { buffered } = video;
  return buffered.length
    ? buffered.end(buffered.length - 1) - video.currentTime
    : 0;
};

// The quality object's fields are getters on its prototype: spread, it is empty.
const frameCount = (video: HTMLVideoElement, at: number) => {
  const quality = video.getVideoPlaybackQuality();
  return {
    at,
    total: quality.totalVideoFrames,
    dropped: quality.droppedVideoFrames
  };
};

/**
 * Watches a TV player for the two ways a TV runs out of decoding (see
 * `useDecodeSlot`) and reports them. Returns the cleanup.
 */
const watchDecodeHealth = (
  video: HTMLVideoElement,
  slotId: string,
  isHeld: () => boolean
) => {
  const startedAt = Date.now();
  let starvedSince: number | undefined;
  let windowStart = frameCount(video, Date.now());
  const timer = window.setInterval(() => {
    if (isHeld() || video.paused) {
      starvedSince = undefined;
      windowStart = frameCount(video, Date.now());
      return;
    }
    const now = Date.now();
    if (
      video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA &&
      bufferedAhead(video) > STARVED_BUFFER_S
    ) {
      starvedSince ??= now;
      if (now - starvedSince > STARVED_AFTER_MS) {
        starvedSince = undefined;
        reportDecodeTrouble(slotId, 'starved');
      }
    } else {
      starvedSince = undefined;
    }
    if (now - startedAt < WARMUP_MS) {
      windowStart = frameCount(video, now);
      return;
    }
    if (now - windowStart.at < HEALTH_WINDOW_MS) return;
    const counted = frameCount(video, now);
    const total = counted.total - windowStart.total;
    const dropped = counted.dropped - windowStart.dropped;
    windowStart = counted;
    if (total > 0 && dropped / total > SLOW_DROP_RATIO) {
      reportDecodeTrouble(slotId, 'slow');
    }
  }, HEALTH_INTERVAL_MS);
  return () => window.clearInterval(timer);
};

/**
 * A video.js player for an HLS stream. On a TV it only plays while it holds
 * one of the TV's decoding slots; without one it stands parked, and takes the
 * picture up again when it is selected or a slot frees.
 */
const VideoPlayer = (props: Props) => {
  const { id, live } = useDecodeSlot(!props.paused);
  return live ? <LivePlayer {...props} slotId={id} /> : <ParkedPlayer />;
};

/**
 * In place of a player the TV has no decoder for. Blank: the tile around it
 * says which channel is waiting (see `MonitorSource`).
 */
const ParkedPlayer = () => <div className="h-full w-full bg-black" />;

const LivePlayer = ({
  src,
  muted = true,
  paused = false,
  slotId
}: Props & { slotId: string }) => {
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

    const video = p.el()?.querySelector('video');
    const stopHealth =
      isTvDevice() && video
        ? watchDecodeHealth(video, slotId, () => pausedRef.current)
        : () => {};

    return () => {
      stopHealth();
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

  // An adaptive stream plays what its tile's size calls for (VHS caps it at
  // the player's dimensions), so a wall of small tiles pulls small renditions.
  // The tile being watched — selected, or filling the screen — is held to the
  // top one instead, so it never dips while the bandwidth estimate settles.
  // Switching levels takes effect at the next segment, without a reload.
  const { preferred, fullscreen } = useContext(DecodeSlotContext);
  const lockTop = preferred || !!fullscreen;
  useEffect(() => {
    const player = playerRef.current;
    const levels = player?.qualityLevels?.();
    if (!levels) return;
    const apply = () => {
      const all = Array.from({ length: levels.length }, (_, i) => levels[i]);
      const top = all.reduce(
        (best, level) =>
          !best || (level.bitrate ?? 0) > (best.bitrate ?? 0) ? level : best,
        undefined
      );
      all.forEach(level => {
        level.enabled = !lockTop || level === top;
      });
    };
    apply();
    levels.on('addqualitylevel', apply);
    return () => levels.off('addqualitylevel', apply);
  }, [lockTop]);

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
