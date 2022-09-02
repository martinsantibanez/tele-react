import { GridDisplay } from '../../components/GridDisplay/GridDisplay';
import { Layout } from '../../components/Layout/Layout';
import { DisplayMode, ScreenType } from './types';

type Props = {
  screen: ScreenType;
  onEdit?: (idx: number) => void;
  onRemove?: (idx: number) => void;
};
export function Screen({ screen, onEdit, onRemove }: Props) {
  const { config, sources } = screen;
  return (
    <div className="row no-gutters row-canales">
      {config.mode === DisplayMode.Grid && (
        <GridDisplay
          size={config.grid?.size}
          sources={sources}
          onEdit={onEdit}
          onRemove={onRemove}
        />
      )}
      {config.mode === DisplayMode.Layout && (
        <Layout layout={config.layout} sources={sources} onEdit={onEdit} />
      )}
    </div>
  );
}
