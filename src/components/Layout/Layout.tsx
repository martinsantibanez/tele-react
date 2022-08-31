import { LayoutCol } from './LayoutCol/LayoutCol';
import { LayoutType, SourceNode } from '../../pages/layout/types';

type Props = {
  layout: LayoutType;
  onSourceChange: (node: SourceNode) => void;
};

export function Layout({ layout, onSourceChange }: Props) {
  return <LayoutCol col={layout} onSourceChange={onSourceChange} />;
}
