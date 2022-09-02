import { ColType, SourceNode } from '../../../pages/monitor/types';
import { Monitor } from '../../Monitor/Monitor';
import { LayoutRow } from '../LayoutRow/LayoutRow';

type Props = {
  col: ColType;
  sources: SourceNode[];
  onEdit?: (idx: number) => void;
};

export function LayoutCol({ col, sources, onEdit }: Props) {
  const { rows, node } = col;
  const size = col.size || 12;

  if (node) {
    const sourceSlug = sources[node.idx]?.sourceSlug;
    if (!sourceSlug) return null;
    return (
      <Monitor
        size={size}
        sourceSlug={sourceSlug}
        onChangeClick={() => (onEdit ? onEdit(node.idx) : undefined)}
      />
    );
  }

  return (
    <div className={`col-${size}`}>
      {rows?.map((row, i) => (
        <LayoutRow key={i} row={row} onEdit={onEdit} sources={sources} />
      ))}
    </div>
  );
}
