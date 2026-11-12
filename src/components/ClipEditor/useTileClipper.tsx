'use client';
import { Loader2, Scissors, Square } from 'lucide-react';
import {
  lazy,
  ReactNode,
  RefObject,
  Suspense,
  useEffect,
  useCallback,
  useRef,
  useState,
  useSyncExternalStore
} from 'react';
import { createPortal } from 'react-dom';
import { useHotkeys } from 'react-hotkeys-hook';
// Types only: Mediabunny loads once a recording starts.
import type { ClipRecording, Recorder } from '@/lib/clip';
import { isTvDevice } from '../../hooks/useIsTv';

const ClipEditor = lazy(() => import('./ClipEditor'));

/** As long as a clip can be: see `CLIP_MAX_S`, kept out of the bundle. */
const RECORD_MAX_S = 10 * 60;
const ERROR_MS = 6000;

// Chrome's Element Capture and Region Capture, not in the DOM typings yet.
type CaptureTarget = unknown;
type TargetClass = { fromElement: (el: Element) => Promise<CaptureTarget> };
type CapturedTrack = MediaStreamTrack & {
  restrictTo?: (target: CaptureTarget) => Promise<void>;
  cropTo?: (target: CaptureTarget) => Promise<void>;
};
const targetClasses = () => {
  const w = window as unknown as {
    RestrictionTarget?: TargetClass;
    CropTarget?: TargetClass;
  };
  return { restriction: w.RestrictionTarget, crop: w.CropTarget };
};

/**
 * Whether a tile can be recorded here: not on a TV, nor on a phone, which
 * can't capture the screen, and only where the capture can be kept to the
 * tile and encoded.
 */
export const canRecordTiles = () => {
  if (typeof window === 'undefined' || isTvDevice()) return false;
  const { restriction, crop } = targetClasses();
  return (
    'VideoEncoder' in window &&
    !!navigator.mediaDevices?.getDisplayMedia &&
    !!(restriction || crop)
  );
};

type State =
  | { step: 'idle' }
  | { step: 'starting' }
  | { step: 'recording'; startedAt: number }
  | { step: 'saving' }
  | { step: 'editing'; recording: ClipRecording }
  | { step: 'error'; message: string };

const noChange = () => () => {};

const formatElapsed = (s: number) => {
  const m = Math.floor(s / 60);
  return `${m}:${String(Math.floor(s - m * 60)).padStart(2, '0')}`;
};

/**
 * Clips from a tile whose stream the page can't read, a YouTube embed: its
 * frames live in another origin's frame. So it is recorded off the screen
 * instead, while it plays, and the clip editor opens on the recording.
 *
 * The browser asks to share this tab, and the capture is then kept to
 * `targetRef`'s element: with Element Capture, just it and what is inside
 * it, whatever is laid over it; with Region Capture, where Element Capture
 * isn't, the part of the tab it covers. The element has to be a stacking
 * context of its own (`isolate`) for Element Capture to take it.
 *
 * C, or the scissors in the tile's corner while `enabled`, starts it; C or
 * stop ends it, as does the browser's own "stop sharing", or reaching the
 * longest a clip can be. It records the tab's audio, so the tile is to be
 * heard while `recording` and quiet while `editing`, the editor's to play.
 */
export function useTileClipper({
  targetRef,
  title,
  enabled
}: {
  targetRef: RefObject<HTMLElement | null>;
  title: string;
  /** Whether a recording can be started: the tile filling the screen. */
  enabled: boolean;
}): { recording: boolean; editing: boolean; ui: ReactNode } {
  const [state, setState] = useState<State>({ step: 'idle' });
  const [now, setNow] = useState(0);
  const recorderRef = useRef<Recorder | undefined>(undefined);
  // Fixed for the page's life; on the server, no.
  const supported = useSyncExternalStore(
    noChange,
    canRecordTiles,
    () => false
  );

  const fail = useCallback((error: unknown) => {
    console.error(error);
    setState({
      step: 'error',
      message: error instanceof Error ? error.message : String(error)
    });
  }, []);

  const stop = useCallback(async () => {
    const recorder = recorderRef.current;
    if (!recorder) return;
    recorderRef.current = undefined;
    setState({ step: 'saving' });
    try {
      setState({ step: 'editing', recording: await recorder.stop() });
    } catch (error) {
      fail(error);
    }
  }, [fail]);

  const start = async () => {
    const el = targetRef.current;
    if (!el) return;
    setState({ step: 'starting' });
    let stream: MediaStream;
    try {
      // Asked for first, while the press that started it still counts.
      stream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: { ideal: 30 } },
        audio: true,
        preferCurrentTab: true,
        selfBrowserSurface: 'include',
        surfaceSwitching: 'exclude',
        monitorTypeSurfaces: 'exclude'
      } as DisplayMediaStreamOptions);
    } catch {
      // Declined: nothing to say about it.
      return setState({ step: 'idle' });
    }

    const track = stream.getVideoTracks()[0] as CapturedTrack | undefined;
    try {
      const { restriction, crop } = targetClasses();
      // Either rejects when what was shared is not this tab.
      if (restriction && track?.restrictTo) {
        await track.restrictTo(await restriction.fromElement(el));
      } else if (crop && track?.cropTo) {
        await track.cropTo(await crop.fromElement(el));
      } else {
        throw new Error();
      }
    } catch {
      stream.getTracks().forEach(t => t.stop());
      return fail(new Error('Para grabar el clip, comparte esta pestaña.'));
    }

    try {
      const rect = el.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const { recordStream } = await import('@/lib/clip');
      const recorder = await recordStream(stream, {
        width: rect.width * dpr,
        height: rect.height * dpr
      });
      recorderRef.current = recorder;
      recorder.failed.catch(error => {
        if (recorderRef.current !== recorder) return;
        recorderRef.current = undefined;
        recorder.cancel();
        fail(error);
      });
      // The browser's own "stop sharing".
      track?.addEventListener('ended', () => {
        if (recorderRef.current === recorder) void stop();
      });
      setNow(Date.now() / 1000);
      setState({ step: 'recording', startedAt: recorder.startedAt });
    } catch (error) {
      stream.getTracks().forEach(t => t.stop());
      fail(error);
    }
  };

  const toggle = () => {
    if (state.step === 'recording') void stop();
    else if (state.step === 'idle' || state.step === 'error') void start();
  };

  // The clock on the recording, and its end once it is as long as a clip.
  const startedAt = state.step === 'recording' ? state.startedAt : undefined;
  useEffect(() => {
    if (startedAt === undefined) return;
    const tick = window.setInterval(() => {
      const t = Date.now() / 1000;
      setNow(t);
      if (t - startedAt >= RECORD_MAX_S) void stop();
    }, 250);
    return () => window.clearInterval(tick);
  }, [startedAt, stop]);

  const errorShown = state.step === 'error';
  useEffect(() => {
    if (!errorShown) return;
    const timer = window.setTimeout(() => setState({ step: 'idle' }), ERROR_MS);
    return () => window.clearTimeout(timer);
  }, [errorShown]);

  // Gone with the tile: nothing is kept.
  useEffect(
    () => () => {
      recorderRef.current?.cancel();
      recorderRef.current = undefined;
    },
    []
  );

  const recording = state.step === 'recording';
  useHotkeys('c', toggle, {
    enabled: supported && (enabled || recording),
    preventDefault: true
  });

  if (!supported) return { recording: false, editing: false, ui: null };

  const ui = (
    <>
      {recording ? (
        <button
          type="button"
          onClick={() => void stop()}
          className="absolute top-2 right-2 z-10 flex items-center gap-1.5 rounded-full bg-black/70 py-1 pr-3 pl-2 text-xs font-semibold text-white tabular-nums hover:bg-black/85"
          title="Terminar la grabación y editar el clip (C)"
        >
          <span className="size-2.5 animate-pulse rounded-full bg-red-500" />
          {formatElapsed(now - state.startedAt)}
          <Square size={12} className="ml-1 fill-current" />
          Detener
        </button>
      ) : state.step === 'starting' || state.step === 'saving' ? (
        <div className="absolute top-2 right-2 z-10 rounded-full bg-black/70 p-2 text-white">
          <Loader2 size={16} className="animate-spin" />
        </div>
      ) : (
        enabled &&
        state.step !== 'editing' && (
          <button
            type="button"
            onClick={toggle}
            className="absolute top-2 right-2 z-10 rounded-full bg-black/60 p-2 text-white opacity-70 hover:bg-black/80 hover:opacity-100"
            aria-label="Grabar un clip (C)"
            title="Grabar un clip (C)"
          >
            <Scissors size={16} />
          </button>
        )
      )}
      {state.step === 'error' && (
        <p className="absolute top-12 right-2 z-10 max-w-64 rounded bg-red-950/90 px-2 py-1.5 text-xs text-red-200">
          {state.message}
        </p>
      )}
      {state.step === 'editing' &&
        createPortal(
          <Suspense fallback={null}>
            <ClipEditor
              title={title}
              recording={state.recording}
              onClose={() => setState({ step: 'idle' })}
            />
          </Suspense>,
          document.body
        )}
    </>
  );

  return { recording, editing: state.step === 'editing', ui };
}
