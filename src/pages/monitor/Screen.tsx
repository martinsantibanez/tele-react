import { GridDisplay } from '../../components/GridDisplay/GridDisplay';
import { Layout } from '../../components/Layout/Layout';
import { OnSwitchCb } from '../../components/Monitor/Source';
import { DisplayMode, ScreenType } from './types';

type Props = {
  screen: ScreenType;
  onEdit?: (idx: number) => void;
  onRemove?: (idx: number) => void;
  editingSourceIdx?: number;
  onSwitch?: OnSwitchCb;
};

export function Screen({
  screen,
  onEdit,
  onRemove,
  editingSourceIdx,
  onSwitch
}: Props) {
  const { config, sources } = screen;
  return (
    <div className="row g-0 row-canales mx-0">
      {config.mode === DisplayMode.Grid && (
        <GridDisplay
          size={config.grid?.size}
          sources={sources}
          onEdit={onEdit}
          onRemove={onRemove}
          editingSourceIdx={editingSourceIdx}
          onSwitch={onSwitch}
        />
      )}
      {config.mode === DisplayMode.Layout && (
        <Layout
          layout={config.layout}
          sources={sources}
          onEdit={onEdit}
          editingSourceIdx={editingSourceIdx}
          onSwitch={onSwitch}
          onRemove={onRemove}
        />
      )}
    </div>
  );
}
