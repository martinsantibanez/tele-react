import { SourceNode } from '../../types/Monitor';
import { MonitorSource } from '../Monitor/MonitorSource';

type Props = {
  sources: SourceNode[];
  onEdit?: (idx: number) => void;
  onRemove?: (idx: number) => void;
  editingSourceIdx?: number;
  swapSourceIdx?: number;
  fullscreenIdx?: number;
};

export function GridDisplay({
  sources,
  onEdit,
  onRemove,
  editingSourceIdx,
  swapSourceIdx,
  fullscreenIdx
}: Props) {
  return (
    <>
      {sources.map((node, idx) => (
        <MonitorSource
          idx={idx}
          sourceSlug={node.sourceSlug}
          storedSource={node.source}
          activeSignal={node.activeSignal}
          muted={node.muted ?? true}
          key={`${node.uuid}`}
          onChangeClick={() => (onEdit ? onEdit(idx) : undefined)}
          onRemove={() => (onRemove ? onRemove(idx) : undefined)}
          isBeingEdited={idx === editingSourceIdx}
          isMarkedForSwap={idx === swapSourceIdx}
          fullscreen={idx === fullscreenIdx}
        />
      ))}
    </>
  );
}
