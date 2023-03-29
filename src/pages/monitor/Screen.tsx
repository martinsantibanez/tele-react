import { GridDisplay } from '../../components/GridDisplay/GridDisplay';
import { Layout } from '../../components/Layout/Layout';
import { DisplayMode, ScreenType } from './types';

type Props = {
  screen: ScreenType;
  onEdit?: (idx: number) => void;
  onRemove?: (idx: number) => void;
  editingSourceIdx?: number;
};

export function Screen({ screen, onEdit, onRemove, editingSourceIdx }: Props) {
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
        />
      )}
      {config.mode === DisplayMode.Layout && (
        <Layout
          layout={config.layout}
          sources={sources}
          onEdit={onEdit}
          editingSourceIdx={editingSourceIdx}
        />
      )}
    </div>
  );
}
