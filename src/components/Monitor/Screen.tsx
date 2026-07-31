'use client';
import { GridDisplay } from '../GridDisplay/GridDisplay';
import { Layout } from '../Layout/Layout';
import { useIsMobile } from '../../hooks/useViewport';
import { SourceType } from '../../sources';
import { ChannelReel } from './ChannelReel';
import { MonitorSource, OnSwitchCb } from './MonitorSource';
import { DisplayMode, ScreenType } from '../../types/Monitor';

type Props = {
  screen: ScreenType;
  /** Picking a screen by clicking it, the way its number key would. */
  onSelect?: (idx: number) => void;
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
  /**
   * Puts a channel on the screen being edited. Only the zapping reel asks for
   * it — every other mode is pointed at its channels from the picker — and
   * without it the reel is a picture of one channel rather than something to
   * zap with, which is what a shared or promoted screen should be.
   */
  onSourceChange?: (source: SourceType) => void;
};

export function Screen({
  screen,
  onSelect,
  onEdit,
  onRemove,
  editingSourceIdx,
  swapSourceIdx,
  fullscreenIdx,
  gridColumns,
  onSourceChange
}: Props) {
  const isMobile = useIsMobile();
  const { config, sources } = screen;
  if (config.mode === DisplayMode.Zapping) {
    // The screen keeps exactly one channel — whatever is on air — and the reel
    // decides what sits in it.
    const node = sources?.[0] ?? {};
    if (!onSourceChange)
      return (
        <MonitorSource
          idx={0}
          sourceSlug={node.sourceSlug}
          storedSource={node.source}
          activeSignal={node.activeSignal}
          muted={node.muted ?? true}
        />
      );
    return (
      <ChannelReel
        node={node}
        onSelectSource={onSourceChange}
        // A phone is held upright and scrolled with a thumb, so the band runs
        // down it. A desktop has width and no height to spare, so it runs
        // across instead.
        orientation={isMobile ? 'vertical' : 'horizontal'}
      />
    );
  }
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
          onSelect={onSelect}
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
          onSelect={onSelect}
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
        onSelect={onSelect}
        onEdit={onEdit}
        editingSourceIdx={editingSourceIdx}
        swapSourceIdx={swapSourceIdx}
        fullscreenIdx={fullscreenIdx}
        onRemove={onRemove}
      />
    );
  return null;
}
