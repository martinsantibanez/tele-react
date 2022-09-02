import { LayoutCol } from './LayoutCol/LayoutCol';
import { LayoutType, SourceNode } from '../../pages/monitor/types';

type Props = {
  layout: LayoutType;
  sources: SourceNode[];
  onEdit?: (idx: number) => void;
};

export function Layout({ layout, onEdit, sources }: Props) {
  return <LayoutCol col={layout} onEdit={onEdit} sources={sources} />;
}
