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
  onSwitch?: OnSwitchCb;
};

const gridSizeClass = {
  [1]: 'grid-cols-1',
  [2]: 'grid-cols-2',
  [3]: 'grid-cols-3',
  [4]: 'grid-cols-4',
};

export function Screen({
  screen,
  onEdit,
  onRemove,
  editingSourceIdx,
  onSwitch
}: Props) {
  const { config, sources } = screen;
  if (config.mode === DisplayMode.Grid)
    return (
      <div className={`grid ${gridSizeClass[config.grid.size]}`}>
        <GridDisplay
          size={config.grid?.size}
          sources={sources}
          onEdit={onEdit}
          onRemove={onRemove}
          editingSourceIdx={editingSourceIdx}
          onSwitch={onSwitch}
        />
      </div>
    );
  else if (config.mode === DisplayMode.Layout)
    return (
      <Layout
        layout={config.layout}
        sources={sources}
        onEdit={onEdit}
        editingSourceIdx={editingSourceIdx}
        onSwitch={onSwitch}
        onRemove={onRemove}
      />
    );
  return null;
}
