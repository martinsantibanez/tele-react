'use client';
import { useId } from 'react';
import type { ClipCrop } from '@/lib/clip';

/** Where the picture sits on the stage, in pixels. */
export type Box = { left: number; top: number; width: number; height: number };

/** A part of the picture the clip keeps, in the colour it is told by. */
export type Frame = { crop: ClipCrop; zoom: number; color: string };

type Props = {
  /** The picture, as laid out on the stage. */
  box: Box;
  frames: Frame[];
  /** The frame the wheel zooms, drawn over the others. */
  active: number;
  onActivate: (i: number) => void;
  /** Frame `i`'s centre moved to (fractions of the picture). */
  onMove: (i: number, cx: number, cy: number) => void;
  onZoom: (i: number, zoom: number) => void;
};

export const MAX_ZOOM = 4;

/**
 * The parts of the picture the clip keeps, over the picture. The rest is
 * dimmed. Dragging one moves it; its corners, or the wheel, zoom in and out
 * about its centre.
 */
export function CropFrame({
  box,
  frames,
  active,
  onActivate,
  onMove,
  onZoom
}: Props) {
  const mask = `crop-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const placed = frames.map(({ crop }) => ({
    left: box.left + crop.x * box.width,
    top: box.top + crop.y * box.height,
    width: crop.width * box.width,
    height: crop.height * box.height
  }));

  const follow = (
    e: React.PointerEvent,
    onDrag: (dx: number, dy: number, ev: PointerEvent) => void
  ) => {
    e.preventDefault();
    e.stopPropagation();
    const x0 = e.clientX;
    const y0 = e.clientY;
    const move = (ev: PointerEvent) =>
      onDrag(ev.clientX - x0, ev.clientY - y0, ev);
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
  };

  const pressFrame = (e: React.PointerEvent, i: number) => {
    onActivate(i);
    const { crop } = frames[i];
    const cx = crop.x + crop.width / 2;
    const cy = crop.y + crop.height / 2;
    follow(e, (dx, dy) => onMove(i, cx + dx / box.width, cy + dy / box.height));
  };

  // A corner dragged away from the centre makes the frame bigger, which is
  // zooming out.
  const pressCorner = (e: React.PointerEvent, i: number) => {
    onActivate(i);
    const frame = placed[i];
    const centreX = frame.left + frame.width / 2;
    const centreY = frame.top + frame.height / 2;
    const target = e.currentTarget.parentElement!.parentElement!;
    const rect = target.getBoundingClientRect();
    const reach = (x: number, y: number) =>
      Math.hypot(x - rect.left - centreX, y - rect.top - centreY);
    const reach0 = reach(e.clientX, e.clientY);
    const zoom0 = frames[i].zoom;
    follow(e, (_, __, ev) =>
      onZoom(i, (zoom0 * reach0) / Math.max(1, reach(ev.clientX, ev.clientY)))
    );
  };

  const wheel = (e: React.WheelEvent, i: number) => {
    e.stopPropagation();
    onZoom(i, frames[i].zoom * Math.exp(-e.deltaY * 0.0015));
  };

  const corners = [
    '-left-1.5 -top-1.5 cursor-nwse-resize',
    '-right-1.5 -top-1.5 cursor-nesw-resize',
    '-left-1.5 -bottom-1.5 cursor-nesw-resize',
    '-right-1.5 -bottom-1.5 cursor-nwse-resize'
  ];

  return (
    <div className="absolute inset-0" onWheel={e => wheel(e, active)}>
      {/* Dimmed everywhere but in the frames, overlapping or not. */}
      <svg className="pointer-events-none absolute inset-0 size-full">
        <defs>
          <mask id={mask}>
            <rect width="100%" height="100%" fill="white" />
            {placed.map((f, i) => (
              <rect
                key={i}
                x={f.left}
                y={f.top}
                width={f.width}
                height={f.height}
                fill="black"
              />
            ))}
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(0,0,0,0.62)"
          mask={`url(#${mask})`}
        />
      </svg>
      {frames.map(({ color }, i) => (
        <div
          key={i}
          onPointerDown={e => pressFrame(e, i)}
          onWheel={e => wheel(e, i)}
          className="absolute cursor-move touch-none outline-2"
          style={{
            ...placed[i],
            outlineColor: color,
            zIndex: i === active ? 2 : 1
          }}
        >
          {/* Thirds, to frame by. */}
          <div className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3">
            {Array.from({ length: 9 }, (_, j) => (
              <div key={j} className="border-[0.5px] border-white/25" />
            ))}
          </div>
          {corners.map(position => (
            <div
              key={position}
              onPointerDown={e => pressCorner(e, i)}
              className={`absolute size-3 touch-none rounded-sm bg-white before:absolute before:-inset-1.5 before:content-[''] pointer-coarse:before:-inset-3.5 ${position} ${
                frames.length > 1 ? 'border-2' : 'border border-black/40'
              }`}
              style={frames.length > 1 ? { borderColor: color } : undefined}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
