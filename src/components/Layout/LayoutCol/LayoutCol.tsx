import { useTeleContext } from '../../../context/TeleContext';
import { useSavedGrid } from '../../../hooks/useSavedGrid';
import { ColType, LayoutType, RowType } from '../../../pages/monitor/types';
import { Monitor } from '../../Monitor/Monitor';
import { LayoutRow } from '../LayoutRow/LayoutRow';

type Props = {
  col: ColType;
};

export function LayoutCol({ col }: Props) {
  const { rows, node } = col;
  const size = col.size || 12;
  const { setEditingSourceIdx } = useTeleContext();
  const [savedNodes] = useSavedGrid();
  if (node) {
    const sourceSlug = savedNodes[node.idx]?.sourceSlug;
    return (
      <Monitor
        size={size}
        sourceSlug={sourceSlug}
        onChangeClick={() => {
          setEditingSourceIdx(node.idx);
        }}
      />
    );
  }

  return (
    <div className={`col-${size}`}>
      {rows?.map((row, i) => (
        <LayoutRow key={i} row={row} />
      ))}
    </div>
  );
}
