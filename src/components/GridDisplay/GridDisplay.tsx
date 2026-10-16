import { useParkedScreens } from '../../hooks/useDecodeSlot';
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
};

export function GridDisplay({
  sources,
  onSelect,
  onEdit,
  editingSourceIdx,
  swapSourceIdx,
  fullscreenIdx,
  onFullscreenSourceChange
}: Props) {
  // With tiles parked the grid gives way: each tile is placed by hand instead,
  // inside the same wrapper, so no player is torn down by the switch.
  const parked = useParkedScreens();
  const rects = parkedWallRects(
    sources.map((_, idx) => idx),
    parked
  );
  return (
    <>
      {sources.map((node, idx) => {
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
            />
          </div>
        );
      })}
    </>
  );
}
