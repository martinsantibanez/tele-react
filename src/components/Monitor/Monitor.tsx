'use client';
import {
  Maximize2,
  Minimize2,
  Pencil,
  Volume2,
  VolumeX,
  X
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
import {
  MOBILE_GRID_SIZE,
  MOBILE_LANDSCAPE_GRID_COLUMNS,
  MOBILE_LANDSCAPE_SOURCE_COUNT,
  MOBILE_SOURCE_COUNT
} from '../../hooks/defaultScreen';
import { useDisplayConfig } from '../../hooks/useDisplayConfig';
import { useIsTv } from '../../hooks/useIsTv';
import {
  neighbourScreen,
  useKeyNames,
  useOkKey
} from '../../hooks/useRemoteKeys';
import { useSavedGrid } from '../../hooks/useSavedGrid';
import {
  useActiveScreenIndex,
  useSavedScreens
} from '../../hooks/useSavedScreens';
import { useViewport } from '../../hooks/useViewport';
import { useYoutubeGridSources } from '../../hooks/useYoutubeLiveSubs';
import { useYoutubeLoginScreen } from '../../hooks/useYoutubeLoginScreen';
import { useZappingTopGridSources } from '../../hooks/useZappingTopGrid';
import { MobileNav } from '../../layout/MobileNav';
import { embeddedSource, SourceType } from '../../sources';
import { DisplayMode, ScreenType } from '../../types/Monitor';
import {
  getIndexFromKeyEvent,
  getSourceShortcutLabel
} from '../../utils/sourceShortcut';
import { uuid } from '../../utils/uuid';
import { defaultGrid } from '../GridDisplay/initialGrid';
import { SourceSlider } from '../SelectSource/SourceSlider';
import { useRevealSource } from '../SelectSource/sourceCategories';
import { ControlBar } from './ControlBar';
import { OnSwitchCb, PICKER_WIDTH } from './MonitorSource';
import { fillSlots, slotCount } from './predefinedLayouts';
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
    toggleEditting,
    editingSourceIdx,
    setEditingSourceIdx,
    swapSourceIdx,
    setSwapSourceIdx,
    isMuted,
    toggleMute
  } = useTeleContext();
  const { isMobile, isLandscape, isMobileLandscape } = useViewport();
  const isTv = useIsTv();
  const [selectedSources, setSelectedSources] = useSavedGrid();
  const [displayConfig, setDisplayConfig] = useDisplayConfig();
  const revealSource = useRevealSource();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [savedScreens] = useSavedScreens();
  const [activeScreenIndex, setActiveScreenIndex] = useActiveScreenIndex();
  const screenAreaRef = useRef<HTMLDivElement>(null);
  useYoutubeLoginScreen();

  const isYoutubeMode = displayConfig.mode === DisplayMode.Youtube;
  const isZappingTopMode = displayConfig.mode === DisplayMode.ZappingTop;
  // The live walls: their tiles come from a feed (the live subscriptions, the
  // most watched ranking), not from the screen's channels, which they leave
  // alone underneath.
  const isLiveMode = isYoutubeMode || isZappingTopMode;

  const { nodes: youtubeNodes } = useYoutubeGridSources({
    frozen: isYoutubeMode && isFullscreen
  });
  const zappingTopNodes = useZappingTopGridSources({
    count: displayConfig.grid.count ?? 0,
    frozen: isZappingTopMode && isFullscreen
  });
  const liveNodes = isYoutubeMode ? youtubeNodes : zappingTopNodes;

  // A live tile is followed by its channel, not its place: the feed can move
  // it while it is selected.
  const [liveFocusSlug, setLiveFocusSlug] = useState<string | undefined>();

  const liveIdxOf = useCallback(
    (slug?: string) => {
      if (!slug) return undefined;
      const idx = liveNodes.findIndex(node => node.sourceSlug === slug);
      return idx < 0 ? undefined : idx;
    },
    [liveNodes]
  );

  const liveFocusIdx = liveIdxOf(liveFocusSlug);
  useEffect(() => {
    if (!isLiveMode || liveFocusIdx === undefined) return;
    setEditingSourceIdx(liveFocusIdx);
  }, [isLiveMode, liveFocusIdx, setEditingSourceIdx]);

  const activeSources = isLiveMode ? liveNodes : selectedSources;

  const screen: ScreenType = useMemo(
    () => ({
      config: displayConfig,
      sources: activeSources
    }),
    [displayConfig, activeSources]
  );

  const fullscreenIdx = isFullscreen ? editingSourceIdx : undefined;

  const isGrid = displayConfig.mode === DisplayMode.Grid;

  const isZappingMode = displayConfig.mode === DisplayMode.Zapping;

  const gridColumns = useMemo(() => {
    if (isMobileLandscape && isGrid) return MOBILE_LANDSCAPE_GRID_COLUMNS;
    return displayConfig.grid.size;
  }, [isMobileLandscape, isGrid, displayConfig.grid.size]);

  const monitorRatio = useMemo(() => {
    if (!isMobile || !isGrid) return 16 / 9;
    const rows = Math.ceil((activeSources?.length ?? 0) / gridColumns) || 1;
    return (16 * gridColumns) / (9 * rows);
  }, [isMobile, isGrid, gridColumns, activeSources]);

  const selectedSourceSlug = useMemo(
    () => selectedSources[editingSourceIdx]?.sourceSlug,
    [editingSourceIdx, selectedSources]
  );

  const selectedSignal = useMemo(
    () => selectedSources[editingSourceIdx]?.activeSignal,
    [editingSourceIdx, selectedSources]
  );

  const visibleScreenCount = slotCount(displayConfig, activeSources);

  useEffect(() => {
    if (!visibleScreenCount) return;
    setEditingSourceIdx(current => Math.min(current, visibleScreenCount - 1));
  }, [visibleScreenCount, setEditingSourceIdx]);

  // A phone and a TV both open on the picture: the picker would take most of
  // the one, and on the other OK is how it is reached anyway.
  useEffect(() => {
    if (isMobile || isTv) setIsEditing(false);
  }, [isMobile, isTv, setIsEditing]);

  useEffect(() => {
    if (!isMobile || isLiveMode) return;
    const target = isLandscape
      ? MOBILE_LANDSCAPE_SOURCE_COUNT
      : MOBILE_SOURCE_COUNT;
    if (
      displayConfig.mode !== DisplayMode.Grid ||
      displayConfig.grid.size !== MOBILE_GRID_SIZE ||
      displayConfig.grid.count !== target
    ) {
      setDisplayConfig(cfg => ({
        ...cfg,
        mode: DisplayMode.Grid,
        grid: { size: MOBILE_GRID_SIZE, count: target }
      }));
    }
    if (selectedSources.length < target) {
      setSelectedSources(sources => [
        ...sources,
        ...defaultGrid.slice(sources.length, target)
      ]);
    }
  }, [
    isMobile,
    isLandscape,
    isLiveMode,
    displayConfig.mode,
    displayConfig.grid.size,
    displayConfig.grid.count,
    selectedSources.length,
    setDisplayConfig,
    setSelectedSources
  ]);

  // Every slot of the arrangement gets a channel to show, even an empty one.
  // Channels past the last slot stay where they are, out of sight.
  const slotsToFill = isLiveMode
    ? 0
    : slotCount(displayConfig, selectedSources);
  useEffect(() => {
    if (isMobile || selectedSources.length >= slotsToFill) return;
    setSelectedSources(sources => fillSlots(sources, slotsToFill));
  }, [isMobile, slotsToFill, selectedSources.length, setSelectedSources]);

  // The picker, the grid and fullscreen are three levels, one inside the next:
  // OK goes a level in and Back comes a level out. Going fullscreen closes the
  // picker, but → opens it again beside the picture, to browse the whole list
  // without leaving it; OK or Back then put the picture back on its own.
  // A phone has no room beside the picture, and a YouTube tile is not one the
  // picker points, so there the picker still leaves fullscreen.
  const pickerBesideFullscreen = !isMobile && !isLiveMode;
  const toggleFullscreen = () => {
    if (isLiveMode && !isFullscreen) {
      const slug = liveNodes[editingSourceIdx]?.sourceSlug;
      if (slug) setLiveFocusSlug(slug);
    }
    if (!isFullscreen) setIsEditing(false);
    setIsFullscreen(current => !current);
  };

  const togglePicker = () => {
    if (!isEditing && !pickerBesideFullscreen) setIsFullscreen(false);
    toggleEditting();
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

  const revealScreenSource = (idx: number) =>
    revealSource(selectedSources[idx]?.sourceSlug);

  const handleSourceEdit = (newIdx: number) => {
    setEditingSourceIdx(newIdx);
    revealScreenSource(newIdx);
  };

  const selectScreen = (idx: number) => {
    if (idx < 0 || idx >= visibleScreenCount) return;
    if (isLiveMode) {
      setEditingSourceIdx(idx);
      setLiveFocusSlug(liveNodes[idx]?.sourceSlug);
      return;
    }
    setEditingSourceIdx(idx);
    revealScreenSource(idx);
  };

  const selectScreenRef = useRef(selectScreen);
  selectScreenRef.current = selectScreen;

  const handleSwitch: OnSwitchCb = (left: number, right: number) => {
    setSelectedSources(sources => {
      if (!sources) return sources;
      const newSources = [...sources];
      newSources[left] = sources[right];
      newSources[right] = sources[left];
      return newSources;
    });
  };

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const refocus = () => {
      timer = setTimeout(() => {
        const active = document.activeElement;
        if (!(active instanceof HTMLIFrameElement)) return;

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

  const canSwap = !isLiveMode && !isFullscreen;

  /** Marks the selected screen, or swaps it with the one already marked. */
  const swapStep = () => {
    if (!canSwap) return;
    if (swapSourceIdx === undefined) {
      setSwapSourceIdx(editingSourceIdx);
      return;
    }
    if (swapSourceIdx !== editingSourceIdx) {
      handleSwitch(swapSourceIdx, editingSourceIdx);
      setEditingSourceIdx(swapSourceIdx);
    }
    setSwapSourceIdx(undefined);
  };

  // The zapping display is one channel filling the monitor already: there is
  // no grid level to it.
  const hasGridLevel = !isZappingMode;

  useOkKey({
    onPress: () => {
      // Halfway through a swap, OK finishes it wherever it is pressed.
      if (swapSourceIdx !== undefined) swapStep();
      else if (isEditing) setIsEditing(false);
      else if (!isFullscreen && hasGridLevel) toggleFullscreen();
    },
    onLongPress: swapStep
  });

  useHotkeys('e', () => togglePicker(), [togglePicker]);
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
      isLiveMode,
      liveNodes,
      selectedSources,
      revealSource
    ]
  );
  useHotkeys('g', () => toggleFullscreen(), [
    isLiveMode,
    isFullscreen,
    liveNodes,
    editingSourceIdx
  ]);
  useHotkeys(
    'escape',
    () => {
      if (isFullscreen) {
        if (isEditing) setIsEditing(false);
        else setIsFullscreen(false);
        return;
      }
      if (swapSourceIdx !== undefined) {
        setSwapSourceIdx(undefined);
        return;
      }
      // From the grid Back opens the picker on the selected screen; from the
      // picker it closes it again. On the TV a second Back in quick
      // succession leaves the app, so this never traps the remote.
      if (!isEditing) revealScreenSource(editingSourceIdx);
      setIsEditing(current => !current);
    },
    [isFullscreen, swapSourceIdx, isEditing, editingSourceIdx, selectedSources]
  );

  // With the picker away, the arrows walk the tiles. The picker owns them
  // while it is open, and so does the reel while a tile is fullscreen.
  const gridArrows = !isEditing && !isFullscreen && hasGridLevel;
  const moveSelection = (direction: 'up' | 'down' | 'left' | 'right') => {
    const area = screenAreaRef.current;
    if (!area) return;
    const target = neighbourScreen(area, editingSourceIdx, direction);
    if (target !== undefined) selectScreen(target);
  };
  const arrowOptions = { enabled: gridArrows, preventDefault: true };
  useHotkeys('up', () => moveSelection('up'), arrowOptions, [moveSelection]);
  useHotkeys('down', () => moveSelection('down'), arrowOptions, [
    moveSelection
  ]);
  useHotkeys('left', () => moveSelection('left'), arrowOptions, [
    moveSelection
  ]);
  useHotkeys('right', () => moveSelection('right'), arrowOptions, [
    moveSelection
  ]);
  useHotkeys(
    'right',
    () => {
      revealScreenSource(editingSourceIdx);
      setIsEditing(true);
    },
    {
      enabled: isFullscreen && !isEditing && pickerBesideFullscreen,
      preventDefault: true
    },
    [editingSourceIdx, selectedSources, revealSource]
  );

  // Stops at the ends, like the saved screens strip's own Z and X.
  const stepSavedScreen = (delta: number) => {
    const target = Math.min(
      Math.max(activeScreenIndex + delta, 0),
      savedScreens.length - 1
    );
    if (target !== activeScreenIndex) setActiveScreenIndex(target);
  };
  // A remote's channel keys switch saved screens from the grid, but only with
  // the picker open, where the strip they walk is on show. With it away they
  // zap the selected tile instead, and so they do fullscreen (see
  // `ChannelReel`) and on the zapping display, which is one channel on air.
  // PageUp and PageDown are the keyboard's pair, and always mean the saved
  // screens. CH+ moves on to the next screen along the strip, the way it moves
  // a set-top box up a channel.
  useKeyNames(
    {
      PageUp: () => stepSavedScreen(-1),
      PageDown: () => stepSavedScreen(1),
      ...(hasGridLevel &&
        isEditing && {
          ChannelUp: () => stepSavedScreen(1),
          ChannelDown: () => stepSavedScreen(-1)
        })
    },
    !isFullscreen
  );
  useHotkeys('m', () => toggleMute(), [toggleMute]);
  const picker = (
    <>
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        <SourceSlider
          onSelect={handleSourceChange}
          selectedSourceSlug={selectedSourceSlug}
          activeSignal={selectedSignal}
          onSelectSignal={handleSignalChange}
          showHints={!isMobile}
        />
      </div>

      {!isMobile && (
        <div className="mt-3 flex flex-none flex-col gap-1 text-xs text-gray-300">
          {!isTv && <Shortcut keys="E" label="Toggle Edit Mode" />}
          <Shortcut
            keys={isTv ? 'OK' : 'Enter'}
            label={
              swapSourceIdx === undefined
                ? 'Ver pantallas'
                : `Intercambiar con ${getSourceShortcutLabel(swapSourceIdx)}`
            }
          />
          {canSwap && swapSourceIdx === undefined && (
            <Shortcut
              keys={isTv ? 'Mantener OK' : 'Mantener Enter'}
              label="Marcar para Intercambiar"
            />
          )}
          <Shortcut
            keys={isTv ? 'Atrás' : 'Esc'}
            label={
              swapSourceIdx === undefined
                ? 'Cerrar selector'
                : 'Cancelar intercambio'
            }
          />
          {savedScreens.length > 1 && (
            <Shortcut
              keys={isTv ? 'CH− / CH+' : 'RePág / AvPág'}
              label="Cambiar pantalla guardada"
            />
          )}
          {/* The rest are letter keys, which a remote does not have. */}
          {!isTv && (
            <>
              <Shortcut
                keys="G"
                label={
                  isFullscreen ? 'Salir Pantalla Completa' : 'Pantalla Completa'
                }
              />
              <Shortcut
                keys="M"
                label={isMuted ? 'Activar Audio' : 'Silenciar'}
              />
            </>
          )}
        </div>
      )}
    </>
  );

  const floatingControls = (
    <div className="absolute right-2 bottom-2 z-[60] flex items-center gap-2">
      <FloatingButton
        onClick={toggleMute}
        label={isMuted ? 'Activar el audio' : 'Silenciar'}
      >
        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
      </FloatingButton>
      <FloatingButton
        onClick={toggleFullscreen}
        label={
          isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'
        }
      >
        {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
      </FloatingButton>
      <FloatingButton
        onClick={togglePicker}
        label={isEditing ? 'Salir de edición' : 'Editar canales'}
      >
        {isEditing ? <X size={20} /> : <Pencil size={20} />}
      </FloatingButton>
    </div>
  );

  const monitorColumn = (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <div
        className="relative flex min-h-0 min-w-0 flex-1 flex-col justify-center"
        style={{ containerType: 'size' }}
      >
        <div
          ref={screenAreaRef}
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
            onEdit={isLiveMode ? undefined : handleSourceEdit}
            editingSourceIdx={editingSourceIdx}
            swapSourceIdx={swapSourceIdx}
            fullscreenIdx={fullscreenIdx}
            onSwitch={isLiveMode ? undefined : handleSwitch}
            gridColumns={gridColumns}
            onSourceChange={isZappingMode ? handleSourceChange : undefined}
            onFullscreenSourceChange={
              isLiveMode ? undefined : handleSourceChange
            }
          />
        </div>
        {/* Pointer controls: a remote has OK, Back and the picker for all of
            them, and nothing to click these with. */}
        {!isTv && floatingControls}
      </div>

      {isEditing && !isMobile && <ControlBar className="w-full flex-none" />}
    </div>
  );

  if (isMobile)
    return (
      <div className="flex h-[100dvh] flex-col overflow-hidden">
        <div className="flex min-h-0 min-w-0 flex-1 flex-row">
          {isLandscape && isEditing && (
            <div className="flex h-full w-[300px] max-w-[45%] flex-none flex-col overflow-y-auto border-r border-gray-800 p-2">
              {picker}
            </div>
          )}
          {monitorColumn}
        </div>

        <MobileNav isOpen={isEditing}>{!isLandscape && picker}</MobileNav>
      </div>
    );

  return (
    <div className="flex h-screen overflow-hidden">
      {isEditing && (
        <div
          className="flex h-full flex-none flex-col overflow-y-auto border-r border-gray-800 p-3"
          style={{ width: PICKER_WIDTH }}
        >
          {picker}
        </div>
      )}
      {monitorColumn}
    </div>
  );
};
