import { SourceNode } from '../../pages/monitor/types';
import { Monitor } from '../Monitor/Monitor';

type Props = {
  size: number;
  sources: SourceNode[];
  onEdit?: (idx: number) => void;
  onRemove?: (idx: number) => void;
};
export function GridDisplay({ size, sources, onEdit, onRemove }: Props) {
  return (
    <>
      {sources.map((source, idx) => (
        <Monitor
          size={size}
          sourceSlug={source.sourceSlug}
          key={`${source.uuid}`}
          onChangeClick={() => (onEdit ? onEdit(idx) : undefined)}
          onRemove={() => (onRemove ? onRemove(idx) : undefined)}
        />
      ))}
    </>
  );
}
