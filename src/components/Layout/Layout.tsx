import { LayoutType, SourceNode } from '../../_pages/monitor/types';
import { OnSwitchCb, Source } from '../Monitor/Source';

type Props = {
  layout: LayoutType;
  sources: SourceNode[];
  onEdit?: (idx: number) => void;
  onRemove?: (idx: number) => void;
  editingSourceIdx?: number;
  onSwitch?: OnSwitchCb;
};

const colSizeClass = {
  1: 'col-span-1',
  2: 'col-span-2',
  3: 'col-span-3',
  4: 'col-span-4',
  5: 'col-span-5',
  6: 'col-span-6',
  7: 'col-span-7',
  8: 'col-span-8',
  9: 'col-span-9',
  10: 'col-span-10',
  11: 'col-span-11',
  12: 'col-span-12',
  13: 'col-span-13',
  14: 'col-span-14',
  15: 'col-span-15',
  16: 'col-span-16'
} as const;

export const rowSizeClass = {
  1: 'row-span-1',
  2: 'row-span-2',
  3: 'row-span-3',
  4: 'row-span-4',
  5: 'row-span-5',
  6: 'row-span-6',
  7: 'row-span-7',
  8: 'row-span-8',
  9: 'row-span-9'
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
    <div className="grid grid-cols-16 grid-rows-9">
      {layout.map((col, idx) => {
        const colClass = col.cols ? colSizeClass[col.cols] : undefined;
        const rowClass = col.rows ? rowSizeClass[col.rows] : undefined;
        // const rowClass = 'auto-rows-2'
        const source = sources[idx];
        if (!source) return null;
        return (
          <div className={`${colClass ?? ''} ${rowClass ?? ''}`} key={idx}>
            <Source
              idx={idx}
              sourceSlug={source.sourceSlug}
              onChangeClick={() => (onEdit ? onEdit(idx) : undefined)}
              isBeingEdited={idx === editingSourceIdx}
              muted={source.muted ?? true}
              onSwitch={onSwitch}
              onRemove={() => (onRemove ? onRemove(idx) : undefined)}
            />
          </div>
        );
      })}
    </div>
  );
}
