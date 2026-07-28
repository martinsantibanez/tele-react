'use client';
import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useTeleContext } from '../../context/TeleContext';
import { DEFAULT_GRID_SIZE } from '../../hooks/defaultScreen';
import { useDisplayConfig } from '../../hooks/useDisplayConfig';
import { useFeaturedScreen } from '../../hooks/useFeaturedScreen';
import { useSavedGrid } from '../../hooks/useSavedGrid';
import { useYoutubeGridSources } from '../../hooks/useYoutubeLiveSubs';
import { embeddedSource, SourceType } from '../../sources';
import {
  DisplayMode,
  GridSize,
  ScreenType,
  SourceNode
} from '../../types/Monitor';
import {
  getIndexFromKeyEvent,
  getSourceShortcutLabel
} from '../../utils/sourceShortcut';
import { uuid } from '../../utils/uuid';
import { ScreenOptions } from '../ScreenOptions/ScreenOptions';
import { SourceSlider } from '../SelectSource/SourceSlider';
import {
  useActiveCategory,
  useRevealSource
} from '../SelectSource/sourceCategories';
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
    setSwapSourceIdx
  } = useTeleContext();
  const [selectedSources, setSelectedSources] = useSavedGrid();
  const [displayConfig, setDisplayConfig] = useDisplayConfig();
  const [, setFeaturedMonitor] = useFeaturedScreen();
  const [activeCategory] = useActiveCategory();
  const revealSource = useRevealSource();
  const [isFullscreen, setIsFullscreen] = useState(false);

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

  // Each node carries its own source, so the screen is complete on its own —
  // it can be promoted, saved or shared without anything travelling beside it.
  const screen: ScreenType = useMemo(
    () => ({
      config: displayConfig,
      sources: activeSources
    }),
    [displayConfig, activeSources]
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

  const handlePromote = () => {
    setFeaturedMonitor(screen);
  };

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
          return {
            ...src,
            sourceSlug: source.slug,
            source: embeddedSource(source),
            activeSignal: undefined
          };
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

  // Picking a screen to edit points the sidebar at what it is playing: its
  // category's tab, scrolled to the channel.
  const revealScreenSource = (idx: number) =>
    revealSource(selectedSources[idx]?.sourceSlug);

  const handleSourceEdit = (newIdx: number) => {
    setEditingSourceIdx(newIdx);
    revealScreenSource(newIdx);
  };

  const handleShare = async () => {
    const response = await axios.post('/api/share', screen);
    prompt(
      `Enlace para compartir. Valido por 24 horas.`,
      `${window.location.origin}/shared/${response.data.uuid}`
    );
  };

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

  useHotkeys('e', () => toggleEditting());
  useHotkeys(
    [
      '1,2,3,4,5,6,7,8,9',
      'shift+1,shift+2,shift+3,shift+4,shift+5,shift+6,shift+7,shift+8,shift+9'
    ].join(','),
    e => {
      const idx = getIndexFromKeyEvent(e);
      if (idx === undefined || idx >= visibleScreenCount) return;
      // The YouTube grid is auto-managed: a number key selects a tile (so G can
      // fullscreen it) and solos its audio; there is no per-tile source editing.
      if (isYoutubeMode) {
        setEditingSourceIdx(idx);
        setYoutubeSoloIdx(idx);
        return;
      }
      setEditingSourceIdx(idx);
      if (swapSourceIdx === undefined) handleSoloAudio(idx);
      revealScreenSource(idx);
    },
    [
      visibleScreenCount,
      swapSourceIdx,
      isYoutubeMode,
      selectedSources,
      revealSource
    ]
  );
  useHotkeys(
    'enter',
    () => {
      if (isYoutubeMode) return;
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
    [editingSourceIdx, swapSourceIdx, isYoutubeMode]
  );
  useHotkeys('g', () => setIsFullscreen(current => !current));
  useHotkeys(
    'escape',
    () => {
      if (isFullscreen) {
        setIsFullscreen(false);
        return;
      }
      setSwapSourceIdx(undefined);
    },
    [isFullscreen]
  );
  useHotkeys(
    'm',
    () => {
      if (swapSourceIdx !== undefined) return;
      if (isYoutubeMode) {
        setYoutubeSoloIdx(current =>
          current === editingSourceIdx ? undefined : editingSourceIdx
        );
        return;
      }
      handleToggleMute(editingSourceIdx);
    },
    [editingSourceIdx, swapSourceIdx, isYoutubeMode]
  );
  useHotkeys(
    'd',
    () => {
      if (isYoutubeMode || swapSourceIdx !== undefined) return;
      handleSourceRemove(editingSourceIdx);
    },
    [editingSourceIdx, swapSourceIdx, canRemoveScreen, isYoutubeMode]
  );
  useHotkeys(
    'a',
    () => {
      if (displayConfig.mode !== DisplayMode.Grid) return;
      handleSourceAdd();
    },
    [displayConfig.mode]
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

          {activeCategory === 'layouts' && (
            <div className="mt-3">
              <ScreenOptions
                onSizeChange={handleSizeChange}
                onSourceAdd={
                  displayConfig.mode === DisplayMode.Grid
                    ? handleSourceAdd
                    : undefined
                }
                onModeChange={handleModeChange}
                onPromote={handlePromote}
                onShare={handleShare}
                mode={displayConfig.mode}
                size={displayConfig.grid.size}
              />
            </div>
          )}

          <div className="mt-3 flex flex-none flex-col gap-1 text-xs text-gray-300">
            <Shortcut keys="E" label="Toggle Edit Mode" />
            <Shortcut
              keys="Enter"
              label={
                swapSourceIdx === undefined
                  ? 'Marcar para Intercambiar'
                  : `Intercambiar con ${getSourceShortcutLabel(swapSourceIdx)}`
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
              <Shortcut keys="D" label="Quitar" />
            )}
            {displayConfig.mode === DisplayMode.Grid && (
              <Shortcut keys="A" label="Agregar" />
            )}
          </div>
        </div>
      )}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        {/* The bar below takes the height it needs, so the screen is measured
            against what is left rather than against the whole column. */}
        <div
          className="flex min-h-0 min-w-0 flex-1 flex-col justify-center"
          style={{ containerType: 'size' }}
        >
          <div
            className="aspect-video flex-none self-center"
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

        {isEditing && <ControlBar className="w-full flex-none" />}
      </div>
    </div>
  );
};
