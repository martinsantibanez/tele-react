'use client';
import { GridDisplay } from '../GridDisplay/GridDisplay';
import { Layout } from '../Layout/Layout';
import { OnSwitchCb } from './MonitorSource';
import { DisplayMode, ScreenType } from '../../types/Monitor';

type Props = {
  screen: ScreenType;
  onEdit?: (idx: number) => void;
  onRemove?: (idx: number) => void;
  editingSourceIdx?: number;
  swapSourceIdx?: number;
  onSwitch?: OnSwitchCb;
};

const gridSizeClass = {
  [1]: 'grid-cols-1',
  [2]: 'grid-cols-2',
  [3]: 'grid-cols-3',
  [4]: 'grid-cols-4'
};

export function Screen({
  screen,
  onEdit,
  onRemove,
  editingSourceIdx,
  swapSourceIdx
}: Props) {
  const { config, sources } = screen;
  if (config.mode === DisplayMode.Grid) {
    const rows = Math.ceil((sources?.length ?? 0) / config.grid.size) || 1;
    return (
      <div
        className={`grid h-full w-full ${gridSizeClass[config.grid.size]}`}
        style={{ gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))` }}
      >
        <GridDisplay
          sources={sources}
          onEdit={onEdit}
          onRemove={onRemove}
          editingSourceIdx={editingSourceIdx}
          swapSourceIdx={swapSourceIdx}
        />
      </div>
    );
  } else if (config.mode === DisplayMode.Layout)
    return (
      <Layout
        layout={config.layout}
        sources={sources}
        onEdit={onEdit}
        editingSourceIdx={editingSourceIdx}
        swapSourceIdx={swapSourceIdx}
        onRemove={onRemove}
      />
    );
  return null;
}
