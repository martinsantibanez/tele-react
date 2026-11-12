'use client';
import { useRef, useState } from 'react';

export type Range = { start: number; end: number };

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
};

const TICK_STEPS = [
  1, 2, 5, 10, 15, 30, 60, 120, 300, 600, 900, 1800, 3600, 7200
];

const clamp = (n: number, min: number, max: number) =>
  Math.min(Math.max(n, min), max);

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
 * Follows a press on `el` until it is let go, as times across `view`.
 * Returns the time pressed.
 */
const followPress = (
  e: React.PointerEvent,
  el: HTMLElement,
  view: Range,
  onMove: (t: number) => void,
  onEnd?: (t: number, moved: boolean) => void
) => {
  e.preventDefault();
  e.stopPropagation();
  const rect = el.getBoundingClientRect();
  const toTime = (x: number) =>
    view.start +
    clamp((x - rect.left) / rect.width, 0, 1) * (view.end - view.start);
  const startX = e.clientX;
  let moved = false;
  const move = (ev: PointerEvent) => {
    if (Math.abs(ev.clientX - startX) > 3) moved = true;
    if (moved) onMove(toTime(ev.clientX));
  };
  const up = (ev: PointerEvent) => {
    window.removeEventListener('pointermove', move);
    window.removeEventListener('pointerup', up);
    onEnd?.(toTime(ev.clientX), moved);
  };
  window.addEventListener('pointermove', move);
  window.addEventListener('pointerup', up);
  return toTime(e.clientX);
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
  const step = TICK_STEPS.find(s => span / s <= count) ?? 3600;
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
 */
export function ClipTimeline({
  stream,
  sel,
  time,
  toClock,
  onSeek,
  onSel
}: Props) {
  const overviewRef = useRef<HTMLDivElement>(null);
  const detailRef = useRef<HTMLDivElement>(null);
  // While its ends are dragged the strip holds still, or it would slide away
  // under the pointer.
  const [held, setHeld] = useState<Range>();
  const [dragging, setDragging] = useState<Range>();

  const pad = Math.max(3, (sel.end - sel.start) * 0.35);
  const detail = held ?? {
    start: Math.max(stream.start, sel.start - pad),
    end: Math.min(stream.end, sel.end + pad)
  };

  const pressOverview = (e: React.PointerEvent) => {
    if (!overviewRef.current) return;
    const from = followPress(
      e,
      overviewRef.current,
      stream,
      t => setDragging({ start: Math.min(from, t), end: Math.max(from, t) }),
      (t, moved) => {
        setDragging(undefined);
        if (!moved) return onSeek(t);
        const picked = { start: Math.min(from, t), end: Math.max(from, t) };
        onSel(picked);
        onSeek(picked.start);
      }
    );
  };

  const pressSelection = (e: React.PointerEvent) => {
    if (!overviewRef.current) return;
    const length = sel.end - sel.start;
    const startSel = sel;
    const from = followPress(
      e,
      overviewRef.current,
      stream,
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
  };

  const pressDetail = (e: React.PointerEvent) => {
    if (!detailRef.current) return;
    const view = detail;
    setHeld(view);
    onSeek(
      followPress(e, detailRef.current, view, onSeek, () => setHeld(undefined))
    );
  };

  const pressEdge = (edge: 'start' | 'end', e: React.PointerEvent) => {
    if (!detailRef.current) return;
    const view = detail;
    setHeld(view);
    const startSel = sel;
    followPress(
      e,
      detailRef.current,
      view,
      t => {
        onSel({ ...startSel, [edge]: t }, edge);
        onSeek(t);
      },
      () => setHeld(undefined)
    );
  };

  const shown = dragging ?? sel;
  const playheadInDetail = time >= detail.start && time <= detail.end;

  return (
    <div className="flex flex-col gap-2 select-none">
      <div
        ref={overviewRef}
        onPointerDown={pressOverview}
        className="relative h-9 cursor-crosshair overflow-hidden rounded bg-white/5"
        title="Arrastra para elegir los minutos del clip"
      >
        <Ticks view={stream} toClock={toClock} count={8} />
        <div
          onPointerDown={dragging ? undefined : pressSelection}
          className={`absolute top-0 bottom-0 min-w-1.5 border-x-2 border-amber-400 bg-amber-400/35 ${
            dragging ? '' : 'cursor-grab active:cursor-grabbing'
          }`}
          style={{
            left: pct(shown.start, stream),
            width: `calc(${pct(shown.end, stream)} - ${pct(shown.start, stream)})`
          }}
        />
        <div
          className="pointer-events-none absolute top-0 bottom-0 w-0.5 bg-white"
          style={{ left: pct(time, stream) }}
        />
      </div>

      <div
        ref={detailRef}
        onPointerDown={pressDetail}
        className="relative h-16 cursor-text rounded bg-white/5"
      >
        <div className="absolute inset-0 overflow-hidden rounded">
          <Ticks view={detail} toClock={toClock} count={10} />
        </div>
        <div
          className="absolute top-0 bottom-0 border-y-2 border-amber-400 bg-amber-400/15"
          style={{
            left: pct(sel.start, detail),
            width: `calc(${pct(sel.end, detail)} - ${pct(sel.start, detail)})`
          }}
        >
          <Handle side="start" onPointerDown={e => pressEdge('start', e)} />
          <Handle side="end" onPointerDown={e => pressEdge('end', e)} />
        </div>
        {playheadInDetail && (
          <div
            className="pointer-events-none absolute -top-1 -bottom-1 w-0.5 bg-white shadow"
            style={{ left: pct(time, detail) }}
          >
            <div className="absolute -top-1 -left-1 size-2.5 rotate-45 bg-white" />
          </div>
        )}
      </div>
    </div>
  );
}

function Handle({
  side,
  onPointerDown
}: {
  side: 'start' | 'end';
  onPointerDown: (e: React.PointerEvent) => void;
}) {
  return (
    <div
      onPointerDown={onPointerDown}
      className={`absolute -top-0.5 -bottom-0.5 flex w-3.5 cursor-ew-resize items-center justify-center bg-amber-400 before:absolute before:inset-y-0 before:-inset-x-2 before:content-[''] ${
        side === 'start' ? '-left-3.5 rounded-l-md' : '-right-3.5 rounded-r-md'
      }`}
      aria-label={side === 'start' ? 'Inicio del clip' : 'Fin del clip'}
    >
      <div className="h-5 w-0.5 rounded bg-black/60" />
    </div>
  );
}
