import { useParkedScreens } from '../../hooks/useDecodeSlot';
import { canBeOffAir } from '../../hooks/useOffAir';
import { SourceType } from '../../sources';
import { SourceNode } from '../../types/Monitor';
import { MonitorSource } from '../Monitor/MonitorSource';
import { parkedWallRects, rectStyle } from '../Monitor/parkedWall';

type Props = {
  sources: SourceNode[];
  /** Picking a screen by clicking it, the way its number key would. */
  onSelect?: (idx: number) => void;
  onEdit?: (idx: number) => void;
  editingSourceIdx?: number;
  swapSourceIdx?: number;
  fullscreenIdx?: number;
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
  onFullscreenSourceChange,
  hidden,
  isOffAir,
  onToggleLiveOnly,
  onRemove
}: Props) {
  // With tiles parked the grid gives way: each tile is placed by hand instead,
  // inside the same wrapper, so no player is torn down by the switch.
  const parked = useParkedScreens();
  const rects = parkedWallRects(
    sources.flatMap((_, idx) => (hidden?.has(idx) ? [] : [idx])),
    parked
  );
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
            className="min-h-0 min-w-0"
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
    </>
  );
}
