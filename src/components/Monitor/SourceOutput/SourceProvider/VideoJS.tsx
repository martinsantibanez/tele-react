'use client';
import qualitySelector from 'videojs-hls-quality-selector';
import { lazy, Suspense, useContext, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useHotkeys } from 'react-hotkeys-hook';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import { heldRange, topPlaylist, Vhs, vhsOf } from '@/lib/vhs';
import {
  DecodeSlotContext,
  reportDecodeTrouble,
  useDecodeSlot
} from '../../../../hooks/useDecodeSlot';
import { isTvDevice } from '../../../../hooks/useIsTv';

// Mediabunny and the editor only load once a clip is asked for.
const ClipEditor = lazy(() => import('../../../ClipEditor/ClipEditor'));

const SCISSORS_ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin:auto"><circle cx="6" cy="6" r="3"/><path d="M8.12 8.12 12 12"/><path d="M20 4 8.12 15.88"/><circle cx="6" cy="18" r="3"/><path d="M14.8 14.8 20 20"/></svg>';

type Props = {
  src: string;
  /** What is playing, for the clips cut from it. */
  title?: string;
  muted?: boolean;
  /**
   * Holds the player still: no decoding, no keeping it running. Lifting it
   * picks the stream back up at the live edge rather than where it stopped.
   */
  paused?: boolean;
  /**
   * Takes ← → (5 s) and J L (10 s) to move through the stream's rewind
   * window, and C to cut a clip from it. Only for a stream that keeps one, on
   * the tile filling the screen.
   */
  seekKeys?: boolean;
  /**
   * For a stream that keeps more behind it than its live playlist lists. It is
   * played from `src(startTime)` (unix seconds) instead, reaching an hour
   * back; rewinding further reaches further, up to `limitS` seconds.
   */
  rewind?: { src: (startTime: number) => string; limitS: number };
};
let hlsQualitySelectorRegistered = false;

const STALL_TIMEOUT_MS = 12000;

/** How far the arrows and J L move through the stream, in seconds. */
const ARROW_SEEK_S = 5;
const JL_SEEK_S = 10;
/**
 * How far back a rewindable stream reaches, and how much more a rewind past
 * it asks for. Every playlist refresh lists all of it.
 */
const REWIND_WINDOW_S = 60 * 60;
/** Within this many seconds of the live edge, a player is watching live. */
const LIVE_SLACK_S = 10;
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

/** The VHS instances whose rendition picks already go through `lockTopRef`. */
const steeredVhs = new WeakSet<Vhs>();

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

/**
 * Whether clips can be cut here: not on a TV, which has neither the decoders
 * to spare nor the mouse, and only with WebCodecs to encode them.
 */
const canClip = () =>
  !isTvDevice() && typeof window !== 'undefined' && 'VideoEncoder' in window;

const LivePlayer = ({
  src,
  title = 'clip',
  muted = true,
  paused = false,
  seekKeys = false,
  rewind,
  slotId
}: Props & { slotId: string }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<any>(undefined);
  const currentSrcRef = useRef<string>(src);
  const rewindRef = useRef(rewind);
  rewindRef.current = rewind;
  // Where the rewindable stream loaded starts (unix seconds). And, while a
  // reach further back loads, where to land in it: seconds behind live.
  const rewindStartRef = useRef<number | undefined>(undefined);
  const pendingBehindRef = useRef<number | undefined>(undefined);
  // What is loaded: the url to play and whether it is played rewindable.
  const loadedRef = useRef(`${src}|${!!rewind}`);
  // The url to load, reaching `reach` seconds back when it can.
  const playSrc = (reach = REWIND_WINDOW_S) => {
    const rewind = rewindRef.current;
    if (!rewind) {
      rewindStartRef.current = undefined;
      return currentSrcRef.current;
    }
    rewindStartRef.current = Math.floor(Date.now() / 1000 - reach);
    return rewind.src(rewindStartRef.current);
  };
  // Read by the handlers below, which are set up once with the player: held,
  // everything that keeps the stream running has to stand down, or the first
  // pause would be undone by the very `pause` event it fires.
  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  // Undoes the hold, once the player is there to undo it on.
  const resumeRef = useRef<() => void>(() => {});

  // The clip editor, open on the stream this many seconds behind live. The
  // tile keeps playing under it, quiet, so it is where it was once closed.
  const [clipBehind, setClipBehind] = useState<number>();
  const clipOpen = clipBehind !== undefined;
  const openClip = () => {
    const player = playerRef.current;
    if (!player || player.isDisposed()) return;
    const held = heldRange(player);
    setClipBehind(held ? Math.max(0, held.end - player.currentTime()) : 0);
  };
  const openClipRef = useRef(openClip);
  openClipRef.current = openClip;

  // An adaptive stream plays what its tile's size calls for (VHS caps it at
  // the player's dimensions), so a wall of small tiles pulls small renditions.
  // The tile being watched — selected, or filling the screen — is held to the
  // top one instead, so it never dips while the bandwidth estimate settles.
  const { preferred, fullscreen } = useContext(DecodeSlotContext);
  const lockTopRef = useRef(false);
  lockTopRef.current = preferred || !!fullscreen;

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
      // A seek bar over what the stream keeps behind live, and a button back
      // to it. Tracked however short the window: a live playlist can list as
      // little as ~12s, under video.js's default 20s floor.
      liveui: true,
      liveTracker: { trackingThreshold: 0 },
      controlBar: {
        volumePanel: {
          inline: true
        }
      },
      poster: '/imagenes/SinSenal.png',
      sources: [
        {
          src: playSrc(),
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

    // Beside the volume: the right end of the bar is under the monitor's own
    // buttons when the tile fills the screen.
    const controlBar = canClip() ? p.getChild('ControlBar') : undefined;
    if (controlBar) {
      const clipButton = controlBar.addChild(
        'button',
        { controlText: 'Crear clip' },
        controlBar.children().indexOf(controlBar.getChild('VolumePanel')!) + 1
      );
      clipButton.addClass('vjs-clip-button');
      clipButton
        .el()
        .querySelector('.vjs-icon-placeholder')
        ?.insertAdjacentHTML('beforeend', SCISSORS_ICON);
      clipButton.on('click', () => openClipRef.current());
    }

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

    // Back at live, reaching the usual hour.
    const reload = () => {
      if (p.isDisposed() || pausedRef.current) return;
      pendingBehindRef.current = undefined;
      p.src([{ src: playSrc(), type: 'application/vnd.apple.mpegurl' }]);
      p.load();
      resume();
    };

    // The lock steers VHS's own pick, which it makes after every segment and
    // switches to without touching what is buffered. Enabling or disabling
    // quality levels instead makes VHS throw the buffer away and seek, so the
    // tile would stall and rebuffer each time it is selected or let go.
    // Every source gets a new VHS, hence on each `loadedmetadata`.
    const steerRenditions = () => {
      const vhs = vhsOf(p);
      if (!vhs || steeredVhs.has(vhs)) return;
      steeredVhs.add(vhs);
      const standard = vhs.selectPlaylist;
      vhs.selectPlaylist = () =>
        (lockTopRef.current && topPlaylist(vhs)) || standard();
    };

    // A rewindable playlist keeps its start and grows by a segment every few
    // seconds, all of it listed on every refresh. Sliding its start along
    // instead would drop discontinuities off its front, and with no
    // DISCONTINUITY-SEQUENCE to count them by VHS loses its timeline. So a
    // tile at live that has grown to twice the hour starts it over: one short
    // reload, at most once an hour. One rewound is left reaching back.
    const startOver = () => {
      const start = rewindStartRef.current;
      if (start === undefined || pendingBehindRef.current !== undefined) return;
      if (Date.now() / 1000 - start < 2 * REWIND_WINDOW_S) return;
      const seekable = p.seekable();
      if (!seekable?.length) return;
      const behind = seekable.end(seekable.length - 1) - p.currentTime();
      if (behind > LIVE_SLACK_S) return;
      p.src([{ src: playSrc(), type: 'application/vnd.apple.mpegurl' }]);
    };

    // A reach further back starts out at its live edge like any live stream;
    // the seek that asked for it lands once it knows what it holds.
    const landRewind = () => {
      const behind = pendingBehindRef.current;
      const seekable = p.seekable();
      if (behind === undefined || !seekable?.length) return;
      pendingBehindRef.current = undefined;
      const end = seekable.end(seekable.length - 1);
      p.currentTime(Math.max(end - behind, seekable.start(0)));
    };

    resumeRef.current = resume;
    p.on('loadedmetadata', steerRenditions);
    p.on(['loadedmetadata', 'canplay'], landRewind);
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
        startOver();
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
        playerRef.current.off('loadedmetadata', steerRenditions);
        playerRef.current.off(['loadedmetadata', 'canplay'], landRewind);
        playerRef.current.off('pause', resume);
        playerRef.current.off('ended', reload);
        playerRef.current.off('error', reload);
        playerRef.current.dispose();
      }
      playerRef.current = undefined;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // A channel found out to be rewindable (the catalogue arriving after the
  // tile) is loaded again as one, too.
  const canRewind = !!rewind;
  useEffect(() => {
    const loaded = `${src}|${canRewind}`;
    if (!playerRef.current || loadedRef.current === loaded) return;
    loadedRef.current = loaded;
    currentSrcRef.current = src;
    pendingBehindRef.current = undefined;
    playerRef.current.src([
      { src: playSrc(), type: 'application/vnd.apple.mpegurl' }
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, canRewind]);

  useEffect(() => {
    playerRef.current?.muted(muted || clipOpen);
  }, [muted, clipOpen]);

  // Filling the screen, its control bar makes room for the monitor's buttons
  // (see globals.css). A TV has no such buttons.
  const besideMonitorButtons = !!fullscreen && !isTvDevice();
  useEffect(() => {
    playerRef.current?.toggleClass(
      'vjs-beside-monitor-buttons',
      besideMonitorButtons
    );
  }, [besideMonitorButtons]);

  useEffect(() => {
    const player = playerRef.current;
    if (!player || player.isDisposed()) return;
    // Resuming goes through the same path a stray pause does, which is what
    // takes it back to the live edge: a live stream picked up where it was
    // left would be showing the news from however long ago it was covered.
    if (paused) player.pause();
    else resumeRef.current();
  }, [paused]);

  // Loads the stream again reaching `behind` seconds back from live, with an
  // hour more before it. False when it can't, or already reaches as far back
  // as the stream keeps.
  const reachBack = (behind: number) => {
    const player = playerRef.current;
    const rewind = rewindRef.current;
    const start = rewindStartRef.current;
    if (!rewind || start === undefined) return false;
    const reach = Math.min(behind + REWIND_WINDOW_S, rewind.limitS);
    if (Date.now() / 1000 - reach >= start) return false;
    pendingBehindRef.current = Math.min(behind, reach);
    player.src([
      { src: playSrc(reach), type: 'application/vnd.apple.mpegurl' }
    ]);
    return true;
  };

  // Kept inside what the stream still holds: before its start there is
  // nothing, unless it can reach further, and past its end is the future, so
  // going forward from close to it lands back on the live edge.
  const seekBy = (seconds: number) => {
    const player = playerRef.current;
    if (!player || player.isDisposed()) return;
    // A reach further back still loading: the presses add up until it lands.
    if (pendingBehindRef.current !== undefined) {
      pendingBehindRef.current = Math.max(0, pendingBehindRef.current - seconds);
      return;
    }
    const seekable = player.seekable();
    if (!seekable?.length) return;
    const start = seekable.start(0);
    const end = seekable.end(seekable.length - 1);
    const target = player.currentTime() + seconds;
    if (target < start && reachBack(end - target)) return;
    player.currentTime(Math.min(Math.max(target, start), end));
  };
  const seekOptions = { enabled: seekKeys, preventDefault: true };
  useHotkeys('left', () => seekBy(-ARROW_SEEK_S), seekOptions);
  useHotkeys('right', () => seekBy(ARROW_SEEK_S), seekOptions);
  useHotkeys('j', () => seekBy(-JL_SEEK_S), seekOptions);
  useHotkeys('l', () => seekBy(JL_SEEK_S), seekOptions);
  useHotkeys('c', openClip, { ...seekOptions, enabled: seekKeys && canClip() });

  useEffect(() => {
    if (muted || clipOpen) return;
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
  }, [muted, clipOpen]);

  return (
    <>
      <div ref={containerRef} data-vjs-player className="w-full h-full" />
      {clipOpen &&
        createPortal(
          <Suspense fallback={null}>
            <ClipEditor
              title={title}
              src={src}
              rewind={rewind}
              behind={clipBehind}
              onClose={() => setClipBehind(undefined)}
            />
          </Suspense>,
          document.body
        )}
    </>
  );
};

export default VideoPlayer;
