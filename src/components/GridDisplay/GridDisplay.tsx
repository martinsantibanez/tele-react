import { SourceNode } from '../../types/Monitor';
import { MonitorSource } from '../Monitor/MonitorSource';

type Props = {
  sources: SourceNode[];
  onEdit?: (idx: number) => void;
  onRemove?: (idx: number) => void;
  editingSourceIdx?: number;
  swapSourceIdx?: number;
};

export function GridDisplay({
  sources,
  onEdit,
  onRemove,
  editingSourceIdx,
  swapSourceIdx
}: Props) {
  return (
    <>
      {sources.map((source, idx) => (
        <MonitorSource
          idx={idx}
          sourceSlug={source.sourceSlug}
          muted={source.muted ?? true}
          key={`${source.uuid}`}
          onChangeClick={() => (onEdit ? onEdit(idx) : undefined)}
          onRemove={() => (onRemove ? onRemove(idx) : undefined)}
          isBeingEdited={idx === editingSourceIdx}
          isMarkedForSwap={idx === swapSourceIdx}
        />
      ))}
    </>
  );
}
