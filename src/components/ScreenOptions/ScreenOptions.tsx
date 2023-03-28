import { CSSProperties } from 'react';
import { DisplayMode } from '../../pages/monitor/types';
import { ActionButton } from '../ActionButton/ActionButton';

const buttons: CSSProperties = {
  position: 'sticky',
  bottom: '2em',
  width: '100%',
  height: '20px',
  lineHeight: '20px',
  textAlign: 'center'
};

type Props = {
  onSizeChange: (size: number) => void;
  onSourceAdd?: () => void;
  onPromote?: () => void;
  onModeChange?: (selectedMode: DisplayMode) => void;
  onShare?: () => void;
  mode: DisplayMode;
  size: number;
};
export function ScreenOptions({
  onSizeChange,
  onSourceAdd,
  onModeChange,
  onPromote,
  onShare,
  mode,
  size
}: Props) {
  return (
    <div className="Botones" style={buttons}>
      {mode === DisplayMode.Grid && (
        <div className="SeleccionarStreamsPorFila waves-effect waves-light">
          <select
            title="Streams por fila"
            className="StreamsPorFila"
            onChange={event => onSizeChange(+event.target.value)}
            value={size + ''}
          >
            <option value="12">1 por fila</option>
            <option value="6">2 por fila</option>
            <option value="4">3 por fila</option>
          </select>
        </div>
      )}

      <div className="SeleccionarStreamsPorFila waves-effect waves-light">
        <select
          title="Modo"
          className="StreamsPorFila"
          onChange={event =>
            onModeChange && onModeChange(event.target.value as DisplayMode)
          }
          value={mode}
        >
          <option value="Layout">Layout</option>
          <option value="Grid">Grid</option>
        </select>
      </div>

      {onSourceAdd && (
        <ActionButton onClick={onSourceAdd}>Agregar</ActionButton>
      )}
      {onPromote && <ActionButton onClick={onPromote}>Destacar</ActionButton>}

      {onShare && <ActionButton onClick={onShare}>Compartir</ActionButton>}
    </div>
  );
}
