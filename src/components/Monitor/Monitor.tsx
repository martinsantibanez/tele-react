'use client';
import axios from 'axios';
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
  DEFAULT_GRID_SIZE,
  MOBILE_GRID_SIZE,
  MOBILE_LANDSCAPE_GRID_COLUMNS,
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
import { PLACEHOLDER_SOURCE_SLUG } from '../../sources/placeholder';
import { DisplayMode, GridSize, ScreenType } from '../../types/Monitor';
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
import { fitSourcesToLayout } from './predefinedLayouts';
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
  const [selectedSources, setSelectedSources] = useSavedGrid();
  const [displayConfig, setDisplayConfig] = useDisplayConfig();
  const [, setFeaturedMonitor] = useFeaturedScreen();
  const [activeCategory] = useActiveCategory();
  const revealSource = useRevealSource();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenZapping, setFullscreenZapping] = useFullscreenZapping();
  useYoutubeLoginScreen();

  const isYoutubeMode = displayConfig.mode === DisplayMode.Youtube;

  const { nodes: youtubeNodes } = useYoutubeGridSources({
    frozen: isYoutubeMode && isFullscreen
  });

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

  const youtubeFocusIdx = youtubeIdxOf(youtubeFocusSlug);
  useEffect(() => {
    if (!isYoutubeMode || youtubeFocusIdx === undefined) return;
    setEditingSourceIdx(youtubeFocusIdx);
  }, [isYoutubeMode, youtubeFocusIdx, setEditingSourceIdx]);

  const activeSources = isYoutubeMode ? youtubeNodes : selectedSources;

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

  const visibleScreenCount = isYoutubeMode
    ? youtubeNodes.length
    : isZappingMode
      ? 1
      : displayConfig.mode === DisplayMode.Layout
        ? displayConfig.layout.length
        : (selectedSources?.length ?? 0);

  useEffect(() => {
    if (!visibleScreenCount) return;
    setEditingSourceIdx(current => Math.min(current, visibleScreenCount - 1));
  }, [visibleScreenCount, setEditingSourceIdx]);

  useEffect(() => {
    if (isMobile) setIsEditing(false);
  }, [isMobile, setIsEditing]);

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

  useEffect(() => {
    if (isMobile || displayConfig.mode !== DisplayMode.Layout) return;
    if (selectedSources.length === displayConfig.layout.length) return;
    setSelectedSources(sources =>
      fitSourcesToLayout(sources, displayConfig.layout)
    );
  }, [
    isMobile,
    displayConfig.mode,
    displayConfig.layout,
    selectedSources.length,
    setSelectedSources
  ]);

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
        sourceSlug: PLACEHOLDER_SOURCE_SLUG,
        uuid: uuid()
      }
    ]);
  };

  const canRemoveScreen = isGrid && (selectedSources?.length ?? 0) > 1;

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

  const revealScreenSource = (idx: number) =>
    revealSource(selectedSources[idx]?.sourceSlug);

  const handleSourceEdit = (newIdx: number) => {
    setEditingSourceIdx(newIdx);
    revealScreenSource(newIdx);
  };

  const selectScreen = (idx: number) => {
    if (idx < 0 || idx >= visibleScreenCount) return;
    if (isYoutubeMode) {
      setEditingSourceIdx(idx);
      setYoutubeFocusSlug(youtubeNodes[idx]?.sourceSlug);
      return;
    }
    setEditingSourceIdx(idx);
    revealScreenSource(idx);
  };

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

  useHotkeys('e', () => toggleEditting(), [toggleEditting]);
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
  useHotkeys('m', () => toggleMute(), [toggleMute]);
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
          <Shortcut keys="M" label={isMuted ? 'Activar Audio' : 'Silenciar'} />
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
        onClick={toggleEditting}
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
            onRemove={canRemoveScreen ? handleSourceRemove : undefined}
            editingSourceIdx={editingSourceIdx}
            swapSourceIdx={swapSourceIdx}
            fullscreenIdx={fullscreenIdx}
            onSwitch={isYoutubeMode ? undefined : handleSwitch}
            gridColumns={gridColumns}
            onSourceChange={isZappingMode ? handleSourceChange : undefined}
            onFullscreenSourceChange={
              fullscreenZapping && !isYoutubeMode
                ? handleSourceChange
                : undefined
            }
          />
        </div>
        {floatingControls}
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
        <div className="flex h-full w-[340px] flex-none flex-col overflow-y-auto border-r border-gray-800 p-3">
          {picker}
        </div>
      )}
      {monitorColumn}
    </div>
  );
};
