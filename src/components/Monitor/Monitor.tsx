'use client';
import axios from 'axios';
import {
  ChevronUp,
  Maximize2,
  Minimize2,
  PanelLeftClose,
  PanelLeftOpen,
  Volume2,
  VolumeX
} from 'lucide-react';
import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useTeleContext } from '../../context/TeleContext';
import { useControlBarVisible } from '../../hooks/useControlBarVisible';
import {
  DEFAULT_GRID_SIZE,
  MOBILE_GRID_SIZE,
  MOBILE_LANDSCAPE_SOURCE_COUNT,
  MOBILE_SOURCE_COUNT
} from '../../hooks/defaultScreen';
import { useDisplayConfig } from '../../hooks/useDisplayConfig';
import { useFeaturedScreen } from '../../hooks/useFeaturedScreen';
import { useFullscreenZapping } from '../../hooks/useFullscreenZapping';
import { useSavedGrid } from '../../hooks/useSavedGrid';
import { useViewport } from '../../hooks/useViewport';
import { useYoutubeGridSources } from '../../hooks/useYoutubeLiveSubs';
import { useYoutubeLoginScreen } from '../../hooks/useYoutubeLoginScreen';
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
import { defaultGrid } from '../GridDisplay/initialGrid';
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
  const [fullscreenZapping, setFullscreenZapping] = useFullscreenZapping();
  // Coming back from the YouTube login lands on the live view, as a screen of
  // its own; the picker is the only place the connect is launched from, so
  // this is where the return trip ends.
  useYoutubeLoginScreen();

  const isYoutubeMode = displayConfig.mode === DisplayMode.Youtube;
  // Watching one stream fullscreen holds the wall still: the five-minute poll
  // keeps running, but a channel joining or leaving it doesn't get to reshuffle
  // what is on screen while someone is looking at it.
  const { nodes: youtubeNodes } = useYoutubeGridSources({
    frozen: isYoutubeMode && isFullscreen
  });
  // Which YouTube channel keeps its audio, and which one is selected (all muted
  // by default). Both are held by slug rather than by tile number: a channel
  // going off air moves every tile after it along, and the sound and the
  // selection belong to the channel, not to the place it happened to sit in.
  const [youtubeSoloSlug, setYoutubeSoloSlug] = useState<string | undefined>();
  const [youtubeFocusSlug, setYoutubeFocusSlug] = useState<
    string | undefined
  >();

  const youtubeIdxOf = useCallback(
    (slug?: string) => {
      if (!slug) return undefined;
      const idx = youtubeNodes.findIndex(node => node.sourceSlug === slug);
      return idx < 0 ? undefined : idx;
    },
    [youtubeNodes]
  );

  const youtubeSoloIdx = youtubeIdxOf(youtubeSoloSlug);

  // Keeps the selection pointed at the channel it was made on as the list
  // moves under it — so G still fullscreens what was picked.
  const youtubeFocusIdx = youtubeIdxOf(youtubeFocusSlug);
  useEffect(() => {
    if (!isYoutubeMode || youtubeFocusIdx === undefined) return;
    setEditingSourceIdx(youtubeFocusIdx);
  }, [isYoutubeMode, youtubeFocusIdx, setEditingSourceIdx]);

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
  // The reel is not a picture inside a frame: the strips naming the channel
  // above and below are part of it, so it takes the whole of the space rather
  // than a 16:9 box within it.
  const isZappingMode = displayConfig.mode === DisplayMode.Zapping;

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
    : isZappingMode
      ? 1
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

  /**
   * A phone doesn't design its own grid — the panel for that is hidden there
   * — it always shows a fixed count in a single-column Grid: three screens
   * upright, six on its side, so there is always exactly enough width for
   * each tile to be worth watching. Kept up to date continuously rather than
   * only on arrival, so turning the phone over adds or drops tiles on the
   * spot. YouTube's wall is left alone: its tiles are the live channels, not
   * this array.
   */
  useEffect(() => {
    if (!isMobile || isYoutubeMode) return;
    const target = isLandscape
      ? MOBILE_LANDSCAPE_SOURCE_COUNT
      : MOBILE_SOURCE_COUNT;
    if (
      displayConfig.mode !== DisplayMode.Grid ||
      displayConfig.grid.size !== MOBILE_GRID_SIZE
    ) {
      setDisplayConfig(cfg => ({
        ...cfg,
        mode: DisplayMode.Grid,
        grid: { size: MOBILE_GRID_SIZE }
      }));
    }
    if (selectedSources.length !== target) {
      setSelectedSources(sources =>
        sources.length > target
          ? sources.slice(0, target)
          : [...sources, ...defaultGrid.slice(sources.length, target)]
      );
    }
  }, [
    isMobile,
    isLandscape,
    isYoutubeMode,
    displayConfig.mode,
    displayConfig.grid.size,
    selectedSources.length,
    setDisplayConfig,
    setSelectedSources
  ]);

  /**
   * Going in and out of edit mode. The strip of saved screens is part of the
   * same furniture as the picker, so the two travel together: leaving edit mode
   * puts all of it away and what is left is the picture, entering it brings the
   * whole of it back. The floating button (and C) is still there to fold the
   * strip away on its own.
   */
  const setEditing = (editing: boolean) => {
    setIsEditing(editing);
    setControlBarVisible(editing);
  };

  /**
   * Full screen and back. Going in on the YouTube wall marks the channel that
   * is being watched, so that on the way out — when the list is let go and
   * catches up with the poll — the selection lands back on it wherever it has
   * since moved to, rather than on whatever now sits in that tile.
   */
  const toggleFullscreen = () => {
    if (isYoutubeMode && !isFullscreen) {
      const slug = youtubeNodes[editingSourceIdx]?.sourceSlug;
      if (slug) setYoutubeFocusSlug(slug);
    }
    setIsFullscreen(current => !current);
  };

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

  const isSelectedMuted = isYoutubeMode
    ? youtubeSoloIdx !== editingSourceIdx
    : (selectedSources?.[editingSourceIdx]?.muted ?? true);

  const toggleSelectedMute = () => {
    if (isYoutubeMode) {
      const slug = youtubeNodes[editingSourceIdx]?.sourceSlug;
      setYoutubeSoloSlug(current => (current === slug ? undefined : slug));
      return;
    }
    handleToggleMute(editingSourceIdx);
  };

  // Picking a screen to edit points the sidebar at what it is playing: its
  // category's tab, scrolled to the channel.
  const revealScreenSource = (idx: number) =>
    revealSource(selectedSources[idx]?.sourceSlug);

  const handleSourceEdit = (newIdx: number) => {
    setEditingSourceIdx(newIdx);
    revealScreenSource(newIdx);
  };

  /**
   * Picking a screen — by its number key, or by putting a finger on it. The
   * screen becomes the one being edited, it takes the sound off whichever had
   * it, and the sidebar follows it to the channel it is playing. While a swap
   * is marked the sound stays put: that pick is the other half of the trade.
   */
  const selectScreen = (idx: number) => {
    if (idx < 0 || idx >= visibleScreenCount) return;
    // The YouTube grid is auto-managed: picking a tile selects it (so G can
    // fullscreen it) and solos its audio; there is no per-tile source editing.
    if (isYoutubeMode) {
      setEditingSourceIdx(idx);
      setYoutubeFocusSlug(youtubeNodes[idx]?.sourceSlug);
      setYoutubeSoloSlug(youtubeNodes[idx]?.sourceSlug);
      return;
    }
    setEditingSourceIdx(idx);
    if (swapSourceIdx === undefined) handleSoloAudio(idx);
    revealScreenSource(idx);
  };

  // The <iframe> handler below fires from an event listener bound once, so it
  // reads the current pick through a ref rather than closing over a stale one.
  const selectScreenRef = useRef(selectScreen);
  selectScreenRef.current = selectScreen;

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
        if (!(active instanceof HTMLIFrameElement)) return;
        // A frame only takes the focus when it is clicked, and that click is
        // the one its screen never sees — so this is also how a tap on an
        // embedded player reaches the tile it landed on.
        const tile = active.closest<HTMLElement>('[data-screen-idx]');
        if (tile) selectScreenRef.current(Number(tile.dataset.screenIdx));
        active.blur();
      }, 0);
    };
    window.addEventListener('blur', refocus);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('blur', refocus);
    };
  }, []);

  useHotkeys('e', () => setEditing(!isEditing), [isEditing]);
  useHotkeys(
    [
      '1,2,3,4,5,6,7,8,9',
      'shift+1,shift+2,shift+3,shift+4,shift+5,shift+6,shift+7,shift+8,shift+9'
    ].join(','),
    e => {
      const idx = getIndexFromKeyEvent(e);
      if (idx === undefined) return;
      selectScreen(idx);
    },
    [
      visibleScreenCount,
      swapSourceIdx,
      isYoutubeMode,
      youtubeNodes,
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
  useHotkeys('g', () => toggleFullscreen(), [
    isYoutubeMode,
    isFullscreen,
    youtubeNodes,
    editingSourceIdx
  ]);
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
      toggleSelectedMute();
    },
    [editingSourceIdx, swapSourceIdx, isYoutubeMode, youtubeNodes]
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

      {/* The grid's arrangement is nothing a phone has a say over — it always
          shows a fixed count, in a fixed shape — so the panel that configures
          it has no reason to be there. */}
      {activeCategory === 'layouts' && !isMobile && (
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
            fullscreenZapping={fullscreenZapping}
            onFullscreenZappingChange={setFullscreenZapping}
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

  const floatingControls = (
    <div className="absolute right-2 bottom-2 z-[60] flex items-center gap-2">
      <FloatingButton
        onClick={toggleSelectedMute}
        label={isSelectedMuted ? 'Activar el audio' : 'Silenciar'}
      >
        {isSelectedMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
      </FloatingButton>
      <FloatingButton
        onClick={toggleFullscreen}
        label={
          isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'
        }
      >
        {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
      </FloatingButton>
      {!controlBarVisible && !isMobile && (
        <FloatingButton
          onClick={() => setControlBarVisible(true)}
          label="Ver pantallas"
        >
          <ChevronUp size={20} />
        </FloatingButton>
      )}
      {/* A tablet gets the desktop layout but has no E key to call the picker
          back with, so the way in is on the picture too. On a phone the bottom
          bar is already that door. */}
      {!isMobile && !isEditing && (
        <FloatingButton
          onClick={() => setEditing(true)}
          label="Ver panel de canales"
        >
          <PanelLeftOpen size={20} />
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
          className={
            isZappingMode
              ? 'flex min-h-0 min-w-0 flex-1 self-stretch'
              : 'min-h-0 flex-none self-center'
          }
          style={
            isZappingMode
              ? undefined
              : {
                  aspectRatio: monitorRatio,
                  width: `min(100cqw, calc(100cqh * ${monitorRatio}))`
                }
          }
        >
          <Screen
            screen={screen}
            onSelect={selectScreen}
            onEdit={isYoutubeMode ? undefined : handleSourceEdit}
            onRemove={
              isYoutubeMode || isZappingMode || !canRemoveScreen
                ? undefined
                : handleSourceRemove
            }
            editingSourceIdx={editingSourceIdx}
            swapSourceIdx={swapSourceIdx}
            fullscreenIdx={fullscreenIdx}
            onSwitch={isYoutubeMode ? undefined : handleSwitch}
            gridColumns={gridColumns}
            onSourceChange={isZappingMode ? handleSourceChange : undefined}
            onFullscreenSourceChange={
              fullscreenZapping && !isYoutubeMode ? handleSourceChange : undefined
            }
          />
        </div>
        {floatingControls}
      </div>

      {/* The strip of saved screens is nothing a phone can act on — see the
          layouts panel above — so there is nothing here worth folding out. */}
      {controlBarVisible && !isMobile && (
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
          {/* Its own way out, for the tablets that have no keyboard to press E
              on. Part of the column rather than laid over it, so it doesn't
              cover the tabs it sits above nor scroll away with them. */}
          <div className="mb-1 flex flex-none justify-end">
            <button
              type="button"
              onClick={() => setEditing(false)}
              aria-label="Ocultar panel de canales"
              title="Ocultar panel (E)"
              className="rounded-md p-1.5 text-gray-400 opacity-70 hover:bg-gray-800 hover:text-white hover:opacity-100"
            >
              <PanelLeftClose size={16} />
            </button>
          </div>
          {picker}
        </div>
      )}
      {monitorColumn}
    </div>
  );
};
