import { LayoutCol } from '../../components/Layout/LayoutCol/LayoutCol';
import { LayoutType, SourceNode } from './types';

type Props = {
  layout: LayoutType;
  onSourceChange: (node: SourceNode) => void;
};

export function Layout({ layout, onSourceChange }: Props) {
  return <LayoutCol col={layout} onSourceChange={onSourceChange} />;
}
