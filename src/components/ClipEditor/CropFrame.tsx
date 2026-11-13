'use client';
import { useId, useRef } from 'react';
import { OnPress, useDrag } from '@/src/hooks/useDrag';
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
  const root = useRef<HTMLDivElement>(null);
  const placed = frames.map(({ crop }) => ({
    left: box.left + crop.x * box.width,
    top: box.top + crop.y * box.height,
    width: crop.width * box.width,
    height: crop.height * box.height
  }));

  const pressFrame =
    (i: number): OnPress =>
    () => {
      onActivate(i);
      const { crop } = frames[i];
      const cx = crop.x + crop.width / 2;
      const cy = crop.y + crop.height / 2;
      return {
        move: ({ dx, dy }) =>
          onMove(i, cx + dx / box.width, cy + dy / box.height)
      };
    };

  // A corner dragged away from the centre makes the frame bigger, which is
  // zooming out.
  const pressCorner =
    (i: number): OnPress =>
    press => {
      onActivate(i);
      const rect = root.current?.getBoundingClientRect();
      if (!rect) return;
      const frame = placed[i];
      const centreX = rect.left + frame.left + frame.width / 2;
      const centreY = rect.top + frame.top + frame.height / 2;
      const reach = (x: number, y: number) =>
        Math.hypot(x - centreX, y - centreY);
      const reach0 = reach(press.x, press.y);
      const zoom0 = frames[i].zoom;
      return {
        move: ({ x, y }) =>
          onZoom(i, (zoom0 * reach0) / Math.max(1, reach(x, y)))
      };
    };

  const wheel = (e: React.WheelEvent, i: number) => {
    e.stopPropagation();
    onZoom(i, frames[i].zoom * Math.exp(-e.deltaY * 0.0015));
  };

  return (
    <div
      ref={root}
      className="absolute inset-0"
      onWheel={e => wheel(e, active)}
    >
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
        <FrameBox
          key={i}
          placement={placed[i]}
          color={color}
          onTop={i === active}
          outlined={frames.length > 1}
          onPress={pressFrame(i)}
          onPressCorner={pressCorner(i)}
          onWheel={e => wheel(e, i)}
        />
      ))}
    </div>
  );
}

const CORNERS = [
  '-left-1.5 -top-1.5 cursor-nwse-resize',
  '-right-1.5 -top-1.5 cursor-nesw-resize',
  '-left-1.5 -bottom-1.5 cursor-nesw-resize',
  '-right-1.5 -bottom-1.5 cursor-nwse-resize'
];

/** One frame, to drag about, with a corner to zoom it by at each corner. */
function FrameBox({
  placement,
  color,
  onTop,
  outlined,
  onPress,
  onPressCorner,
  onWheel
}: {
  placement: Box;
  color: string;
  onTop: boolean;
  /** Corners in the frame's colour, where there is more than one to tell. */
  outlined: boolean;
  onPress: OnPress;
  onPressCorner: OnPress;
  onWheel: (e: React.WheelEvent) => void;
}) {
  const drag = useDrag(onPress);
  return (
    <div
      {...drag}
      onWheel={onWheel}
      className="absolute cursor-move touch-none outline-2"
      style={{ ...placement, outlineColor: color, zIndex: onTop ? 2 : 1 }}
    >
      {/* Thirds, to frame by. */}
      <div className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3">
        {Array.from({ length: 9 }, (_, j) => (
          <div key={j} className="border-[0.5px] border-white/25" />
        ))}
      </div>
      {CORNERS.map(position => (
        <Corner
          key={position}
          position={position}
          color={outlined ? color : undefined}
          onPress={onPressCorner}
        />
      ))}
    </div>
  );
}

function Corner({
  position,
  color,
  onPress
}: {
  position: string;
  /** Outlined in it; unset, a thin dark edge. */
  color?: string;
  onPress: OnPress;
}) {
  const drag = useDrag(onPress);
  return (
    <div
      {...drag}
      className={`absolute size-3 touch-none rounded-sm bg-white before:absolute before:-inset-1.5 before:content-[''] pointer-coarse:before:-inset-3.5 ${position} ${
        color ? 'border-2' : 'border border-black/40'
      }`}
      style={color ? { borderColor: color } : undefined}
    />
  );
}
