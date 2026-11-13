import {
  closestCenter,
  CollisionDetection,
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import {
  rectSortingStrategy,
  SortableContext,
  useSortable
} from '@dnd-kit/sortable';
import { CSSProperties, ReactNode, useState } from 'react';
import { useParkedScreens } from '../../hooks/useDecodeSlot';
import { useIsTv } from '../../hooks/useIsTv';
import { canBeOffAir } from '../../hooks/useOffAir';
import { useResolveSource } from '../../hooks/useSourceCatalog';
import { SourceType } from '../../sources';
import { SourceNode } from '../../types/Monitor';
import { MonitorSource, TileHandle } from '../Monitor/MonitorSource';
import { focusWallRects } from '../Monitor/focusWall';
import { parkedWallRects, rectStyle } from '../Monitor/parkedWall';
import { WallClock } from '../Monitor/WallClock';
import { SourceImage } from '../SourceImage';

type Props = {
  sources: SourceNode[];
  /** Picking a screen by clicking it, the way its number key would. */
  onSelect?: (idx: number) => void;
  onEdit?: (idx: number) => void;
  editingSourceIdx?: number;
  swapSourceIdx?: number;
  fullscreenIdx?: number;
  /**
   * The tile enlarged on the focus wall, with the others small around it.
   * Unset, the tiles keep the grid.
   */
  focusIdx?: number;
  /** Lets a tile be zapped with once fullscreened — see `MonitorSource`. */
  onFullscreenSourceChange?: (source: SourceType) => void;
  /** Tiles kept in place, number and all, but not drawn: see `Screen`. */
  hidden?: Set<number>;
  isOffAir?: (node: SourceNode) => boolean;
  onToggleLiveOnly?: (idx: number) => void;
  onRemove?: (idx: number) => void;
  /**
   * Moves the tile at `from` to where the one at `to` is, the ones between
   * making room. Set, a tile is dragged there by its badge.
   */
  onMove?: (from: number, to: number) => void;
  /** Whether the tile at `from` may go to `to`. Unset, it may go anywhere. */
  canMove?: (from: number, to: number) => boolean;
};

type TileData = { idx: number };

// Picked up by the pointer alone: the remote and the keyboard have their own
// swap, and dnd-kit's keys would take the arrows and Space from them. Nor is
// anything said aloud on the way.
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
 * A tile on the wall, as something to reorder. Pressing its badge and moving
 * a few pixels picks it up; a press that stays put is still a click.
 */
function SortableTile({
  id,
  idx,
  movable,
  className,
  style,
  children
}: {
  id: string;
  idx: number;
  movable: boolean;
  className: string;
  style?: CSSProperties;
  children: (handle?: TileHandle) => ReactNode;
}) {
  const {
    setNodeRef,
    setActivatorNodeRef,
    listeners,
    transform,
    transition,
    isDragging
  } = useSortable({
    id,
    data: { idx } satisfies TileData,
    disabled: !movable
  });
  return (
    <div
      ref={setNodeRef}
      className={`${className} ${isDragging ? 'relative z-20 opacity-90 shadow-2xl ring-2 ring-white' : ''}`}
      style={{
        ...style,
        transform: transform
          ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
          : undefined,
        transition
      }}
    >
      {children(
        movable
          ? { ref: setActivatorNodeRef, listeners, dragging: isDragging }
          : undefined
      )}
    </div>
  );
}

export function GridDisplay({
  sources,
  onSelect,
  onEdit,
  editingSourceIdx,
  swapSourceIdx,
  fullscreenIdx,
  focusIdx,
  onFullscreenSourceChange,
  hidden,
  isOffAir,
  onToggleLiveOnly,
  onRemove,
  onMove,
  canMove
}: Props) {
  // With tiles parked the grid gives way: each tile is placed by hand instead,
  // inside the same wrapper, so no player is torn down by the switch.
  const parked = useParkedScreens();
  const isTv = useIsTv();
  const resolveSource = useResolveSource();
  const drawn = sources.flatMap((_, idx) => (hidden?.has(idx) ? [] : [idx]));
  // The focus wall places every tile by hand too, parked or not: a parked
  // preview is its logo, in its own cell.
  const focus =
    focusIdx === undefined ? undefined : focusWallRects(drawn, focusIdx);
  const rects = focus?.rects ?? parkedWallRects(drawn, parked);
  const focusNode = focusIdx === undefined ? undefined : sources[focusIdx];
  const focusSource = resolveSource(focusNode?.sourceSlug, focusNode?.source);
  // Tiles glide to their new cells as another one is brought in. Not on a TV,
  // whose WebView would redraw every player on every frame of it.
  const glide =
    focus && !isTv
      ? 'transition-[left,top,width,height] duration-300 ease-out motion-reduce:transition-none'
      : '';

  // The pointer picks a tile up once it has moved a few pixels, so the badge
  // still selects with a plain click.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );
  const [dragging, setDragging] = useState(false);
  const idOf = (idx: number) => sources[idx]?.uuid ?? `slot-${idx}`;
  const idxOf = (data?: unknown) => (data as TileData | undefined)?.idx;
  // Only the tiles it may go to are anywhere to drop it: the others neither
  // make room for it nor take it.
  const collisions: CollisionDetection = args => {
    const from = idxOf(args.active.data.current);
    return closestCenter({
      ...args,
      droppableContainers: args.droppableContainers.filter(container => {
        const to = idxOf(container.data.current);
        return (
          from === undefined ||
          to === undefined ||
          !canMove ||
          canMove(from, to)
        );
      })
    });
  };
  const drop = ({ active, over }: DragEndEvent) => {
    setDragging(false);
    const from = idxOf(active.data.current);
    const to = idxOf(over?.data.current);
    if (from === undefined || to === undefined || from === to) return;
    if (canMove && !canMove(from, to)) return;
    onMove?.(from, to);
  };

  // A player whose element moves in the DOM starts over: an iframe reloads,
  // a video pauses. So the tiles are laid down in an order of their own that
  // nothing on the wall changes, and CSS `order` puts each in its place: a
  // tile moved, swapped or ranked elsewhere keeps playing on the way there.
  const laidDown = sources
    .map((_, idx) => idx)
    .sort((a, b) => {
      const [left, right] = [idOf(a), idOf(b)];
      return left < right ? -1 : left > right ? 1 : 0;
    });

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisions}
      autoScroll={false}
      accessibility={accessibility}
      onDragStart={() => setDragging(true)}
      onDragEnd={drop}
      onDragCancel={() => setDragging(false)}
    >
      {/* Always there, if only to be disabled: the tiles are its children, and
          wrapping them only while editing would remount every player. */}
      <SortableContext
        items={drawn.map(idOf)}
        strategy={rectSortingStrategy}
        disabled={!onMove}
      >
        {laidDown.map(idx => {
          const node = sources[idx];
          // Still rendered, as nothing: the tiles around it keep their place
          // in the DOM, and a player that moves there reloads.
          if (hidden?.has(idx))
            return <div key={idOf(idx)} className="hidden" />;
          const rect = rects?.get(idx);
          const position = drawn.indexOf(idx);
          return (
            <SortableTile
              key={idOf(idx)}
              id={idOf(idx)}
              idx={idx}
              movable={!!onMove}
              // The pointer goes over other tiles on its way, and an iframe
              // would keep the moves to itself.
              className={`min-h-0 min-w-0 ${glide} ${dragging ? '[&_iframe]:pointer-events-none' : ''}`}
              style={{ ...(rect ? rectStyle(rect) : {}), order: idx }}
            >
              {handle => (
                <MonitorSource
                  idx={idx}
                  sourceSlug={node.sourceSlug}
                  storedSource={node.source}
                  activeSignal={node.activeSignal}
                  onSelect={() => onSelect?.(idx)}
                  onChangeClick={() => (onEdit ? onEdit(idx) : undefined)}
                  isBeingEdited={idx === editingSourceIdx}
                  isMarkedForSwap={idx === swapSourceIdx}
                  fullscreen={idx === fullscreenIdx}
                  covered={fullscreenIdx !== undefined && idx !== fullscreenIdx}
                  onZapChange={onFullscreenSourceChange}
                  offAir={isOffAir?.(node)}
                  liveOnly={!!node.liveOnly}
                  // Offered on a channel that can go off air, and on any tile
                  // already set, so it can always be set back.
                  onToggleLiveOnly={
                    onToggleLiveOnly &&
                    (node.liveOnly || canBeOffAir(node.sourceSlug))
                      ? () => onToggleLiveOnly(idx)
                      : undefined
                  }
                  onRemove={onRemove ? () => onRemove(idx) : undefined}
                  // Every tile on the wall but the one in the middle of it, which
                  // has its own cell naming it, and the one gone fullscreen.
                  position={position}
                  number={
                    idx === focusIdx || idx === fullscreenIdx
                      ? undefined
                      : position + 1
                  }
                  handle={handle}
                />
              )}
            </SortableTile>
          );
        })}
      </SortableContext>
      {/* The enlarged tile's own cell, kept for it: it names what went there,
          and the previews around it stay where they are. */}
      {focus && (
        <div key="focus-home" className={glide} style={rectStyle(focus.home)}>
          <div className="flex h-full w-full flex-col items-center justify-center gap-1 border border-dashed border-white/20 bg-neutral-900 p-2 text-center">
            {!!focusSource && (
              <SourceImage
                src={focusSource.logoUrl ?? focusSource.imageUrl}
                className="max-h-[45%] max-w-[60%] object-contain opacity-60"
                fallback={focusSource.titleIcons}
              />
            )}
            {!!focusSource?.name && (
              <span className="max-w-full truncate text-xs text-white/60">
                {focusSource.name}
              </span>
            )}
          </div>
        </div>
      )}
      {/* An even count leaves the focus wall a cell to spare. */}
      {focus?.spare.map((rect, n) => (
        <div key={`spare-${n}`} className={glide} style={rectStyle(rect)}>
          {n === 0 && <WallClock />}
        </div>
      ))}
    </DndContext>
  );
}
