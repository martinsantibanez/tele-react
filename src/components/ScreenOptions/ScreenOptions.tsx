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
  onModeChange?: (selectedMode: DisplayMode) => void;
  mode: DisplayMode;
  size: number;
};
export function ScreenOptions({
  onSizeChange,
  onSourceAdd,
  onModeChange,
  mode,
  size
}: Props) {
  const launchFullScreen = () => {
    const element: any = document.documentElement;
    if (element.requestFullScreen) {
      element.requestFullScreen();
    } else if (element.mozRequestFullScreen) {
      element.mozRequestFullScreen();
    } else if (element.webkitRequestFullScreen) {
      element.webkitRequestFullScreen();
    }

    if (element.requestFullScreen) {
      element.requestFullScreen();
    }
  };
  // Lanza en pantalla completa en navegadores que lo soporten
  const cancelFullScreen = () => {
    if ((document as any).cancelFullScreen) {
      (document as any).cancelFullScreen();
    } else if ((document as any).mozCancelFullScreen) {
      (document as any).mozCancelFullScreen();
    } else if ((document as any).webkitCancelFullScreen) {
      (document as any).webkitCancelFullScreen();
    }
  };
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
    </div>
  );
}
