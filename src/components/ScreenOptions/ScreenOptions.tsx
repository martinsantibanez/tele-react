import { CSSProperties } from 'react';
import { DisplayMode, GridSize } from '../../types/Monitor';
import { ActionButton } from '../ActionButton/ActionButton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Card, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';

const buttons: CSSProperties = {
  position: 'sticky',
  bottom: '2em',
  width: '100%',
  height: '20px',
  lineHeight: '20px',
  textAlign: 'center'
};

type Props = {
  onSizeChange: (size: GridSize) => void;
  onSourceAdd?: () => void;
  onPromote?: () => void;
  onModeChange?: (selectedMode: DisplayMode) => void;
  onShare?: () => void;
  mode: DisplayMode;
  size: GridSize;
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
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <Select
          value={mode}
          onValueChange={value =>
            onModeChange && onModeChange(value as DisplayMode)
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Layout">Layout</SelectItem>
            <SelectItem value="Grid">Grid</SelectItem>
          </SelectContent>
        </Select>

        {mode === DisplayMode.Grid && (
          <Select
            value={String(size)}
            onValueChange={value => onSizeChange(+value as GridSize)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 por fila</SelectItem>
              <SelectItem value="2">2 por fila</SelectItem>
              <SelectItem value="3">3 por fila</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4">
        {onSourceAdd && (
          <Button onClick={onSourceAdd} variant="outline">
            Agregar
          </Button>
        )}
        {onPromote && (
          <Button onClick={onPromote} variant="outline">
            Destacar
          </Button>
        )}

        {onShare && (
          <Button onClick={onShare} variant="outline">
            Compartir
          </Button>
        )}
      </div>
    </div>
  );
}
