import { RowType, SourceNode } from '../../../pages/monitor/types';
import { LayoutCol } from '../LayoutCol/LayoutCol';

type Props = {
  row: RowType;
  sources: SourceNode[];
  onEdit?: (idx: number) => void;
};

export function LayoutRow({ row, onEdit, sources }: Props) {
  const { cols } = row;
  return (
    <div className="row no-gutters">
      {cols?.map((col, i) => (
        <LayoutCol col={col} key={i} onEdit={onEdit} sources={sources} />
      ))}
    </div>
  );
}
