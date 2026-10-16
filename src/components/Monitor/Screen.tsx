'use client';
import { GridDisplay } from '../GridDisplay/GridDisplay';
import { Layout } from '../Layout/Layout';
import { useIsMobile } from '../../hooks/useViewport';
import { SourceType } from '../../sources';
import { ChannelReel } from './ChannelReel';
import { MonitorSource, OnSwitchCb } from './MonitorSource';
import { visibleSources } from './predefinedLayouts';
import { DisplayMode, ScreenType } from '../../types/Monitor';

type Props = {
  screen: ScreenType;
  /** Picking a screen by clicking it, the way its number key would. */
  onSelect?: (idx: number) => void;
  onEdit?: (idx: number) => void;
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
   * zap with.
   */
  onSourceChange?: (source: SourceType) => void;
  /**
   * Hands the fullscreened tile to the zapping reel, in Grid and Layout mode:
   * unlike `onSourceChange`, which puts the whole screen under the reel's
   * control, this is scoped to whichever one tile is currently fullscreened.
   */
  onFullscreenSourceChange?: (source: SourceType) => void;
};

export function Screen({
  screen,
  onSelect,
  onEdit,
  editingSourceIdx,
  swapSourceIdx,
  fullscreenIdx,
  gridColumns,
  onSourceChange,
  onFullscreenSourceChange
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
  if (
    config.mode === DisplayMode.Youtube ||
    config.mode === DisplayMode.ZappingTop
  ) {
    const count = sources?.length ?? 0;
    if (!count)
      return (
        <div className="flex h-full w-full items-center justify-center p-6 text-center text-gray-400">
          {config.mode === DisplayMode.Youtube
            ? 'Ningún canal de YouTube suscrito está en vivo'
            : 'Cargando lo más visto en Zapping…'}
        </div>
      );
    // Square-ish tiling that grows with the number of live channels: as many
    // columns as the ceil-sqrt, rows follow. Inline templates so any count
    // works (the grid-cols-* utilities only go up to 4).
    const cols = Math.ceil(Math.sqrt(count));
    const rows = Math.ceil(count / cols);
    return (
      <div
        className="relative grid h-full w-full"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`
        }}
      >
        <GridDisplay
          sources={sources}
          onSelect={onSelect}
          onEdit={onEdit}
          editingSourceIdx={editingSourceIdx}
          swapSourceIdx={swapSourceIdx}
          fullscreenIdx={fullscreenIdx}
          onFullscreenSourceChange={onFullscreenSourceChange}
        />
      </div>
    );
  }
  if (config.mode === DisplayMode.Grid) {
    const cols = gridColumns || config.grid.size;
    const shown = visibleSources(config, sources ?? []);
    const rows = Math.ceil(shown.length / cols) || 1;
    return (
      <div
        className="relative grid h-full w-full"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`
        }}
      >
        <GridDisplay
          sources={shown}
          onSelect={onSelect}
          onEdit={onEdit}
          editingSourceIdx={editingSourceIdx}
          swapSourceIdx={swapSourceIdx}
          fullscreenIdx={fullscreenIdx}
          onFullscreenSourceChange={onFullscreenSourceChange}
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
        onFullscreenSourceChange={onFullscreenSourceChange}
      />
    );
  return null;
}
