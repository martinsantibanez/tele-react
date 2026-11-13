'use client';
import {
  DndContext,
  DragStartEvent,
  PointerSensor,
  PointerSensorOptions,
  PointerSensorProps,
  useDraggable,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import { ReactNode, useId, useRef, useState } from 'react';

/** Where a drag was pressed, in client pixels. */
export type Press = { x: number; y: number };

/** Where the pointer is now, and how far that is from the press. */
export type Pointer = { x: number; y: number; dx: number; dy: number };

/** What a press goes on to do until it is let go. */
export type Follow = {
  move?: (pointer: Pointer) => void;
  /** Let go, or cut short: Escape, the window resizing, the tab hidden. */
  end?: (pointer: Pointer) => void;
};

/** Pressed: what to do with it, or nothing to have it do nothing. */
export type OnPress = (press: Press) => Follow | void;

type Data = { press: OnPress };

type SensorOptions = PointerSensorOptions & {
  /** The pointer moved to (`x`, `y`), in client pixels. */
  onPointer: (x: number, y: number) => void;
};

/**
 * dnd-kit's pointer sensor, telling where the pointer went the moment it
 * moves. dnd-kit itself only works the drag out in its next render (its
 * `onDragMove` comes from an effect, and the delta it ends with is the last
 * one rendered), so a release that beats that render would land short of the
 * pointer: a trim a few frames off, on a wall of video or a slow TV box.
 */
class FollowingSensor extends PointerSensor {
  constructor(props: PointerSensorProps) {
    const { onPointer } = props.options as SensorOptions;
    super({
      ...props,
      onMove: coordinates => {
        onPointer(coordinates.x, coordinates.y);
        props.onMove(coordinates);
      }
    });
  }
}

// Nothing here is picked up and put down anywhere, so dnd-kit's spoken
// "picked up draggable item…" would only be noise.
const quiet = () => undefined;
const accessibility = {
  announcements: {
    onDragStart: quiet,
    onDragOver: quiet,
    onDragEnd: quiet,
    onDragCancel: quiet
  },
  screenReaderInstructions: { draggable: '' }
};

/**
 * Where `useDrag` works. Pointer only: the keyboard has its own keys for all
 * of this, and dnd-kit's would take Space and the arrows from them. Nor does
 * a drag scroll the page under it.
 */
export function DragArea({ children }: { children: ReactNode }) {
  const pressed = useRef<Press | null>(null);
  const pointer = useRef<Pointer | null>(null);
  const following = useRef<Follow | null>(null);

  const [options] = useState<SensorOptions>(() => ({
    onPointer: (x, y) => {
      const press = pressed.current;
      if (!press) return;
      pointer.current = { x, y, dx: x - press.x, dy: y - press.y };
      following.current?.move?.(pointer.current);
    }
  }));
  const sensors = useSensors(useSensor(FollowingSensor, options));

  const start = ({ active, activatorEvent }: DragStartEvent) => {
    const { clientX: x, clientY: y } = activatorEvent as PointerEvent;
    pressed.current = { x, y };
    pointer.current = { x, y, dx: 0, dy: 0 };
    const data = active.data.current as Data | undefined;
    following.current = data?.press({ x, y }) || null;
  };
  const finish = () => {
    const follow = following.current;
    const last = pointer.current;
    pressed.current = pointer.current = following.current = null;
    if (last) follow?.end?.(last);
  };

  return (
    <DndContext
      sensors={sensors}
      autoScroll={false}
      accessibility={accessibility}
      onDragStart={start}
      onDragEnd={finish}
      onDragCancel={finish}
    >
      {children}
    </DndContext>
  );
}

/**
 * Something to drag, inside a `DragArea`: spread what it returns on the
 * element. The press is the innermost one's, so a handle inside something
 * draggable takes it for itself.
 */
export function useDrag(onPress: OnPress, { disabled = false } = {}) {
  const { setNodeRef, listeners } = useDraggable({
    id: useId(),
    // dnd-kit hands back the data as of the latest render, so the press sees
    // the props it was pressed with.
    data: { press: onPress } satisfies Data,
    disabled
  });
  const activate = listeners?.onPointerDown as
    | ((event: React.PointerEvent) => void)
    | undefined;

  return {
    ref: setNodeRef,
    onPointerDown:
      activate &&
      ((event: React.PointerEvent) => {
        activate(event);
        // Only once dnd-kit has claimed it (it declines anything but the
        // primary button), and only after: it ignores a press whose default
        // is already prevented. Prevented, the press keeps focus where it
        // was and selects nothing.
        if (!('dndKit' in event.nativeEvent)) return;
        event.preventDefault();
        event.stopPropagation();
      })
  };
}
