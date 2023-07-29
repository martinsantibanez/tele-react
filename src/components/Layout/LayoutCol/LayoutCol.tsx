import { ColType, SourceNode } from '../../../pages/monitor/types';
import { OnSwitchCb, Source } from '../../Monitor/Source';
import { LayoutRow } from '../LayoutRow/LayoutRow';

type Props = {
  col: ColType;
  sources: SourceNode[];
  onEdit?: (idx: number) => void;
  editingSourceIdx?: number;
  onSwitch?: OnSwitchCb;
};

export function LayoutCol({
  col,
  sources,
  onEdit,
  editingSourceIdx,
  onSwitch
}: Props) {
  const { rows, node } = col;
  const size = col.size || 12;

  if (node) {
    const source = sources[node.idx];
    if (!source) return null;
    return (
      <Source
        idx={node.idx}
        size={size}
        sourceSlug={source.sourceSlug}
        onChangeClick={() => (onEdit ? onEdit(node.idx) : undefined)}
        isBeingEdited={node.idx === editingSourceIdx}
        muted={source.muted ?? true}
        onSwitch={onSwitch}
      />
    );
  }

  return (
    <div className={`col-${size}`}>
      {rows?.map((row, i) => (
        <LayoutRow
          key={i}
          row={row}
          onEdit={onEdit}
          sources={sources}
          editingSourceIdx={editingSourceIdx}
          onSwitch={onSwitch}
        />
      ))}
    </div>
  );
}
