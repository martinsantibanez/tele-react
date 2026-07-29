'use client';
import axios from 'axios';
import {
  ChevronUp,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX
} from 'lucide-react';
import { PropsWithChildren, useEffect, useMemo, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useTeleContext } from '../../context/TeleContext';
import { useControlBarVisible } from '../../hooks/useControlBarVisible';
import { DEFAULT_GRID_SIZE } from '../../hooks/defaultScreen';
import { useDisplayConfig } from '../../hooks/useDisplayConfig';
import { useFeaturedScreen } from '../../hooks/useFeaturedScreen';
import { useSavedGrid } from '../../hooks/useSavedGrid';
import { useViewport } from '../../hooks/useViewport';
import { useYoutubeGridSources } from '../../hooks/useYoutubeLiveSubs';
import { MobileNav } from '../../layout/MobileNav';
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

/** A control laid over the picture: legible, but faint until it is wanted. */
const FloatingButton = ({
  onClick,
  label,
  children
}: PropsWithChildren<{ onClick: () => void; label: string }>) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    title={label}
    className="rounded-full bg-black/60 p-2.5 text-white opacity-50 backdrop-blur-sm transition-opacity hover:opacity-100 focus-visible:opacity-100 active:opacity-100"
  >
    {children}
  </button>
);

export const Monitor = () => {
  const {
    toggleEditting,
    isEditing,
    setIsEditing,
    editingSourceIdx,
    setEditingSourceIdx,
    swapSourceIdx,
    setSwapSourceIdx
  } = useTeleContext();
  const { isMobile, isLandscape, isMobileLandscape } = useViewport();
  const [controlBarVisible, setControlBarVisible] = useControlBarVisible();
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

  const isGrid = displayConfig.mode === DisplayMode.Grid;

  /**
   * How wide the grid is laid out. Its own setting, except on a phone held
   * sideways: a column of channels down a screen 400px tall leaves them postage
   * stamps, while the same grid on its side — rows for columns — fills the
   * width the phone has plenty of. The saved screen is untouched; turning the
   * phone back stands it up again.
   */
  const gridColumns = useMemo(() => {
    const columns = displayConfig.grid.size;
    if (!isMobileLandscape || !isGrid) return columns;
    return Math.ceil((activeSources?.length ?? 0) / columns) || 1;
  }, [isMobileLandscape, isGrid, displayConfig.grid.size, activeSources]);

  /**
   * The shape of the monitor. A television is 16:9 and the layouts are drawn to
   * fill one, so that is what it stays — except for a grid on a phone, which is
   * measured by its tiles instead: one channel per row down a tall screen wants
   * a tall monitor, and squeezing three of them into a 16:9 box would leave
   * three slivers with black on either side.
   */
  const monitorRatio = useMemo(() => {
    if (!isMobile || !isGrid) return 16 / 9;
    const rows = Math.ceil((activeSources?.length ?? 0) / gridColumns) || 1;
    return (16 * gridColumns) / (9 * rows);
  }, [isMobile, isGrid, gridColumns, activeSources]);

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

  // On a phone the picker is a sheet over the bottom bar rather than a column
  // beside the monitor, and it opening on arrival would leave half a screen of
  // television. `isEditing` is what the sheet is folded out by, so arriving on
  // a hand-held folds it away — the bar itself stays.
  useEffect(() => {
    if (isMobile) setIsEditing(false);
  }, [isMobile, setIsEditing]);

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

  const handleMuteAll = () => {
    setSelectedSources(sources => {
      if (!sources) return sources;
      return sources.map(src => ({ ...src, muted: true }));
    });
  };

  const isSelectedMuted = isYoutubeMode
    ? youtubeSoloIdx !== editingSourceIdx
    : (selectedSources?.[editingSourceIdx]?.muted ?? true);

  /**
   * The screen being heard. There is only ever one — the audio is handed from
   * screen to screen rather than stacked — so the first one left unmuted is it.
   */
  const audibleIdx = useMemo(() => {
    if (isYoutubeMode) return youtubeSoloIdx;
    const idx = selectedSources?.findIndex(node => !(node.muted ?? true)) ?? -1;
    return idx < 0 ? undefined : idx;
  }, [isYoutubeMode, youtubeSoloIdx, selectedSources]);

  // A screen the layout doesn't show has no sound to be handed.
  const audibleCount = isYoutubeMode
    ? youtubeSources.length
    : Math.min(visibleScreenCount, selectedSources?.length ?? 0);

  /**
   * Hands the sound on to the next screen, and after the last one to none at
   * all. The whole of the audio on a single button, for want of the number keys
   * a phone doesn't have — and the silence at the end of the round is the way
   * back to a quiet grid.
   */
  const cycleAudio = () => {
    if (!audibleCount) return;
    const next = audibleIdx === undefined ? 0 : audibleIdx + 1;
    const target = next >= audibleCount ? undefined : next;
    if (isYoutubeMode) {
      setYoutubeSoloIdx(target);
      return;
    }
    if (target === undefined) handleMuteAll();
    else handleSoloAudio(target);
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
  useHotkeys('c', () => setControlBarVisible(!controlBarVisible), [
    controlBarVisible,
    setControlBarVisible
  ]);

  const picker = (
    <>
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        <SourceSlider
          onSelect={handleSourceChange}
          selectedSourceSlug={selectedSourceSlug}
          activeSignal={selectedSignal}
          onSelectSignal={handleSignalChange}
          // The phone's tabs live in the bar the sheet folds out of, and its
          // keyboard hints have no keyboard to speak of.
          showCategories={!isMobile}
          showHints={!isMobile}
        />
      </div>

      {activeCategory === 'layouts' && (
        <div className="mt-3 flex-none">
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

      {!isMobile && (
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
            label={isSelectedMuted ? 'Activar Audio' : 'Silenciar'}
          />
          <Shortcut
            keys="C"
            label={controlBarVisible ? 'Ocultar Pantallas' : 'Ver Pantallas'}
          />
          {displayConfig.mode === DisplayMode.Grid && canRemoveScreen && (
            <Shortcut keys="D" label="Quitar" />
          )}
          {displayConfig.mode === DisplayMode.Grid && (
            <Shortcut keys="A" label="Agregar" />
          )}
        </div>
      )}
    </>
  );

  // Over the picture, bottom right, faded until they are reached for: the
  // controls a phone has no keys for, and the way back to the screens strip
  // once it has been folded away.
  const floatingControls = (
    <div className="absolute right-2 bottom-2 z-[60] flex items-center gap-2">
      {isMobile && (
        <>
          <FloatingButton
            onClick={cycleAudio}
            label={
              audibleIdx === undefined
                ? 'Activar el audio de la primera pantalla'
                : `Audio en la pantalla ${getSourceShortcutLabel(audibleIdx)} — pasar a la siguiente`
            }
          >
            {audibleIdx === undefined ? (
              <VolumeX size={20} />
            ) : (
              <span className="flex items-center gap-1">
                <Volume2 size={20} />
                {/* Which screen is being heard, since the button no longer
                    speaks about the one that happens to be selected. */}
                <span className="text-xs leading-none font-bold">
                  {getSourceShortcutLabel(audibleIdx)}
                </span>
              </span>
            )}
          </FloatingButton>
          <FloatingButton
            onClick={() => setIsFullscreen(current => !current)}
            label={
              isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'
            }
          >
            {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
          </FloatingButton>
        </>
      )}
      {!controlBarVisible && (
        <FloatingButton
          onClick={() => setControlBarVisible(true)}
          label="Ver pantallas"
        >
          <ChevronUp size={20} />
        </FloatingButton>
      )}
    </div>
  );

  // What is on air, with the strip of screens under it.
  const monitorColumn = (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      {/* The bar below takes the height it needs, so the screen is measured
          against what is left rather than against the whole column. */}
      <div
        className="relative flex min-h-0 min-w-0 flex-1 flex-col justify-center"
        style={{ containerType: 'size' }}
      >
        {/* min-h-0: as a flex item its automatic minimum size is the content's
            min-content height, which is taller than the 16:9 box and would
            stretch the screen over the bar below. */}
        <div
          className="min-h-0 flex-none self-center"
          style={{
            aspectRatio: monitorRatio,
            width: `min(100cqw, calc(100cqh * ${monitorRatio}))`
          }}
        >
          <Screen
            screen={screen}
            onEdit={isYoutubeMode ? undefined : handleSourceEdit}
            onRemove={
              isYoutubeMode || !canRemoveScreen ? undefined : handleSourceRemove
            }
            editingSourceIdx={editingSourceIdx}
            swapSourceIdx={swapSourceIdx}
            fullscreenIdx={fullscreenIdx}
            onSwitch={isYoutubeMode ? undefined : handleSwitch}
            gridColumns={gridColumns}
          />
        </div>
        {floatingControls}
      </div>

      {controlBarVisible && (
        <ControlBar
          className="w-full flex-none"
          onHide={() => setControlBarVisible(false)}
        />
      )}
    </div>
  );

  if (isMobile)
    return (
      // `dvh` rather than `vh`: on a phone the address bar is part of the
      // viewport height right until it slides away, and `vh` would leave the
      // bottom bar underneath it.
      <div className="flex h-[100dvh] flex-col overflow-hidden">
        <div className="flex min-h-0 min-w-0 flex-1 flex-row">
          {/* Sideways there is width to spare and no height at all, so the
              picker stands beside the monitor instead of folding out under it —
              a sheet would leave a strip of television above it. */}
          {isLandscape && isEditing && (
            <div className="flex h-full w-[300px] max-w-[45%] flex-none flex-col overflow-y-auto border-r border-gray-800 p-2">
              {picker}
            </div>
          )}
          {monitorColumn}
        </div>

        <MobileNav
          isOpen={isEditing}
          onOpenChange={setIsEditing}
          isLandscape={isLandscape}
        >
          {!isLandscape && picker}
        </MobileNav>
      </div>
    );

  return (
    <div className="flex h-screen overflow-hidden">
      {isEditing && (
        <div className="flex h-full w-[340px] flex-none flex-col overflow-y-auto border-r border-gray-800 p-3">
          {picker}
        </div>
      )}
      {monitorColumn}
    </div>
  );
};
