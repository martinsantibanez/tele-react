import { Monitor } from '../../Monitor/Monitor';
import { useTeleContext } from '../../../context/TeleContext';
import { ColType, SourceNode } from '../../../pages/layout/types';
import { LayoutRow } from '../LayoutRow/LayoutRow';

export function LayoutCol({
  col,
  onSourceChange
}: {
  col: ColType;
  onSourceChange: (node: SourceNode) => void;
}) {
  const { rows, node } = col;
  const size = col.size || 12;
  const { setEditingSourceUuid } = useTeleContext();

  if (node?.sourceSlug) {
    return (
      <Monitor
        size={size}
        sourceSlug={node?.sourceSlug}
        onChangeClick={() => setEditingSourceUuid(node.uuid)}
      />
    );
  }

  return (
    <div className={`col-${size}`}>
      {rows?.map((row, i) => (
        <LayoutRow key={i} row={row} onSourceChange={onSourceChange} />
      ))}
    </div>
  );
}
