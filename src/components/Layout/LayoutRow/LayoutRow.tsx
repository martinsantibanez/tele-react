import { RowType, SourceNode } from '../../../pages/monitor/types';
import { LayoutCol } from '../LayoutCol/LayoutCol';

type Props = {
  row: RowType;
  sources: SourceNode[];
  onEdit?: (idx: number) => void;
  editingSourceIdx?: number;
};

export function LayoutRow({ row, onEdit, sources, editingSourceIdx }: Props) {
  const { cols } = row;
  return (
    <div className="row g-0 mx-0">
      {cols?.map((col, i) => (
        <LayoutCol
          col={col}
          key={i}
          onEdit={onEdit}
          sources={sources}
          editingSourceIdx={editingSourceIdx}
        />
      ))}
    </div>
  );
}
