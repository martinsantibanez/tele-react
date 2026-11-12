'use client';
import type { ClipCrop } from '@/lib/clip';

/** Where the picture sits on the stage, in pixels. */
export type Box = { left: number; top: number; width: number; height: number };

type Props = {
  /** The picture, as laid out on the stage. */
  box: Box;
  crop: ClipCrop;
  zoom: number;
  /** The centre of the frame moved to (fractions of the picture). */
  onMove: (cx: number, cy: number) => void;
  onZoom: (zoom: number) => void;
};

export const MAX_ZOOM = 4;

/**
 * The part of the picture the clip keeps, over the picture. The rest is
 * dimmed. Dragging it moves it; its corners, or the wheel, zoom in and out
 * about its centre.
 */
export function CropFrame({ box, crop, zoom, onMove, onZoom }: Props) {
  const frame = {
    left: box.left + crop.x * box.width,
    top: box.top + crop.y * box.height,
    width: crop.width * box.width,
    height: crop.height * box.height
  };

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
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  const pressFrame = (e: React.PointerEvent) => {
    const cx = crop.x + crop.width / 2;
    const cy = crop.y + crop.height / 2;
    follow(e, (dx, dy) => onMove(cx + dx / box.width, cy + dy / box.height));
  };

  // A corner dragged away from the centre makes the frame bigger, which is
  // zooming out.
  const pressCorner = (e: React.PointerEvent) => {
    const centreX = frame.left + frame.width / 2;
    const centreY = frame.top + frame.height / 2;
    const target = e.currentTarget.parentElement!.parentElement!;
    const rect = target.getBoundingClientRect();
    const reach = (x: number, y: number) =>
      Math.hypot(x - rect.left - centreX, y - rect.top - centreY);
    const reach0 = reach(e.clientX, e.clientY);
    const zoom0 = zoom;
    follow(e, (_, __, ev) =>
      onZoom((zoom0 * reach0) / Math.max(1, reach(ev.clientX, ev.clientY)))
    );
  };

  const corners = [
    '-left-1.5 -top-1.5 cursor-nwse-resize',
    '-right-1.5 -top-1.5 cursor-nesw-resize',
    '-left-1.5 -bottom-1.5 cursor-nesw-resize',
    '-right-1.5 -bottom-1.5 cursor-nwse-resize'
  ];

  return (
    <div
      className="absolute inset-0"
      onWheel={e => onZoom(zoom * Math.exp(-e.deltaY * 0.0015))}
    >
      <div
        onPointerDown={pressFrame}
        className="absolute cursor-move outline-2 outline-white"
        style={{ ...frame, boxShadow: '0 0 0 9999px rgba(0,0,0,0.62)' }}
      >
        {/* Thirds, to frame by. */}
        <div className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3">
          {Array.from({ length: 9 }, (_, i) => (
            <div key={i} className="border-[0.5px] border-white/25" />
          ))}
        </div>
        {corners.map(position => (
          <div
            key={position}
            onPointerDown={pressCorner}
            className={`absolute size-3 rounded-sm border border-black/40 bg-white ${position}`}
          />
        ))}
      </div>
    </div>
  );
}
