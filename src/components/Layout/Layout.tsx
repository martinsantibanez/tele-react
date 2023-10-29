import { LayoutCol } from './LayoutCol/LayoutCol';
import { LayoutType, SourceNode } from '../../pages/monitor/types';
import { OnSwitchCb } from '../Monitor/Source';

type Props = {
  layout: LayoutType;
  sources: SourceNode[];
  onEdit?: (idx: number) => void;
  onRemove?: (idx: number) => void;
  editingSourceIdx?: number;
  onSwitch?: OnSwitchCb;
};

export function Layout({
  layout,
  onEdit,
  onRemove,
  sources,
  editingSourceIdx,
  onSwitch
}: Props) {
  return (
    <LayoutCol
      col={layout}
      onEdit={onEdit}
      onRemove={onRemove}
      sources={sources}
      editingSourceIdx={editingSourceIdx}
      onSwitch={onSwitch}
    />
  );
}
