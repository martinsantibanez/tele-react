'use client';
import {
  ChevronFirst,
  ChevronLast,
  Download,
  Loader2,
  Pause,
  Play,
  Repeat,
  Scissors,
  Volume2,
  VolumeX,
  X
} from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import useLocalStorageState from 'use-local-storage-state';
import videojs from 'video.js';
import {
  canExportClips,
  CLIP_ASPECTS,
  CLIP_MAX_S,
  CLIP_MIN_S,
  ClipCrop,
  ClipSegment,
  clipSize,
  exportClip
} from '@/lib/clip';
import { heldRange, topPlaylist, vhsOf } from '@/lib/vhs';
import {
  ClipTimeline,
  formatClock,
  formatDuration,
  Range
} from './ClipTimeline';
import { Box, CropFrame, MAX_ZOOM } from './CropFrame';

type Props = {
  title: string;
  /** The stream at live. */
  src: string;
  /** For a stream that keeps its past: see `VideoJS`. */
  rewind?: { src: (startTime: number) => string; limitS: number };
  /** How far behind live the tile was; the clip starts out ending there. */
  behind: number;
  onClose: () => void;
};

/** How far back the editor can be asked to reach, for a stream that rewinds. */
const REACHES_S = [1, 2, 4, 6].map(h => h * 60 * 60);
const FIRST_CLIP_S = 30;
const FRAME_S = 1 / 30;
const QUALITIES = [720, 1080];
const TICK_MS = 60;

type Job =
  | { state: 'idle' }
  | { state: 'exporting'; progress: number; abort: AbortController }
  | { state: 'done'; url: string; name: string; bytes: number }
  | { state: 'error'; message: string };

const clamp = (n: number, min: number, max: number) =>
  Math.min(Math.max(n, min), max);

/** The biggest frame of `ratio` the picture holds, zoomed in and centred. */
const cropOf = (
  ratio: number,
  picture: { width: number; height: number },
  zoom: number,
  cx: number,
  cy: number
): ClipCrop => {
  const pictureRatio = picture.width / picture.height;
  let width = 1;
  let height = 1;
  if (ratio < pictureRatio) width = ratio / pictureRatio;
  else height = pictureRatio / ratio;
  width /= zoom;
  height /= zoom;
  return {
    x: clamp(cx - width / 2, 0, 1 - width),
    y: clamp(cy - height / 2, 0, 1 - height),
    width,
    height
  };
};

const fileName = (title: string, unix: number) => {
  const d = new Date(unix * 1000);
  const two = (n: number) => String(n).padStart(2, '0');
  const slug = title
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
  return `${slug || 'clip'}-${d.getFullYear()}${two(d.getMonth() + 1)}${two(
    d.getDate()
  )}-${two(d.getHours())}${two(d.getMinutes())}${two(d.getSeconds())}.mp4`;
};

const download = (url: string, name: string) => {
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
};

/**
 * Cuts a clip out of a stream: back through what it keeps, picking the
 * minutes, trimming them to the frame, cropping the picture — vertical for
 * social media, square, portrait or as it is — and exporting it as an MP4,
 * all in the browser.
 *
 * It plays the stream in a player of its own; the tile stays as it was.
 * While open it takes the keyboard to itself.
 */
export default function ClipEditor({
  title,
  src,
  rewind,
  behind,
  onClose
}: Props) {
  const holderRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playerRef = useRef<videojs.Player | undefined>(undefined);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const reaches = rewind ? REACHES_S.filter(r => r <= rewind.limitS) : [];
  const [reach, setReach] = useState(
    () =>
      reaches.find(r => r >= behind + 10 * 60) ?? reaches[reaches.length - 1]
  );
  const urlFor = (r = reach) =>
    rewind && r ? rewind.src(Math.floor(Date.now() / 1000 - r)) : src;

  const [stream, setStream] = useState<Range>();
  // Wall-clock seconds at player time 0, taken from the stream's end being
  // live when it loads. Fixed from then on: the timeline doesn't move.
  const [clockOffset, setClockOffset] = useState(0);
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [loop, setLoop] = useState(true);
  const [sel, setSel] = useState<Range>();
  // Between I and O the clip's end is still to come: playing on doesn't loop.
  const [marking, setMarking] = useState(false);
  const [picture, setPicture] = useState({ width: 16, height: 9 });
  const [aspectIdx, setAspectIdx] = useLocalStorageState('clipAspect', {
    defaultValue: 1
  });
  const [shortSide, setShortSide] = useLocalStorageState('clipShortSide', {
    defaultValue: 1080
  });
  const [zoom, setZoom] = useState(1);
  const [centre, setCentre] = useState({ x: 0.5, y: 0.5 });
  const [stage, setStage] = useState({ width: 0, height: 0 });
  const [job, setJob] = useState<Job>({ state: 'idle' });
  const [supported, setSupported] = useState<boolean>();

  const aspect = CLIP_ASPECTS[aspectIdx] ?? CLIP_ASPECTS[0];
  const ratio =
    aspect.ratio === 'source' ? picture.width / picture.height : aspect.ratio;
  const crop = cropOf(ratio, picture, zoom, centre.x, centre.y);
  const size = clipSize(ratio, shortSide);

  // Read by the player's handlers, set up once.
  const selRef = useRef(sel);
  selRef.current = sel;
  const loopRef = useRef(loop);
  loopRef.current = loop && !marking;
  const cropRef = useRef(crop);
  cropRef.current = crop;
  // Where to put the playhead and the selection once the stream loads, as
  // seconds behind its live edge.
  const landRef = useRef<{ time: number; sel?: Range } | undefined>({
    time: behind
  });

  useEffect(() => {
    canExportClips().then(setSupported, () => setSupported(false));
  }, []);

  useEffect(() => {
    if (!holderRef.current) return;
    const el = document.createElement('video-js');
    el.classList.add('vjs-fill');
    holderRef.current.appendChild(el);
    const p = videojs(el, {
      autoplay: true,
      preload: 'auto',
      controls: false,
      fill: true,
      liveui: false,
      bigPlayButton: false,
      userActions: { click: false, doubleClick: false, hotkeys: false },
      sources: [{ src: urlFor(), type: 'application/vnd.apple.mpegurl' }]
    });
    playerRef.current = p;
    videoRef.current = p.el().querySelector('video');

    // The preview, like the clip, from the best rendition there is.
    const steer = () => {
      const vhs = vhsOf(p);
      if (vhs) vhs.selectPlaylist = () => topPlaylist(vhs);
    };
    const land = () => {
      const pending = landRef.current;
      const held = heldRange(p);
      if (!pending || !held) return;
      landRef.current = undefined;
      const { start, end } = held;
      const t = clamp(end - pending.time, start, end);
      p.currentTime(t);
      setTime(t);
      setStream({ start, end });
      setClockOffset(Date.now() / 1000 - end);
      setSel(
        pending.sel
          ? {
              start: clamp(end - pending.sel.start, start, end),
              end: clamp(end - pending.sel.end, start, end)
            }
          : { start: Math.max(start, t - FIRST_CLIP_S), end: t }
      );
    };
    const onSize = () => {
      const video = videoRef.current;
      if (video?.videoWidth) {
        setPicture({ width: video.videoWidth, height: video.videoHeight });
      }
    };
    p.on('loadedmetadata', steer);
    p.on(['loadedmetadata', 'canplay'], land);
    p.on(['loadedmetadata', 'resize'], onSize);
    p.on('play', () => setPlaying(true));
    p.on('pause', () => setPlaying(false));

    const tick = window.setInterval(() => {
      if (p.isDisposed()) return;
      const t = p.currentTime();
      const held = heldRange(p);
      if (held) {
        const { start, end } = held;
        setStream(s =>
          s && Math.abs(s.start - start) < 0.5 && Math.abs(s.end - end) < 0.5
            ? s
            : { start, end }
        );
      }
      // Played on past the clip's end, it starts it over.
      const sel = selRef.current;
      if (
        loopRef.current &&
        sel &&
        !p.paused() &&
        t >= sel.end &&
        t < sel.end + 1
      ) {
        p.currentTime(sel.start);
        setTime(sel.start);
        return;
      }
      setTime(t);
    }, TICK_MS);

    return () => {
      window.clearInterval(tick);
      p.dispose();
      playerRef.current = undefined;
      videoRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The output as it will look, drawn from the preview.
  useEffect(() => {
    let frame = 0;
    const draw = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (video && canvas && video.readyState >= 2 && video.videoWidth) {
        const c = cropRef.current;
        canvas
          .getContext('2d')
          ?.drawImage(
            video,
            c.x * video.videoWidth,
            c.y * video.videoHeight,
            c.width * video.videoWidth,
            c.height * video.videoHeight,
            0,
            0,
            canvas.width,
            canvas.height
          );
      }
      frame = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(frame);
  }, []);

  useLayoutEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) =>
      setStage({
        width: entry.contentRect.width,
        height: entry.contentRect.height
      })
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    playerRef.current?.muted(muted);
  }, [muted]);

  // The clip's file goes when another replaces it or the editor closes.
  const doneUrl = job.state === 'done' ? job.url : undefined;
  useEffect(
    () => () => {
      if (doneUrl) URL.revokeObjectURL(doneUrl);
    },
    [doneUrl]
  );
  const jobRef = useRef(job);
  jobRef.current = job;
  useEffect(
    () => () => {
      const current = jobRef.current;
      if (current.state === 'exporting') current.abort.abort();
    },
    []
  );

  const seek = (t: number) => {
    const p = playerRef.current;
    if (!p || !stream) return;
    const to = clamp(t, stream.start, stream.end);
    p.currentTime(to);
    setTime(to);
  };

  const togglePlay = () => {
    const p = playerRef.current;
    if (!p) return;
    if (p.paused()) {
      // From the end of the clip, play goes back to its start.
      if (sel && loopRef.current && time >= sel.end - 0.05) seek(sel.start);
      p.play()?.catch(() => {});
    } else {
      p.pause();
    }
  };

  /**
   * A selection kept to the stream and to a clip's bounds. With one end being
   * moved, the other stays put; with neither, it moves whole.
   */
  const applySel = (next: Range, edge?: 'start' | 'end') => {
    if (!stream) return;
    const { start: lo, end: hi } = stream;
    if (edge === 'start') {
      const end = clamp(next.end, lo, hi);
      const start = clamp(
        next.start,
        Math.max(lo, end - CLIP_MAX_S),
        end - CLIP_MIN_S
      );
      return setSel({ start: Math.max(lo, start), end });
    }
    if (edge === 'end') {
      const start = clamp(next.start, lo, hi);
      const end = clamp(
        next.end,
        start + CLIP_MIN_S,
        Math.min(hi, start + CLIP_MAX_S)
      );
      return setSel({ start, end });
    }
    const length = clamp(next.end - next.start, CLIP_MIN_S, CLIP_MAX_S);
    const start = clamp(next.start, lo, hi - length);
    setSel({ start: Math.max(lo, start), end: Math.min(hi, start + length) });
  };

  const markIn = () => {
    if (!sel) return;
    setMarking(true);
    // Past the clip's end, the clip starts afresh from here.
    if (time >= sel.end - CLIP_MIN_S) {
      applySel({ start: time, end: time + (sel.end - sel.start) }, 'end');
    } else {
      applySel({ ...sel, start: time }, 'start');
    }
  };
  const markOut = () => {
    if (!sel) return;
    setMarking(false);
    if (time <= sel.start + CLIP_MIN_S) {
      applySel({ start: time - (sel.end - sel.start), end: time }, 'start');
    } else {
      applySel({ ...sel, end: time }, 'end');
    }
  };

  const changeReach = (r: number) => {
    const p = playerRef.current;
    if (!p || r === reach || !stream) return;
    const end = stream.end;
    landRef.current = {
      time: end - time,
      sel: sel && { start: end - sel.start, end: end - sel.end }
    };
    setReach(r);
    setStream(undefined);
    p.src([{ src: urlFor(r), type: 'application/vnd.apple.mpegurl' }]);
  };

  const moveCentre = (x: number, y: number) =>
    setCentre({
      x: clamp(x, crop.width / 2, 1 - crop.width / 2),
      y: clamp(y, crop.height / 2, 1 - crop.height / 2)
    });
  const changeZoom = (z: number) => setZoom(clamp(z, 1, MAX_ZOOM));

  const toClock = (t: number) => t + clockOffset;

  const startExport = async () => {
    const p = playerRef.current;
    const vhs = p && vhsOf(p);
    const media = vhs?.playlists?.media?.();
    const seekable = p?.seekable();
    if (!p || !vhs || !media?.segments || !sel || !seekable?.length) return;
    const playlistUrl = (topPlaylist(vhs) ?? media).resolvedUri;
    if (!playlistUrl) return;
    p.pause();

    // Laid out the way VHS lays them out: back to back from where what has
    // slid off the playlist ends, the start of what can be sought.
    let at = seekable.start(0);
    const segments: ClipSegment[] = media.segments.map((segment, i) => {
      const placed = {
        sequence: (media.mediaSequence ?? 0) + i,
        start: at,
        end: at + segment.duration
      };
      at = placed.end;
      return placed;
    });

    const abort = new AbortController();
    const name = fileName(title, toClock(sel.start));
    setJob({ state: 'exporting', progress: 0, abort });
    try {
      const blob = await exportClip({
        playlistUrl,
        segments,
        start: sel.start,
        end: sel.end,
        crop,
        ...size,
        signal: abort.signal,
        onProgress: progress =>
          setJob(j =>
            j.state === 'exporting' && j.abort === abort
              ? { ...j, progress }
              : j
          )
      });
      if (abort.signal.aborted) return;
      const url = URL.createObjectURL(blob);
      setJob({ state: 'done', url, name, bytes: blob.size });
      download(url, name);
    } catch (error) {
      if (abort.signal.aborted) return setJob({ state: 'idle' });
      console.error(error);
      setJob({
        state: 'error',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  };

  const cancelExport = () => {
    if (job.state === 'exporting') job.abort.abort();
    setJob({ state: 'idle' });
  };

  // The editor has the keyboard to itself: nothing reaches the monitor
  // underneath, or E, G, the numbers and the arrows would act on it too.
  const keysRef = useRef<(e: KeyboardEvent) => boolean>(() => false);
  keysRef.current = (e: KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return false;
    const step = e.shiftKey ? 5 : 1;
    switch (e.key.toLowerCase()) {
      case ' ':
      case 'k':
        togglePlay();
        return true;
      case 'i':
        markIn();
        return true;
      case 'o':
        markOut();
        return true;
      case 'arrowleft':
        seek(time - step);
        return true;
      case 'arrowright':
        seek(time + step);
        return true;
      case 'j':
        seek(time - 10);
        return true;
      case 'l':
        seek(time + 10);
        return true;
      case ',':
        playerRef.current?.pause();
        seek(time - FRAME_S);
        return true;
      case '.':
        playerRef.current?.pause();
        seek(time + FRAME_S);
        return true;
      case 'home':
        if (sel) seek(sel.start);
        return true;
      case 'end':
        if (sel) seek(sel.end);
        return true;
      case 'escape':
        if (jobRef.current.state === 'exporting') cancelExport();
        else onClose();
        return true;
    }
    return false;
  };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      e.stopPropagation();
      const target = e.target as HTMLElement | null;
      if (target?.closest('input, textarea, select, [contenteditable]')) return;
      if (e.type === 'keydown' && keysRef.current(e)) e.preventDefault();
      // A focused button would take the space as a press too.
      if (e.type === 'keyup' && e.key === ' ') e.preventDefault();
    };
    window.addEventListener('keydown', onKey, true);
    window.addEventListener('keyup', onKey, true);
    return () => {
      window.removeEventListener('keydown', onKey, true);
      window.removeEventListener('keyup', onKey, true);
    };
  }, []);

  // The picture as laid out on the stage, contained.
  const scale = Math.min(
    stage.width / picture.width,
    stage.height / picture.height
  );
  const box: Box = {
    width: picture.width * scale,
    height: picture.height * scale,
    left: (stage.width - picture.width * scale) / 2,
    top: (stage.height - picture.height * scale) / 2
  };

  const exporting = job.state === 'exporting';
  const clipLength = sel ? sel.end - sel.start : 0;
  // The preview canvas, at half the clip's size: plenty for a thumbnail.
  const previewSize = { width: size.width / 2, height: size.height / 2 };

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col bg-neutral-950 text-white"
      role="dialog"
      aria-label="Crear clip"
    >
      <header className="flex items-center gap-3 border-b border-white/10 px-4 py-2">
        <Scissors size={18} className="text-amber-400" />
        <h2 className="truncate font-semibold">
          Clip <span className="font-normal text-white/60">· {title}</span>
        </h2>
        {reaches.length > 0 && (
          <div className="ml-4 flex items-center gap-2 text-xs text-white/60">
            Alcance
            <div className="flex overflow-hidden rounded border border-white/15">
              {reaches.map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => changeReach(r)}
                  disabled={exporting}
                  className={`px-2 py-1 tabular-nums ${
                    r === reach
                      ? 'bg-white text-black'
                      : 'text-white/80 hover:bg-white/10'
                  }`}
                >
                  {r / 3600} h
                </button>
              ))}
            </div>
          </div>
        )}
        <button
          type="button"
          onClick={onClose}
          className="ml-auto rounded p-1.5 hover:bg-white/10"
          aria-label="Cerrar (Esc)"
          title="Cerrar (Esc)"
        >
          <X size={20} />
        </button>
      </header>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div
            ref={stageRef}
            className="relative min-h-[200px] flex-1 overflow-hidden bg-black"
          >
            <div
              ref={holderRef}
              data-vjs-player
              className="absolute inset-0 [&_.vjs-control-bar]:hidden"
            />
            {stage.width > 0 && (
              <CropFrame
                box={box}
                crop={crop}
                zoom={zoom}
                onMove={moveCentre}
                onZoom={changeZoom}
              />
            )}
            {!stream && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <Loader2 className="animate-spin text-white/60" size={36} />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 border-t border-white/10 px-4 py-3">
            <div className="flex flex-wrap items-center gap-2">
              <TransportButton
                onClick={() => sel && seek(sel.start)}
                label="Ir al inicio del clip (Inicio)"
              >
                <ChevronFirst size={18} />
              </TransportButton>
              <TransportButton
                onClick={togglePlay}
                label={playing ? 'Pausa (Espacio)' : 'Reproducir (Espacio)'}
                primary
              >
                {playing ? <Pause size={18} /> : <Play size={18} />}
              </TransportButton>
              <TransportButton
                onClick={() => sel && seek(sel.end)}
                label="Ir al fin del clip (Fin)"
              >
                <ChevronLast size={18} />
              </TransportButton>
              <span className="w-20 text-sm text-white/80 tabular-nums">
                {stream ? formatClock(toClock(time)) : '--:--:--'}
              </span>
              <div className="mx-1 h-6 w-px bg-white/15" />
              <button
                type="button"
                onClick={markIn}
                className="rounded border border-white/15 px-2.5 py-1 text-sm hover:bg-white/10"
              >
                Marcar inicio <Kbd>I</Kbd>
              </button>
              <button
                type="button"
                onClick={markOut}
                className="rounded border border-white/15 px-2.5 py-1 text-sm hover:bg-white/10"
              >
                Marcar fin <Kbd>O</Kbd>
              </button>
              <TransportButton
                onClick={() => setLoop(l => !l)}
                label="Repetir el clip"
                active={loop}
              >
                <Repeat size={16} />
              </TransportButton>
              <TransportButton
                onClick={() => setMuted(m => !m)}
                label={muted ? 'Activar sonido' : 'Silenciar'}
              >
                {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </TransportButton>
              {sel && stream && (
                <div className="ml-auto text-sm text-white/70 tabular-nums">
                  {formatClock(toClock(sel.start))} –{' '}
                  {formatClock(toClock(sel.end))}
                  <span className="ml-2 font-semibold text-amber-400">
                    {formatDuration(clipLength)}
                  </span>
                </div>
              )}
            </div>
            {stream && sel ? (
              <ClipTimeline
                stream={stream}
                sel={sel}
                time={time}
                toClock={toClock}
                onSeek={seek}
                onSel={(next, edge) => {
                  setMarking(false);
                  applySel(next, edge);
                }}
              />
            ) : (
              <div className="h-[6.75rem] animate-pulse rounded bg-white/5" />
            )}
            <p className="text-[11px] text-white/40">
              Arrastra sobre la barra de arriba para elegir los minutos; ajusta
              los extremos en la de abajo. <Kbd>Espacio</Kbd> reproducir ·{' '}
              <Kbd>← →</Kbd> 1 s (⇧ 5 s) · <Kbd>J L</Kbd> 10 s · <Kbd>, .</Kbd>{' '}
              cuadro · <Kbd>I O</Kbd> inicio y fin · <Kbd>Esc</Kbd> cerrar
            </p>
          </div>
        </div>

        <aside className="flex w-full shrink-0 flex-col gap-4 overflow-y-auto border-t border-white/10 p-4 lg:w-80 lg:border-t-0 lg:border-l">
          <Section title="Formato">
            <div className="grid grid-cols-2 gap-1.5">
              {CLIP_ASPECTS.map((a, i) => {
                const r =
                  a.ratio === 'source'
                    ? picture.width / picture.height
                    : a.ratio;
                return (
                  <button
                    key={a.label}
                    type="button"
                    onClick={() => {
                      setAspectIdx(i);
                      setZoom(1);
                    }}
                    disabled={exporting}
                    className={`flex items-center gap-2 rounded border px-2 py-1.5 text-left text-xs ${
                      i === aspectIdx
                        ? 'border-amber-400 bg-amber-400/10 text-white'
                        : 'border-white/15 text-white/70 hover:bg-white/5'
                    }`}
                  >
                    <span className="flex size-5 items-center justify-center">
                      <span
                        className="block rounded-[2px] border-[1.5px] border-current"
                        style={
                          r >= 1
                            ? { width: 18, height: 18 / r }
                            : { width: 18 * r, height: 18 }
                        }
                      />
                    </span>
                    {a.label}
                  </button>
                );
              })}
            </div>
          </Section>

          <Section title="Encuadre">
            <div className="flex items-center gap-2 text-xs text-white/70">
              <span>Zoom</span>
              <input
                type="range"
                min={1}
                max={MAX_ZOOM}
                step={0.01}
                value={zoom}
                onChange={e => changeZoom(Number(e.target.value))}
                className="flex-1 accent-amber-400"
              />
              <span className="w-10 text-right tabular-nums">
                {Math.round(zoom * 100)}%
              </span>
              <button
                type="button"
                onClick={() => {
                  setZoom(1);
                  setCentre({ x: 0.5, y: 0.5 });
                }}
                className="rounded px-1.5 py-0.5 hover:bg-white/10"
              >
                Centrar
              </button>
            </div>
            <p className="text-[11px] text-white/40">
              Arrastra el recuadro sobre la imagen; la rueda o sus esquinas
              acercan.
            </p>
          </Section>

          <Section title={job.state === 'done' ? 'Clip listo' : 'Vista previa'}>
            <div className="flex justify-center rounded bg-black p-2">
              {job.state === 'done' ? (
                <video
                  src={job.url}
                  controls
                  autoPlay
                  loop
                  className="max-h-[340px] max-w-full"
                />
              ) : (
                <canvas
                  ref={canvasRef}
                  width={previewSize.width}
                  height={previewSize.height}
                  className="max-h-[340px] max-w-full bg-neutral-900"
                  style={{ aspectRatio: `${size.width} / ${size.height}` }}
                />
              )}
            </div>
          </Section>

          <Section title="Calidad">
            <div className="flex items-center gap-1.5">
              {QUALITIES.map(q => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setShortSide(q)}
                  disabled={exporting}
                  className={`rounded border px-2.5 py-1 text-xs ${
                    q === shortSide
                      ? 'border-amber-400 bg-amber-400/10'
                      : 'border-white/15 text-white/70 hover:bg-white/5'
                  }`}
                >
                  {q}p
                </button>
              ))}
              <span className="ml-auto text-xs text-white/50 tabular-nums">
                {size.width} × {size.height} · MP4
              </span>
            </div>
          </Section>

          <div className="mt-auto flex flex-col gap-2">
            {job.state === 'error' && (
              <p className="rounded bg-red-500/15 px-2 py-1.5 text-xs text-red-300">
                No se pudo exportar: {job.message}
              </p>
            )}
            {supported === false && (
              <p className="rounded bg-red-500/15 px-2 py-1.5 text-xs text-red-300">
                Este navegador no puede codificar video H.264.
              </p>
            )}
            {job.state === 'exporting' ? (
              <>
                <div className="h-2 overflow-hidden rounded bg-white/10">
                  <div
                    className="h-full bg-amber-400 transition-[width]"
                    style={{ width: `${job.progress * 100}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-white/70">
                  <span className="flex items-center gap-1.5">
                    <Loader2 size={14} className="animate-spin" />
                    Exportando… {Math.round(job.progress * 100)}%
                  </span>
                  <button
                    type="button"
                    onClick={cancelExport}
                    className="rounded px-2 py-1 hover:bg-white/10"
                  >
                    Cancelar
                  </button>
                </div>
              </>
            ) : (
              <>
                {job.state === 'done' && (
                  <button
                    type="button"
                    onClick={() => download(job.url, job.name)}
                    className="flex items-center justify-center gap-2 rounded border border-white/20 px-3 py-2 text-sm hover:bg-white/10"
                  >
                    <Download size={16} />
                    Descargar de nuevo · {(job.bytes / 1024 / 1024).toFixed(
                      1
                    )}{' '}
                    MB
                  </button>
                )}
                <button
                  type="button"
                  onClick={startExport}
                  disabled={!sel || !stream || supported === false}
                  className="flex items-center justify-center gap-2 rounded bg-amber-400 px-3 py-2.5 text-sm font-semibold text-black hover:bg-amber-300 disabled:opacity-40"
                >
                  <Scissors size={16} />
                  Exportar MP4 · {formatDuration(clipLength)}
                </button>
              </>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

function Section({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-[10px] font-semibold tracking-wide text-white/45 uppercase">
        {title}
      </h3>
      {children}
    </section>
  );
}

function TransportButton({
  onClick,
  label,
  primary,
  active,
  children
}: {
  onClick: () => void;
  label: string;
  primary?: boolean;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      aria-pressed={active}
      className={`flex size-8 items-center justify-center rounded ${
        primary
          ? 'bg-white text-black hover:bg-white/85'
          : active
            ? 'bg-amber-400/20 text-amber-300'
            : 'text-white/80 hover:bg-white/10'
      }`}
    >
      {children}
    </button>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="rounded border border-white/20 px-1 font-sans text-[10px] text-white/70">
      {children}
    </kbd>
  );
}
