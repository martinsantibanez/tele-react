import { LayoutType, RowType, SourceNode } from '../../../pages/monitor/types';
import { LayoutCol } from '../LayoutCol/LayoutCol';

type Props = {
  row: RowType;
};

export function LayoutRow({ row }: Props) {
  const { cols } = row;
  return (
    <div className="row no-gutters">
      {cols?.map((col, i) => (
        <LayoutCol col={col} key={i} />
      ))}
    </div>
  );
}
