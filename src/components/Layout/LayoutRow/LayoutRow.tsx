import { RowType, SourceNode } from '../../../pages/monitor/types';
import { OnSwitchCb } from '../../Monitor/Source';
import { LayoutCol } from '../LayoutCol/LayoutCol';

type Props = {
  row: RowType;
  sources: SourceNode[];
  onEdit?: (idx: number) => void;
  editingSourceIdx?: number;
  onSwitch?: OnSwitchCb;
};

export function LayoutRow({
  row,
  onEdit,
  sources,
  editingSourceIdx,
  onSwitch
}: Props) {
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
          onSwitch={onSwitch}
        />
      ))}
    </div>
  );
}
