import { LayoutCol } from './LayoutCol/LayoutCol';
import { LayoutType, SourceNode } from '../../pages/monitor/types';

type Props = {
  layout: LayoutType;
  sources: SourceNode[];
  onEdit?: (idx: number) => void;
  editingSourceIdx?: number;
};

export function Layout({ layout, onEdit, sources, editingSourceIdx }: Props) {
  return (
    <LayoutCol
      col={layout}
      onEdit={onEdit}
      sources={sources}
      editingSourceIdx={editingSourceIdx}
    />
  );
}
