'use client';
import { Expand, ZoomIn, ZoomOut } from 'lucide-react';
import {
  ReactNode,
  Ref,
  useEffect,
  useEffectEvent,
  useImperativeHandle,
  useRef,
  useState
} from 'react';
import { Follow, Press, useDrag } from '@/src/hooks/useDrag';

export type Range = { start: number; end: number };

/** The overview of the whole stream, or the strip to trim the clip on. */
export type Strip = 'overview' | 'detail';

/** For the editor's keys: zooming a strip in (`factor` > 1) or out. */
export type TimelineControls = {
  zoom: (strip: Strip, factor: number) => void;
  fit: (strip: Strip) => void;
};

type Props = {
  /** What the stream holds, in player seconds. */
  stream: Range;
  sel: Range;
  time: number;
  /** Player seconds to wall-clock (unix) seconds. */
  toClock: (t: number) => number;
  onSeek: (t: number) => void;
  /** A new selection; `edge` is the end the user is moving, if just one. */
  onSel: (sel: Range, edge?: 'start' | 'end') => void;
  controlsRef?: Ref<TimelineControls>;
};

const TICK_STEPS = [
  1, 2, 5, 10, 15, 30, 60, 120, 300, 600, 900, 1800, 3600, 7200
];

/** What a button press zooms by. */
export const ZOOM_STEP = 2;
/** How close in each strip goes, in seconds across. */
const MIN_SPAN: Record<Strip, number> = { overview: 30, detail: 1 };

const clamp = (n: number, min: number, max: number) =>
  Math.min(Math.max(n, min), max);

const spanOf = (r: Range) => r.end - r.start;

/** `view` moved to lie within `bounds`, and no longer than they are. */
const within = (view: Range, bounds: Range): Range => {
  const span = Math.min(spanOf(view), spanOf(bounds));
  const start = clamp(view.start, bounds.start, bounds.end - span);
  return { start, end: start + span };
};

/** `view`, `factor` times closer in around `at`, which stays where it is. */
const zoomed = (
  view: Range,
  factor: number,
  at: number,
  bounds: Range,
  minSpan: number
): Range => {
  const span = clamp(
    spanOf(view) / factor,
    Math.min(minSpan, spanOf(bounds)),
    spanOf(bounds)
  );
  const start = at - ((at - view.start) / spanOf(view)) * span;
  return within({ start, end: start + span }, bounds);
};

/** Whether `view` shows less than all of `bounds`. */
const narrower = (view: Range, bounds: Range) =>
  spanOf(view) < spanOf(bounds) - 1e-3;

export const formatClock = (unix: number, seconds = true) =>
  new Date(unix * 1000).toLocaleTimeString('es-CL', {
    hour: '2-digit',
    minute: '2-digit',
    second: seconds ? '2-digit' : undefined,
    hour12: false
  });

export const formatDuration = (s: number) => {
  const m = Math.floor(s / 60);
  const rest = s - m * 60;
  return m
    ? `${m}:${rest.toFixed(1).padStart(4, '0')}`
    : `${rest.toFixed(1)} s`;
};

/**
 * Follows a press on `el` until it is let go, as times across `view`. `from`
 * is the time pressed; a press that never went further than a few pixels ends
 * unmoved, a click.
 */
const followPress = (
  el: HTMLElement,
  view: Range,
  press: Press,
  onMove: (t: number) => void,
  onEnd?: (t: number, moved: boolean) => void
): { from: number; follow: Follow } => {
  const rect = el.getBoundingClientRect();
  const toTime = (x: number) =>
    view.start +
    clamp((x - rect.left) / rect.width, 0, 1) * (view.end - view.start);
  let moved = false;
  return {
    from: toTime(press.x),
    follow: {
      move: ({ x, dx }) => {
        if (Math.abs(dx) > 3) moved = true;
        if (moved) onMove(toTime(x));
      },
      end: ({ x }) => onEnd?.(toTime(x), moved)
    }
  };
};

/** Tick marks on the wall clock, about `count` of them across `view`. */
function Ticks({
  view,
  toClock,
  count
}: {
  view: Range;
  toClock: (t: number) => number;
  count: number;
}) {
  const span = view.end - view.start;
  if (span <= 0) return null;
  const step = TICK_STEPS.find(s => span / s <= count) ?? 7200;
  const offset = toClock(0);
  const ticks: number[] = [];
  for (
    let wall = Math.ceil((view.start + offset) / step) * step;
    wall - offset <= view.end;
    wall += step
  ) {
    ticks.push(wall);
  }
  return (
    <>
      {ticks.map(wall => (
        <div
          key={wall}
          className="pointer-events-none absolute top-0 bottom-0 border-l border-white/15"
          style={{ left: `${((wall - offset - view.start) / span) * 100}%` }}
        >
          <span className="absolute top-0.5 left-1 text-[10px] whitespace-nowrap text-white/45 tabular-nums">
            {formatClock(wall, step < 60)}
          </span>
        </div>
      ))}
    </>
  );
}

const pct = (t: number, view: Range) =>
  `${((t - view.start) / (view.end - view.start)) * 100}%`;

/**
 * Where the clip is in the stream: an overview of everything the stream
 * holds, where a drag picks the minutes to clip and the selection can be
 * moved whole, and a strip zoomed in on the selection to trim its ends.
 *
 * Either can be zoomed, with its buttons or Ctrl and the wheel (a pinch on a
 * trackpad), and panned along the bar under it or with the wheel sideways
 * (Shift and the wheel). Zoomed in, a strip pages along with the playhead.
 */
export function ClipTimeline({
  stream,
  sel,
  time,
  toClock,
  onSeek,
  onSel,
  controlsRef
}: Props) {
  const overviewRef = useRef<HTMLDivElement>(null);
  const detailRef = useRef<HTMLDivElement>(null);
  // While its ends are dragged the strip holds still, or it would slide away
  // under the pointer.
  const [held, setHeld] = useState<Range>();
  const [dragging, setDragging] = useState<Range>();
  // What each strip has been zoomed or panned to; unset, it fits: the
  // overview to the whole stream, the strip to the selection.
  const [views, setViews] = useState<Partial<Record<Strip, Range>>>({});

  const pad = Math.max(3, (sel.end - sel.start) * 0.35);
  const fitted: Record<Strip, Range> = {
    overview: stream,
    detail: {
      start: Math.max(stream.start, sel.start - pad),
      end: Math.min(stream.end, sel.end + pad)
    }
  };
  const viewOf = (strip: Strip) => {
    const view = views[strip];
    return view ? within(view, stream) : fitted[strip];
  };
  const overview = viewOf('overview');
  const detail = held ?? viewOf('detail');

  const setView = (strip: Strip, view: Range | undefined) =>
    setViews(v => ({
      ...v,
      // All of the stream is how the overview fits anyway.
      [strip]:
        view && (strip === 'detail' || narrower(view, stream))
          ? view
          : undefined
    }));
  const zoom = (strip: Strip, factor: number, at?: number) => {
    const view = viewOf(strip);
    const anchor =
      at ??
      (time >= view.start && time <= view.end
        ? time
        : (view.start + view.end) / 2);
    setView(
      strip,
      zoomed(view, factor, anchor, stream, MIN_SPAN[strip])
    );
  };
  const panTo = (strip: Strip, start: number) => {
    const view = viewOf(strip);
    if (!narrower(view, stream)) return;
    setView(
      strip,
      within({ start, end: start + spanOf(view) }, stream)
    );
  };
  const fit = (strip: Strip) => setView(strip, undefined);
  useImperativeHandle(controlsRef, () => ({ zoom, fit }));

  // Zoomed in, a strip turns the page as the playhead runs off it, or comes
  // back to it when it is sought away. Not while something on it is dragged,
  // nor when it is panned away from a playhead standing still.
  const [seenTime, setSeenTime] = useState(time);
  if (time !== seenTime) {
    setSeenTime(time);
    if (!held && !dragging) {
      for (const strip of ['overview', 'detail'] as Strip[]) {
        const view = views[strip] && within(views[strip], stream);
        if (!view || (time >= view.start && time <= view.end)) continue;
        const span = spanOf(view);
        const start = time > view.end ? time - span * 0.1 : time - span * 0.5;
        setView(strip, within({ start, end: start + span }, stream));
      }
    }
  }

  // The wheel, on either strip. Native, to keep Ctrl and the wheel from
  // zooming the page as well.
  const onWheel = useEffectEvent((strip: Strip, e: WheelEvent) => {
    const el = (strip === 'overview' ? overviewRef : detailRef).current;
    if (!el) return;
    const view = viewOf(strip);
    const rect = el.getBoundingClientRect();
    const px = e.deltaMode === 1 ? 33 : e.deltaMode === 2 ? rect.width : 1;
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const at =
        view.start +
        clamp((e.clientX - rect.left) / rect.width, 0, 1) * spanOf(view);
      zoom(strip, Math.exp(-e.deltaY * px * 0.005), at);
      return;
    }
    const sideways =
      Math.abs(e.deltaX) > Math.abs(e.deltaY)
        ? e.deltaX
        : e.shiftKey
          ? e.deltaY
          : 0;
    if (!sideways || !narrower(view, stream)) return;
    e.preventDefault();
    panTo(
      strip,
      view.start + ((sideways * px) / rect.width) * spanOf(view)
    );
  });
  useEffect(() => {
    const strips = [
      ['overview', overviewRef.current],
      ['detail', detailRef.current]
    ] as const;
    const offs = strips.map(([strip, el]) => {
      const listener = (e: WheelEvent) => onWheel(strip, e);
      el?.addEventListener('wheel', listener, { passive: false });
      return () => el?.removeEventListener('wheel', listener);
    });
    return () => offs.forEach(off => off());
  }, []);

  const overviewDrag = useDrag(press => {
    if (!overviewRef.current) return;
    const { from, follow } = followPress(
      overviewRef.current,
      overview,
      press,
      t => setDragging({ start: Math.min(from, t), end: Math.max(from, t) }),
      (t, moved) => {
        setDragging(undefined);
        if (!moved) return onSeek(t);
        const picked = { start: Math.min(from, t), end: Math.max(from, t) };
        onSel(picked);
        onSeek(picked.start);
      }
    );
    return follow;
  });

  // Not while a new one is being picked over it: that drag is the overview's.
  const selectionDrag = useDrag(
    press => {
      if (!overviewRef.current) return;
      const length = sel.end - sel.start;
      const startSel = sel;
      const { from, follow } = followPress(
        overviewRef.current,
        overview,
        press,
        t => {
          const start = clamp(
            startSel.start + t - from,
            stream.start,
            stream.end - length
          );
          onSel({ start, end: start + length });
        },
        (_, moved) => {
          if (!moved) onSeek(startSel.start);
        }
      );
      return follow;
    },
    { disabled: !!dragging }
  );

  const detailDrag = useDrag(press => {
    if (!detailRef.current) return;
    const view = detail;
    setHeld(view);
    const { from, follow } = followPress(
      detailRef.current,
      view,
      press,
      onSeek,
      () => setHeld(undefined)
    );
    onSeek(from);
    return follow;
  });

  const pressEdge = (edge: 'start' | 'end', press: Press) => {
    if (!detailRef.current) return;
    const view = detail;
    setHeld(view);
    const startSel = sel;
    return followPress(
      detailRef.current,
      view,
      press,
      t => {
        onSel({ ...startSel, [edge]: t }, edge);
        onSeek(t);
      },
      () => setHeld(undefined)
    ).follow;
  };
  const startDrag = useDrag(press => pressEdge('start', press));
  const endDrag = useDrag(press => pressEdge('end', press));

  const shown = dragging ?? sel;
  const playheadInDetail = time >= detail.start && time <= detail.end;
  // Zoomed in on the strip, the selection may run off either side of it:
  // what is in view is drawn, with a handle on each end there is.
  const boxed = {
    start: Math.max(sel.start, detail.start),
    end: Math.min(sel.end, detail.end)
  };
  const startShown = sel.start >= detail.start;
  const endShown = sel.end <= detail.end;

  const zoomButtons = (strip: Strip, view: Range, what: string) => (
    <ZoomButtons
      what={what}
      canIn={spanOf(view) > Math.min(MIN_SPAN[strip], spanOf(stream)) + 1e-3}
      canOut={narrower(view, stream)}
      fitted={!views[strip]}
      onZoom={factor => zoom(strip, factor)}
      onFit={() => fit(strip)}
    />
  );

  return (
    <div className="flex flex-col gap-2 select-none">
      <div className="flex items-start gap-1.5">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div
            ref={el => {
              overviewRef.current = el;
              overviewDrag.ref(el);
            }}
            onPointerDown={overviewDrag.onPointerDown}
            className="relative h-9 cursor-crosshair touch-none overflow-hidden rounded bg-white/5 pointer-coarse:h-11"
            title="Arrastra para elegir los minutos del clip"
          >
            <Ticks view={overview} toClock={toClock} count={8} />
            {shown.end >= overview.start && shown.start <= overview.end && (
              <div
                {...selectionDrag}
                className={`absolute top-0 bottom-0 min-w-1.5 border-x-2 border-amber-400 bg-amber-400/35 ${
                  dragging ? '' : 'cursor-grab active:cursor-grabbing'
                }`}
                style={{
                  left: pct(shown.start, overview),
                  width: `calc(${pct(shown.end, overview)} - ${pct(shown.start, overview)})`
                }}
              />
            )}
            <div
              className="pointer-events-none absolute top-0 bottom-0 w-0.5 bg-white"
              style={{ left: pct(time, overview) }}
            />
          </div>
          <ViewBar
            bounds={stream}
            view={overview}
            sel={shown}
            time={time}
            onPan={start => panTo('overview', start)}
          />
        </div>
        {zoomButtons('overview', overview, 'la señal')}
      </div>

      <div className="flex items-start gap-1.5">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div
            ref={el => {
              detailRef.current = el;
              detailDrag.ref(el);
            }}
            onPointerDown={detailDrag.onPointerDown}
            className="relative h-16 cursor-text touch-none rounded bg-white/5"
          >
            <div className="absolute inset-0 overflow-hidden rounded">
              <Ticks view={detail} toClock={toClock} count={10} />
            </div>
            {boxed.end >= boxed.start && (
              <div
                className="absolute top-0 bottom-0 border-y-2 border-amber-400 bg-amber-400/15"
                style={{
                  left: pct(boxed.start, detail),
                  width: `calc(${pct(boxed.end, detail)} - ${pct(boxed.start, detail)})`
                }}
              >
                {startShown && (
                  <Handle side="start" drag={startDrag} />
                )}
                {endShown && (
                  <Handle side="end" drag={endDrag} />
                )}
              </div>
            )}
            {playheadInDetail && (
              <div
                className="pointer-events-none absolute -top-1 -bottom-1 w-0.5 bg-white shadow"
                style={{ left: pct(time, detail) }}
              >
                <div className="absolute -top-1 -left-1 size-2.5 rotate-45 bg-white" />
              </div>
            )}
          </div>
          <ViewBar
            bounds={stream}
            view={detail}
            sel={sel}
            time={time}
            onPan={start => panTo('detail', start)}
          />
        </div>
        {zoomButtons('detail', detail, 'el clip')}
      </div>
    </div>
  );
}

/**
 * Under a zoomed-in strip, where it is in the stream: the part in view, to
 * drag along it, or to press elsewhere to jump there. Marked with the
 * selection and the playhead, to find them.
 */
function ViewBar({
  bounds,
  view,
  sel,
  time,
  onPan
}: {
  bounds: Range;
  view: Range;
  sel: Range;
  time: number;
  onPan: (start: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const zoomedIn = narrower(view, bounds);

  const drag = useDrag(
    press => {
      if (!ref.current) return;
      const span = spanOf(view);
      let base = view.start;
      const { from, follow } = followPress(
        ref.current,
        bounds,
        press,
        t => onPan(base + t - from)
      );
      // Pressed off the part in view, it is brought there first.
      if (from < view.start || from > view.end) {
        base = from - span / 2;
        onPan(base);
      }
      return follow;
    },
    { disabled: !zoomedIn }
  );

  return (
    <div
      ref={el => {
        ref.current = el;
        drag.ref(el);
      }}
      onPointerDown={drag.onPointerDown}
      className={`relative h-1.5 touch-none overflow-hidden rounded-full bg-white/10 pointer-coarse:h-3 ${
        zoomedIn ? 'cursor-pointer' : 'invisible'
      }`}
      aria-hidden
    >
      <div
        className="absolute inset-y-0 bg-amber-400/60"
        style={{
          left: pct(sel.start, bounds),
          width: `max(2px, calc(${pct(sel.end, bounds)} - ${pct(sel.start, bounds)}))`
        }}
      />
      <div
        className="absolute inset-y-0 w-px bg-white"
        style={{ left: pct(time, bounds) }}
      />
      <div
        className="absolute inset-y-0 min-w-2 rounded-full border border-white/70 bg-white/25 hover:bg-white/40"
        style={{
          left: pct(view.start, bounds),
          width: `calc(${pct(view.end, bounds)} - ${pct(view.start, bounds)})`
        }}
      />
    </div>
  );
}

function ZoomButtons({
  what,
  canIn,
  canOut,
  fitted,
  onZoom,
  onFit
}: {
  what: string;
  canIn: boolean;
  canOut: boolean;
  fitted: boolean;
  onZoom: (factor: number) => void;
  onFit: () => void;
}) {
  return (
    <div className="flex shrink-0 items-center">
      <ZoomButton
        label={`Alejar ${what}`}
        onClick={() => onZoom(1 / ZOOM_STEP)}
        disabled={!canOut}
      >
        <ZoomOut size={15} />
      </ZoomButton>
      <ZoomButton
        label={`Acercar ${what}`}
        onClick={() => onZoom(ZOOM_STEP)}
        disabled={!canIn}
      >
        <ZoomIn size={15} />
      </ZoomButton>
      <ZoomButton
        label={`Ajustar ${what}`}
        onClick={onFit}
        disabled={fitted}
      >
        <Expand size={14} />
      </ZoomButton>
    </div>
  );
}

function ZoomButton({
  label,
  onClick,
  disabled,
  children
}: {
  label: string;
  onClick: () => void;
  disabled: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="flex size-7 items-center justify-center rounded text-white/70 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent pointer-coarse:size-9"
    >
      {children}
    </button>
  );
}

function Handle({
  side,
  drag
}: {
  side: 'start' | 'end';
  drag: ReturnType<typeof useDrag>;
}) {
  return (
    <div
      {...drag}
      className={`absolute -top-0.5 -bottom-0.5 flex w-3.5 cursor-ew-resize items-center justify-center bg-amber-400 before:absolute before:inset-y-0 before:-inset-x-2 before:content-[''] ${
        side === 'start' ? '-left-3.5 rounded-l-md' : '-right-3.5 rounded-r-md'
      }`}
      aria-label={side === 'start' ? 'Inicio del clip' : 'Fin del clip'}
    >
      <div className="h-5 w-0.5 rounded bg-black/60" />
    </div>
  );
}
