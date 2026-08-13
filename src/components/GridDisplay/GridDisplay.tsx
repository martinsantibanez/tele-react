import { SourceType } from '../../sources';
import { SourceNode } from '../../types/Monitor';
import { MonitorSource } from '../Monitor/MonitorSource';

type Props = {
  sources: SourceNode[];
  /** Picking a screen by clicking it, the way its number key would. */
  onSelect?: (idx: number) => void;
  onEdit?: (idx: number) => void;
  onRemove?: (idx: number) => void;
  editingSourceIdx?: number;
  swapSourceIdx?: number;
  fullscreenIdx?: number;
  /** Hands the fullscreened tile to the zapping reel — see `MonitorSource`. */
  onFullscreenSourceChange?: (source: SourceType) => void;
};

export function GridDisplay({
  sources,
  onSelect,
  onEdit,
  onRemove,
  editingSourceIdx,
  swapSourceIdx,
  fullscreenIdx,
  onFullscreenSourceChange
}: Props) {
  return (
    <>
      {sources.map((node, idx) => (
        <MonitorSource
          idx={idx}
          sourceSlug={node.sourceSlug}
          storedSource={node.source}
          activeSignal={node.activeSignal}
          key={`${node.uuid}`}
          onSelect={() => onSelect?.(idx)}
          onChangeClick={() => (onEdit ? onEdit(idx) : undefined)}
          onRemove={() => (onRemove ? onRemove(idx) : undefined)}
          isBeingEdited={idx === editingSourceIdx}
          isMarkedForSwap={idx === swapSourceIdx}
          fullscreen={idx === fullscreenIdx}
          onZapChange={idx === fullscreenIdx ? onFullscreenSourceChange : undefined}
        />
      ))}
    </>
  );
}
