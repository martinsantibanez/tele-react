import { useParkedScreens } from '../../hooks/useDecodeSlot';
import { useIsTv } from '../../hooks/useIsTv';
import { canBeOffAir } from '../../hooks/useOffAir';
import { SourceType } from '../../sources';
import { SourceNode } from '../../types/Monitor';
import { MonitorSource } from '../Monitor/MonitorSource';
import { focusWallRects } from '../Monitor/focusWall';
import { parkedWallRects, rectStyle } from '../Monitor/parkedWall';
import { WallClock } from '../Monitor/WallClock';

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
};

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
  onRemove
}: Props) {
  // With tiles parked the grid gives way: each tile is placed by hand instead,
  // inside the same wrapper, so no player is torn down by the switch.
  const parked = useParkedScreens();
  const isTv = useIsTv();
  const drawn = sources.flatMap((_, idx) => (hidden?.has(idx) ? [] : [idx]));
  // The focus wall places every tile by hand too, parked or not: a parked
  // preview is its logo, in its own cell.
  const focus =
    focusIdx === undefined ? undefined : focusWallRects(drawn, focusIdx);
  const rects = focus?.rects ?? parkedWallRects(drawn, parked);
  // Tiles glide to their new cells as another one is brought in. Not on a TV,
  // whose WebView would redraw every player on every frame of it.
  const glide =
    focus && !isTv
      ? 'transition-[left,top,width,height] duration-300 ease-out motion-reduce:transition-none'
      : '';
  return (
    <>
      {sources.map((node, idx) => {
        // Still rendered, as nothing: the tiles around it keep their place
        // in the DOM, and a player that moves there reloads.
        if (hidden?.has(idx))
          return <div key={`${node.uuid}`} className="hidden" />;
        const rect = rects?.get(idx);
        return (
          <div
            key={`${node.uuid}`}
            className={`min-h-0 min-w-0 ${glide}`}
            style={rect ? rectStyle(rect) : undefined}
          >
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
            />
          </div>
        );
      })}
      {/* An odd count leaves the focus wall a cell short of a tile. */}
      {focus?.spare.map((rect, n) => (
        <div key={`spare-${n}`} className={glide} style={rectStyle(rect)}>
          {n === 0 && <WallClock />}
        </div>
      ))}
    </>
  );
}
