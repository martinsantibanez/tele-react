'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useTeleContext } from '../../context/TeleContext';
import { useCustomSources } from '../../hooks/useCustomSources';
import {
  DEFAULT_GRID_SIZE,
  useDisplayConfig
} from '../../hooks/useDisplayConfig';
import { useSavedGrid } from '../../hooks/useSavedGrid';
import { useYoutubeGridSources } from '../../hooks/useYoutubeLiveSubs';
import { SourceType } from '../../sources';
import {
  DisplayMode,
  GridSize,
  ScreenType,
  SourceNode
} from '../../types/Monitor';
import {
  Direction,
  directionFromKeyEvent,
  findNeighbourIdx
} from '../../utils/spatialNavigation';
import { uuid } from '../../utils/uuid';
import { SourceSlider } from '../SelectSource/SourceSlider';
import { ControlBar } from './ControlBar';
import { OnSwitchCb } from './MonitorSource';
import { Screen } from './Screen';

const Shortcut = ({ keys, label }: { keys: string; label: string }) => (
  <div className="leading-tight">
    <span className="font-bold">{keys}</span> {label}
  </div>
);

export const Monitor = () => {
  const {
    toggleEditting,
    isEditing,
    editingSourceIdx,
    setEditingSourceIdx,
    swapSourceIdx,
    setSwapSourceIdx,
    isPromptOpen
  } = useTeleContext();
  const [selectedSources, setSelectedSources] = useSavedGrid();
  const [displayConfig, setDisplayConfig] = useDisplayConfig();
  const { customSources } = useCustomSources();
  const [isFullscreen, setIsFullscreen] = useState(false);
  // Scopes the arrows to this monitor's tiles; the saved-screen thumbnails
  // elsewhere on the page are not screens to navigate to.
  const screenRef = useRef<HTMLDivElement>(null);

  const isYoutubeMode = displayConfig.mode === DisplayMode.Youtube;
  const { nodes: youtubeNodes } = useYoutubeGridSources();
  // Which YouTube tile currently keeps its audio (all muted by default).
  const [youtubeSoloIdx, setYoutubeSoloIdx] = useState<number | undefined>();

  // In the dynamic YouTube layout the tiles are the live channels, not the
  // saved grid, and audio-solo is tracked locally instead of per saved node.
  const youtubeSources = useMemo<SourceNode[]>(
    () =>
      youtubeNodes.map((node, idx) => ({
        ...node,
        muted: idx !== youtubeSoloIdx
      })),
    [youtubeNodes, youtubeSoloIdx]
  );

  const activeSources = isYoutubeMode ? youtubeSources : selectedSources;

  const screen: ScreenType = useMemo(
    () => ({
      config: displayConfig,
      sources: activeSources,
      customSources
    }),
    [displayConfig, activeSources, customSources]
  );

  const fullscreenIdx = isFullscreen ? editingSourceIdx : undefined;

  const selectedSourceSlug = useMemo(
    () => selectedSources[editingSourceIdx]?.sourceSlug,
    [editingSourceIdx, selectedSources]
  );

  // The signal lives on the grid node, so it is the screen being edited that
  // says which one the picker is showing.
  const selectedSignal = useMemo(
    () => selectedSources[editingSourceIdx]?.activeSignal,
    [editingSourceIdx, selectedSources]
  );

  const visibleScreenCount = isYoutubeMode
    ? youtubeSources.length
    : displayConfig.mode === DisplayMode.Layout
      ? displayConfig.layout.length
      : (selectedSources?.length ?? 0);

  // A screen is always selected (the first one to begin with), so when the
  // tile it pointed at is gone — removed, layout change, fewer live channels —
  // the selection walks back to the last one that still exists.
  useEffect(() => {
    if (!visibleScreenCount) return;
    setEditingSourceIdx(current => Math.min(current, visibleScreenCount - 1));
  }, [visibleScreenCount, setEditingSourceIdx]);

  const handleModeChange = (mode: DisplayMode) => {
    if (mode === DisplayMode.Grid) {
      setDisplayConfig(cfg => ({
        ...cfg,
        mode,
        grid: { size: cfg.grid?.size || DEFAULT_GRID_SIZE }
      }));
    } else {
      setDisplayConfig(cfg => ({
        ...cfg,
        mode
      }));
    }
  };
  const handleSizeChange = (newSize: GridSize) => {
    if (displayConfig.mode !== DisplayMode.Grid) return;
    setDisplayConfig(config => ({
      ...config,
      grid: { size: newSize }
    }));
  };

  const handleSourceAdd = () => {
    setSelectedSources(sources => [
      ...(sources || []),
      {
        sourceSlug: 'Barras',
        uuid: uuid()
      }
    ]);
  };

  // The grid always keeps one screen, so there is something to select.
  const canRemoveScreen = (selectedSources?.length ?? 0) > 1;

  const handleSourceRemove = (idx: number) => {
    if (!canRemoveScreen) return;
    setSwapSourceIdx(undefined);
    setIsFullscreen(false);
    setSelectedSources(sources => {
      if (!sources) return sources;
      return sources.filter((src, index) => index !== idx);
    });
  };

  const handleSourceChange = (source: SourceType) => {
    setSelectedSources(sources => {
      if (!sources) return sources;
      if (sources.length < editingSourceIdx + 1) {
        for (let i = sources.length; i <= editingSourceIdx; i++) {
          sources[i] = { uuid: uuid() };
        }
      }
      return sources.map((src, idx) => {
        // A signal key only means something for the source it came from, so a
        // new channel starts on its own default.
        if (editingSourceIdx === idx)
          return { ...src, sourceSlug: source.slug, activeSignal: undefined };
        else return src;
      });
    });
  };

  const handleSignalChange = (activeSignal: string) => {
    setSelectedSources(sources => {
      if (!sources) return sources;
      return sources.map((src, idx) =>
        editingSourceIdx === idx ? { ...src, activeSignal } : src
      );
    });
  };

  const handleToggleMute = (idx: number) => {
    setSelectedSources(sources => {
      if (!sources) return sources;
      return sources.map((src, index) =>
        index === idx ? { ...src, muted: !(src.muted ?? true) } : src
      );
    });
  };

  // Solo: only the given screen keeps its audio, everything else is muted.
  const handleSoloAudio = (idx: number) => {
    setSelectedSources(sources => {
      if (!sources) return sources;
      return sources.map((src, index) => ({ ...src, muted: index !== idx }));
    });
  };

  const handleSourceEdit = (newIdx: number) => setEditingSourceIdx(newIdx);

  const handleSwitch: OnSwitchCb = (left: number, right: number) => {
    setSelectedSources(sources => {
      if (!sources) return sources;
      const newSources = [...sources];
      newSources[left] = { ...sources[right], muted: sources[left].muted };
      newSources[right] = { ...sources[left], muted: sources[right].muted };
      return newSources;
    });
  };

  // Keyboard shortcuts listen on `document`, but embedded players (YouTube,
  // Twitch...) live inside <iframe>s that swallow keystrokes once they grab
  // focus — on click, and especially when a source fills the screen. Bounce
  // focus back to the page so the shortcuts keep working.
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    // The window `blur` fires *while* the browser is still handing focus to
    // the iframe, so blurring from inside the handler is undone as soon as it
    // returns. Waiting a tick lets the transfer finish before we take it back.
    const refocus = () => {
      timer = setTimeout(() => {
        const active = document.activeElement;
        if (active instanceof HTMLIFrameElement) active.blur();
      }, 0);
    };
    window.addEventListener('blur', refocus);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('blur', refocus);
    };
  }, []);

  // The arrows walk the monitor by geometry, so the screen next to the one
  // selected is the one the eye says is next to it, whatever the arrangement.
  const moveSelection = (direction: Direction) => {
    const nextIdx = findNeighbourIdx(
      screenRef.current,
      editingSourceIdx,
      direction
    );
    if (nextIdx === undefined || nextIdx >= visibleScreenCount) return;
    setEditingSourceIdx(nextIdx);
    // The YouTube grid is auto-managed: landing on a tile solos its audio (and
    // lets G fullscreen it); there is no per-tile source editing.
    if (isYoutubeMode) {
      setYoutubeSoloIdx(nextIdx);
      return;
    }
    if (swapSourceIdx === undefined) handleSoloAudio(nextIdx);
  };

  useHotkeys('e', () => (isPromptOpen ? undefined : toggleEditting()), [
    isPromptOpen
  ]);
  useHotkeys(
    'up,down,left,right',
    event => {
      if (isPromptOpen) return;
      const direction = directionFromKeyEvent(event);
      if (direction) moveSelection(direction);
    },
    { preventDefault: true },
    [
      editingSourceIdx,
      visibleScreenCount,
      swapSourceIdx,
      isYoutubeMode,
      isPromptOpen
    ]
  );
  useHotkeys(
    'enter',
    () => {
      if (isYoutubeMode || isPromptOpen) return;
      if (swapSourceIdx === undefined) {
        setSwapSourceIdx(editingSourceIdx);
        return;
      }
      if (swapSourceIdx !== editingSourceIdx) {
        handleSwitch(swapSourceIdx, editingSourceIdx);
        setEditingSourceIdx(swapSourceIdx);
      }
      setSwapSourceIdx(undefined);
    },
    [editingSourceIdx, swapSourceIdx, isYoutubeMode, isPromptOpen]
  );
  useHotkeys(
    'g',
    () => (isPromptOpen ? undefined : setIsFullscreen(current => !current)),
    [isPromptOpen]
  );
  useHotkeys(
    'escape',
    () => {
      if (isPromptOpen) return;
      if (isFullscreen) {
        setIsFullscreen(false);
        return;
      }
      setSwapSourceIdx(undefined);
    },
    [isFullscreen, isPromptOpen]
  );
  useHotkeys(
    'm',
    () => {
      if (swapSourceIdx !== undefined || isPromptOpen) return;
      if (isYoutubeMode) {
        setYoutubeSoloIdx(current =>
          current === editingSourceIdx ? undefined : editingSourceIdx
        );
        return;
      }
      handleToggleMute(editingSourceIdx);
    },
    [editingSourceIdx, swapSourceIdx, isYoutubeMode, isPromptOpen]
  );
  // A and D walk the layouts under the monitor, so removing and adding a screen
  // moved off the letters onto the keys that already mean it.
  useHotkeys(
    'delete,backspace',
    () => {
      if (isYoutubeMode || swapSourceIdx !== undefined || isPromptOpen) return;
      handleSourceRemove(editingSourceIdx);
    },
    { preventDefault: true },
    [
      editingSourceIdx,
      swapSourceIdx,
      canRemoveScreen,
      isYoutubeMode,
      isPromptOpen
    ]
  );
  useHotkeys(
    'n',
    () => {
      // While a deletion is being confirmed N is its "no"; the panel has it.
      if (displayConfig.mode !== DisplayMode.Grid || isPromptOpen) return;
      handleSourceAdd();
    },
    [displayConfig.mode, isPromptOpen]
  );

  return (
    <div className="flex h-screen overflow-hidden">
      {isEditing && (
        <div className="flex h-full w-[340px] flex-none flex-col overflow-y-auto border-r border-gray-800 p-3">
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
            <SourceSlider
              onSelect={handleSourceChange}
              selectedSourceSlug={selectedSourceSlug}
              activeSignal={selectedSignal}
              onSelectSignal={handleSignalChange}
            />
          </div>

          <div className="mt-3 flex flex-none flex-col gap-1 text-xs text-gray-300">
            <Shortcut keys="E" label="Toggle Edit Mode" />
            <Shortcut keys="↑ ↓ ← →" label="Elegir Pantalla" />
            <Shortcut
              keys="Enter"
              label={
                swapSourceIdx === undefined
                  ? 'Marcar para Intercambiar'
                  : `Intercambiar con ${swapSourceIdx + 1}`
              }
            />
            <Shortcut
              keys="G"
              label={
                isFullscreen ? 'Salir Pantalla Completa' : 'Pantalla Completa'
              }
            />
            <Shortcut
              keys="M"
              label={
                (selectedSources?.[editingSourceIdx]?.muted ?? true)
                  ? 'Activar Audio'
                  : 'Silenciar'
              }
            />
            {displayConfig.mode === DisplayMode.Grid && canRemoveScreen && (
              <Shortcut keys="SUPR" label="Quitar" />
            )}
            {displayConfig.mode === DisplayMode.Grid && (
              <Shortcut keys="N" label="Agregar" />
            )}
          </div>
        </div>
      )}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        {/* The monitor takes what the control bar leaves, and the container
            query fits the 16:9 box inside it. */}
        <div
          className="flex min-h-0 min-w-0 flex-1"
          style={{ containerType: 'size' }}
        >
          <div
            ref={screenRef}
            className="m-auto aspect-video"
            style={{ width: 'min(100cqw, calc(100cqh * 16 / 9))' }}
          >
            <Screen
              screen={screen}
              onEdit={isYoutubeMode ? undefined : handleSourceEdit}
              onRemove={
                isYoutubeMode || !canRemoveScreen
                  ? undefined
                  : handleSourceRemove
              }
              editingSourceIdx={editingSourceIdx}
              swapSourceIdx={swapSourceIdx}
              fullscreenIdx={fullscreenIdx}
              onSwitch={isYoutubeMode ? undefined : handleSwitch}
            />
          </div>
        </div>

        {/* The layout config is always on screen, and its keys are its own, so
            it answers whichever category the sidebar is browsing. */}
        <ControlBar
          className="w-full flex-none"
          mode={displayConfig.mode}
          size={displayConfig.grid.size}
          onModeChange={handleModeChange}
          onSizeChange={handleSizeChange}
          onSourceAdd={
            displayConfig.mode === DisplayMode.Grid ? handleSourceAdd : undefined
          }
        />
      </div>
    </div>
  );
};
