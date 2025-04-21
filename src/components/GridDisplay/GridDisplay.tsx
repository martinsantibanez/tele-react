import { SourceNode } from '../../_pages/monitor/types';
import { OnSwitchCb, Source } from '../Monitor/Source';

type Props = {
  size: number;
  sources: SourceNode[];
  onEdit?: (idx: number) => void;
  onRemove?: (idx: number) => void;
  editingSourceIdx?: number;
  onSwitch?: OnSwitchCb;
};

export function GridDisplay({
  size,
  sources,
  onEdit,
  onRemove,
  editingSourceIdx,
  onSwitch
}: Props) {
  return (
    <>
      {sources.map((source, idx) => (
        <Source
          idx={idx}
          sourceSlug={source.sourceSlug}
          muted={source.muted ?? true}
          key={`${source.uuid}`}
          onChangeClick={() => (onEdit ? onEdit(idx) : undefined)}
          onRemove={() => (onRemove ? onRemove(idx) : undefined)}
          isBeingEdited={idx === editingSourceIdx}
          onSwitch={onSwitch}
        />
      ))}
    </>
  );
}
