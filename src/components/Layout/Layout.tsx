import { LayoutCol } from './LayoutCol/LayoutCol';
import { LayoutType, SourceNode } from '../../pages/monitor/types';

type Props = {
  layout: LayoutType;
};

export function Layout({ layout }: Props) {
  return <LayoutCol col={layout} />;
}
