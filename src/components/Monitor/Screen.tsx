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
  fullscreenIdx?: number;
  onSwitch?: OnSwitchCb;
  /**
   * How wide to lay the grid out, when that is not the screen's own setting: a
   * phone held sideways turns the grid on its side. The screen itself is left
   * as saved — this is only how it is being shown.
   */
  gridColumns?: number;
};

export function Screen({
  screen,
  onEdit,
  onRemove,
  editingSourceIdx,
  swapSourceIdx,
  fullscreenIdx,
  gridColumns
}: Props) {
  const { config, sources } = screen;
  if (config.mode === DisplayMode.Youtube) {
    const count = sources?.length ?? 0;
    if (!count)
      return (
        <div className="flex h-full w-full items-center justify-center p-6 text-center text-gray-400">
          Ningún canal de YouTube suscrito está en vivo
        </div>
      );
    // Square-ish tiling that grows with the number of live channels: as many
    // columns as the ceil-sqrt, rows follow. Inline templates so any count
    // works (the grid-cols-* utilities only go up to 4).
    const cols = Math.ceil(Math.sqrt(count));
    const rows = Math.ceil(count / cols);
    return (
      <div
        className="grid h-full w-full"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`
        }}
      >
        <GridDisplay
          sources={sources}
          onEdit={onEdit}
          onRemove={onRemove}
          editingSourceIdx={editingSourceIdx}
          swapSourceIdx={swapSourceIdx}
          fullscreenIdx={fullscreenIdx}
        />
      </div>
    );
  }
  if (config.mode === DisplayMode.Grid) {
    const cols = gridColumns || config.grid.size;
    const rows = Math.ceil((sources?.length ?? 0) / cols) || 1;
    return (
      <div
        className="grid h-full w-full"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`
        }}
      >
        <GridDisplay
          sources={sources}
          onEdit={onEdit}
          onRemove={onRemove}
          editingSourceIdx={editingSourceIdx}
          swapSourceIdx={swapSourceIdx}
          fullscreenIdx={fullscreenIdx}
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
        fullscreenIdx={fullscreenIdx}
        onRemove={onRemove}
      />
    );
  return null;
}
