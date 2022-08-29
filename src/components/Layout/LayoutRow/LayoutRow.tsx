import { RowType, SourceNode } from '../../../pages/layout/types';
import { LayoutCol } from '../LayoutCol/LayoutCol';

export function LayoutRow({
  row,
  onSourceChange
}: {
  row: RowType;
  onSourceChange: (node: SourceNode) => void;
}) {
  const { cols } = row;
  return (
    <div className="row no-gutters">
      {cols?.map((col, i) => (
        <LayoutCol col={col} key={i} onSourceChange={onSourceChange} />
      ))}
    </div>
  );
}
