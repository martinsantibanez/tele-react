import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Button } from '../../../components/ui/button';
import { DisplayMode, GridSize } from '../../types/Monitor';

type Props = {
  onSizeChange: (size: GridSize) => void;
  /** Left out when the mode has no grid to add a screen to. */
  onSourceAdd?: () => void;
  onModeChange?: (selectedMode: DisplayMode) => void;
  mode: DisplayMode;
  size: GridSize;
};

/**
 * How the monitor is arranged: the display mode, and for a grid how many
 * screens go in a row. It stands at the left of the control bar, next to the
 * layouts it works with.
 */
export function ScreenOptions({
  onSizeChange,
  onSourceAdd,
  onModeChange,
  mode,
  size
}: Props) {
  return (
    <div className="flex w-[150px] flex-none flex-col gap-1">
      <Select
        value={mode}
        onValueChange={value => onModeChange?.(value as DisplayMode)}
      >
        <SelectTrigger className="h-8 w-full text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={DisplayMode.Layout}>Layout</SelectItem>
          <SelectItem value={DisplayMode.Grid}>Grid</SelectItem>
          {/* Normally reached by picking the live display in the YouTube
              category; listed so the mode always names what is on screen. */}
          <SelectItem value={DisplayMode.Youtube}>YouTube en vivo</SelectItem>
        </SelectContent>
      </Select>

      {mode === DisplayMode.Grid && (
        <Select
          value={String(size)}
          onValueChange={value => onSizeChange(+value as GridSize)}
        >
          <SelectTrigger className="h-8 w-full text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">1 por fila</SelectItem>
            <SelectItem value="2">2 por fila</SelectItem>
            <SelectItem value="3">3 por fila</SelectItem>
            {/* The Grid 4 layout sets this size, so the list has to reach it or
                the select comes up empty on it. */}
            <SelectItem value="4">4 por fila</SelectItem>
          </SelectContent>
        </Select>
      )}

      {onSourceAdd && (
        <Button onClick={onSourceAdd} variant="outline" className="h-8 text-xs">
          Agregar (N)
        </Button>
      )}
    </div>
  );
}
