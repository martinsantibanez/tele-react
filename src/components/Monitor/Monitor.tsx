'use client';
import {
  LayoutGrid,
  Maximize2,
  Minimize2,
  PanelsTopLeft,
  Pencil,
  Plus,
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
import { nextLiveOnlyView, useTeleContext } from '../../context/TeleContext';
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
import { hiddenTiles, useOffAir } from '../../hooks/useOffAir';
import { useSavedGrid } from '../../hooks/useSavedGrid';
import { TileRect, useStreamDeck } from '../../hooks/useStreamDeck';
import { useAudioBlocked } from '../../hooks/useAudioBlocked';
import { useResolveSource } from '../../hooks/useSourceCatalog';
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
import {
  useActiveCategory,
  useRevealSource
} from '../SelectSource/sourceCategories';
import { PLACEHOLDER_SOURCE_SLUG } from '../../sources/placeholder';
import { LiveOnlyBar } from './LiveOnlyBar';
import { gridColumnsFor } from '../SelectSource/layoutOptions';
import { ControlBar } from './ControlBar';
import { screenLabel } from './SavedScreensBar';
import { OnSwitchCb, PICKER_WIDTH } from './MonitorSource';
import { FOCUS_MIN_TILES } from './focusWall';
import { fillSlots, slotCount } from './predefinedLayouts';
import { Screen } from './Screen';
import { ShortcutsHelp } from './ShortcutsHelp';

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
    toggleMute,
    liveOnlyView,
    setLiveOnlyView
  } = useTeleContext();
  const { isMobile, isLandscape, isMobileLandscape } = useViewport();
  const isTv = useIsTv();
  const [selectedSources, setSelectedSources] = useSavedGrid();
  const [displayConfig, setDisplayConfig] = useDisplayConfig();
  const revealSource = useRevealSource();
  const [, setActiveCategory] = useActiveCategory();
  const resolveSource = useResolveSource();
  const [savedScreens] = useSavedScreens();
  const [activeScreenIndex, setActiveScreenIndex] = useActiveScreenIndex();
  // Kept as the saved screen it was turned on for, like the focus wall below.
  // Another screen is other channels: switching to one from fullscreen — the
  // deck's screen keys, the Pantallas tab beside the picture — would otherwise
  // fullscreen whatever tile sits at the same place there, and wake its reel
  // on a tile nobody asked to watch or zap with.
  const [fullscreenScreen, setFullscreenScreen] = useState<number>();
  const isFullscreen = fullscreenScreen === activeScreenIndex;
  const setIsFullscreen = (on: boolean) =>
    setFullscreenScreen(on ? activeScreenIndex : undefined);
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

  const visibleScreenCount = slotCount(displayConfig, activeSources);

  // Tiles that keep their place and number but are not on the wall: the
  // live-only ones off air, and regular channels kept past the grid's end. Not
  // tiles to be on either — nothing to see or hear, and no neighbours for the
  // arrows to find from them.
  const isOffAir = useOffAir();
  const hidden = useMemo(
    () =>
      isLiveMode
        ? new Set<number>()
        : hiddenTiles(displayConfig, activeSources, isOffAir, liveOnlyView),
    [isLiveMode, displayConfig, activeSources, isOffAir, liveOnlyView]
  );
  const isHiddenTile = (idx: number) => hidden.has(idx);
  /** The tiles on the wall, by their place in the screen. */
  const drawnTiles = useMemo(
    () =>
      Array.from({ length: visibleScreenCount }, (_, idx) => idx).filter(
        idx => !hidden.has(idx)
      ),
    [visibleScreenCount, hidden]
  );

  // A phone lays its grid out its own way. Elsewhere a grid holding more than
  // its arrangement does — live extras on air, a tile added by hand — widens
  // to the next one on offer (see `gridColumnsFor`).
  const gridColumns = useMemo(() => {
    if (isMobileLandscape && isGrid) return MOBILE_LANDSCAPE_GRID_COLUMNS;
    if (isMobile || !isGrid) return displayConfig.grid.size;
    return gridColumnsFor(displayConfig.grid.size, drawnTiles.length);
  }, [
    isMobileLandscape,
    isMobile,
    isGrid,
    displayConfig.grid.size,
    drawnTiles.length
  ]);

  // Between the grid and fullscreen sits the focus wall: the selected tile
  // enlarged, the others still playing as previews around it (see
  // `focusWallRects`). Picking a tile takes the grid there; the selected tile
  // is always the enlarged one, so picking another brings it in. Laid out for
  // a 16:9 monitor, so not on a phone, and for the walls of tiles — a layout
  // has its own big screen already.
  //
  // Kept as the saved screen it was turned on for: another one is other
  // channels, and opens on its grid.
  const [focusedScreen, setFocusedScreen] = useState<number>();
  const setIsFocused = (focused: boolean) =>
    setFocusedScreen(focused ? activeScreenIndex : undefined);
  const canFocus =
    !isMobile && (isGrid || isLiveMode) && drawnTiles.length >= FOCUS_MIN_TILES;
  const focusActive = focusedScreen === activeScreenIndex && canFocus;

  const monitorRatio = useMemo(() => {
    if (!isMobile || !isGrid) return 16 / 9;
    const drawn = visibleScreenCount - hidden.size;
    const rows = Math.ceil(drawn / gridColumns) || 1;
    return (16 * gridColumns) / (9 * rows);
  }, [isMobile, isGrid, gridColumns, visibleScreenCount, hidden]);

  const selectedSourceSlug = useMemo(
    () => selectedSources[editingSourceIdx]?.sourceSlug,
    [editingSourceIdx, selectedSources]
  );

  const selectedSignal = useMemo(
    () => selectedSources[editingSourceIdx]?.activeSignal,
    [editingSourceIdx, selectedSources]
  );

  const selectedTileHidden = isHiddenTile(editingSourceIdx);
  // Watched fullscreen when it went off air, the picture goes with it — before
  // the effect below moves the selection on. Left on, fullscreen would follow
  // the selection onto that tile: its reel wakes up there, finds the channel
  // foreign to the band being zapped, and puts the band's own on air — over a
  // tile nobody touched.
  if (selectedTileHidden && isFullscreen) setIsFullscreen(false);
  useEffect(() => {
    if (!selectedTileHidden) return;
    for (let idx = 0; idx < visibleScreenCount; idx++)
      if (!hidden.has(idx)) return setEditingSourceIdx(idx);
  }, [selectedTileHidden, hidden, visibleScreenCount, setEditingSourceIdx]);

  // The off-air tiles are shown to be managed, from the picker; closing it
  // puts the wall back to what is on. Hidden ones stay hidden.
  useEffect(() => {
    if (!isEditing) setLiveOnlyView(view => (view === 'all' ? 'live' : view));
  }, [isEditing, setLiveOnlyView]);

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
  // A Zapping channel takes ← → to rewind instead (see `ZappingSource`); E
  // still opens the picker beside it.
  const fullscreenNode = isFullscreen
    ? activeSources[editingSourceIdx]
    : undefined;
  const fullscreenRewinds = !!resolveSource(
    fullscreenNode?.sourceSlug,
    fullscreenNode?.source
  )?.zappingChannel;
  // Coming back out of fullscreen opens the picker again if it was open going
  // in, so a look at the picture does not end the editing.
  const pickerBeforeFullscreen = useRef(false);
  const leaveFullscreen = () => {
    setIsFullscreen(false);
    if (!pickerBeforeFullscreen.current) return;
    pickerBeforeFullscreen.current = false;
    revealScreenSource(editingSourceIdx);
    setIsEditing(true);
  };
  const toggleFullscreen = () => {
    if (isFullscreen) return leaveFullscreen();
    if (isLiveMode) {
      const slug = liveNodes[editingSourceIdx]?.sourceSlug;
      if (slug) setLiveFocusSlug(slug);
    }
    pickerBeforeFullscreen.current = isEditing;
    setIsEditing(false);
    setIsFullscreen(true);
  };
  /**
   * Steps the view a level in — the grid to the focus wall, then fullscreen —
   * and from fullscreen goes all the way back to the grid. Where there is no
   * focus wall it is fullscreen on and off.
   */
  const cycleView = () => {
    if (isFullscreen) {
      setIsFocused(false);
      leaveFullscreen();
    } else if (canFocus && !focusActive) setIsFocused(true);
    else toggleFullscreen();
  };

  const togglePicker = () => {
    if (!isEditing && !pickerBesideFullscreen) setIsFullscreen(false);
    toggleEditting();
  };

  const handleSourceChange = (source: SourceType) => {
    setSelectedSources(current => {
      if (!current) return current;
      // Topped up to reach the tile on a copy: the stored list is state, and
      // writing into it would change the screen behind React's back.
      const sources = fillSlots(current, editingSourceIdx + 1);
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

  /** Whether there was such a tile on the wall to select. */
  const selectScreen = (idx: number) => {
    if (idx < 0 || idx >= visibleScreenCount) return false;
    if (isHiddenTile(idx)) return false;
    if (isLiveMode) {
      setEditingSourceIdx(idx);
      setLiveFocusSlug(liveNodes[idx]?.sourceSlug);
      return true;
    }
    setEditingSourceIdx(idx);
    revealScreenSource(idx);
    return true;
  };

  /**
   * A tile picked out on purpose — clicked, its number pressed, its key on
   * the deck — rather than walked onto with the arrows: off the grid, it is
   * also enlarged. With the picker open a pick is only which tile to edit, and
   * the wall stays as it is.
   */
  const pickScreen = (idx: number) => {
    if (!selectScreen(idx)) return;
    if (canFocus && !isEditing && !isFullscreen) setIsFocused(true);
  };

  const selectScreenRef = useRef(pickScreen);
  selectScreenRef.current = pickScreen;

  const toggleLiveOnly = (idx: number) => {
    // Set while off air, or while they are hidden, the tile would vanish from
    // under the click.
    if (!selectedSources[idx]?.liveOnly) setLiveOnlyView('all');
    setSelectedSources(sources =>
      sources.map((src, i) =>
        i === idx ? { ...src, liveOnly: !src.liveOnly || undefined } : src
      )
    );
  };

  // A new extra goes at the very end, past everything kept out of sight, and
  // is selected, so the next channel picked lands on it; the favourites are
  // where the channels it is for are listed, live or not.
  const addLiveOnlyTile = () => {
    const idx = selectedSources.length;
    setSelectedSources(sources => [
      ...sources,
      { sourceSlug: PLACEHOLDER_SOURCE_SLUG, uuid: uuid(), liveOnly: true }
    ]);
    setLiveOnlyView('all');
    setEditingSourceIdx(idx);
    setActiveCategory('youtube');
  };

  // A grid's tiles can be added and taken away again by hand, from a
  // computer: a phone sets its own count, and a TV has no pointer for it.
  const canEditTiles = isGrid && !isLiveMode && !isMobile && !isTv;
  const gridCount = displayConfig.grid.count ?? selectedSources.length;

  // A new tile joins the grid's own, after the last of them: before the
  // channels kept out of sight and the live extras. Selected, so the next
  // channel picked lands on it.
  const addTile = () => {
    const at = gridCount;
    // Everything after it moves along one, the tile marked for a swap too.
    setSwapSourceIdx(undefined);
    setSelectedSources(sources => [
      ...sources.slice(0, at),
      { sourceSlug: PLACEHOLDER_SOURCE_SLUG, uuid: uuid() },
      ...sources.slice(at)
    ]);
    setDisplayConfig(cfg => ({
      ...cfg,
      grid: { ...cfg.grid, count: gridCount + 1 }
    }));
    setEditingSourceIdx(at);
  };

  // A grid tile takes its place with it, so the grid is one smaller rather
  // than the next channel kept out of sight taking it over. A live extra is
  // not one of the grid's, and only goes.
  const removeTile = (idx: number) => {
    const isExtra = !!selectedSources[idx]?.liveOnly && idx >= gridCount;
    if (!isExtra && gridCount <= 1) return;
    setSwapSourceIdx(undefined);
    setIsFullscreen(false);
    setSelectedSources(sources => sources.filter((_, i) => i !== idx));
    // The tiles after it move back one, and the selection goes with its own
    // channel: left where it was, it would land on the next one along, and
    // the next channel picked would replace that one.
    if (idx < editingSourceIdx) setEditingSourceIdx(editingSourceIdx - 1);
    if (!isExtra && idx < gridCount)
      setDisplayConfig(cfg => ({
        ...cfg,
        grid: { ...cfg.grid, count: gridCount - 1 }
      }));
  };

  const liveOnlyTiles = activeSources.filter(node => node.liveOnly);

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
      else if (!isFullscreen && hasGridLevel) {
        // A level at a time: the grid to the focus wall, and on to fullscreen.
        if (canFocus && !focusActive) setIsFocused(true);
        else toggleFullscreen();
      }
    },
    onLongPress: swapStep
  });

  useHotkeys('e', () => togglePicker(), [togglePicker]);
  useHotkeys(
    [
      '1,2,3,4,5,6,7,8,9',
      'shift+1,shift+2,shift+3,shift+4,shift+5,shift+6,shift+7,shift+8,shift+9'
    ].join(','),
    // Counted along the tiles on the wall, as their numbers and the deck's
    // keys are: an off-air tile left out takes no key.
    e => {
      const at = getIndexFromKeyEvent(e);
      const idx = at === undefined ? undefined : drawnTiles[at];
      if (idx === undefined) return;
      pickScreen(idx);
    },
    [
      drawnTiles,
      canFocus,
      isFullscreen,
      isEditing,
      visibleScreenCount,
      swapSourceIdx,
      isLiveMode,
      liveNodes,
      selectedSources,
      revealSource
    ]
  );
  useHotkeys('g', () => cycleView(), [
    canFocus,
    focusActive,
    activeScreenIndex,
    isLiveMode,
    isFullscreen,
    isEditing,
    liveNodes,
    editingSourceIdx,
    selectedSources,
    revealSource
  ]);
  useHotkeys(
    'escape',
    () => {
      if (isFullscreen) {
        if (isEditing) setIsEditing(false);
        else leaveFullscreen();
        return;
      }
      if (swapSourceIdx !== undefined) {
        setSwapSourceIdx(undefined);
        return;
      }
      if (focusActive && !isEditing) {
        setIsFocused(false);
        return;
      }
      // From the grid Back opens the picker on the selected screen; from the
      // picker it closes it again. On the TV a second Back in quick
      // succession leaves the app, so this never traps the remote.
      if (!isEditing) revealScreenSource(editingSourceIdx);
      setIsEditing(current => !current);
    },
    [
      isFullscreen,
      swapSourceIdx,
      focusActive,
      isEditing,
      editingSourceIdx,
      selectedSources,
      revealSource
    ]
  );

  // With the picker away, the arrows walk the tiles. The picker owns them
  // while it is open, and so does the reel while a tile is fullscreen.
  const gridArrows = !isEditing && !isFullscreen && hasGridLevel;
  const moveSelection = (direction: 'up' | 'down' | 'left' | 'right') => {
    // On the focus wall each step brings the next tile in. The one being
    // watched is not in its own cell but filling the corner, so there is no
    // place to step from: the arrows go by the tiles' order instead, the
    // order their cells run in, round and round.
    if (focusActive) {
      const at = drawnTiles.indexOf(editingSourceIdx);
      const step = direction === 'left' || direction === 'up' ? -1 : 1;
      const count = drawnTiles.length;
      selectScreen(drawnTiles[(at + step + count) % count]);
      return;
    }
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
      enabled:
        isFullscreen &&
        !isEditing &&
        pickerBesideFullscreen &&
        !fullscreenRewinds,
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
  const audioBlocked = useAudioBlocked();
  // A Stream Deck copies the monitor onto its keys: the tiles where they are
  // on screen, with the saved screens and mute beside them. See `streamdeck/`.
  useStreamDeck({
    state: {
      screens: savedScreens.map((saved, idx) => ({
        name: screenLabel(saved.name, idx)
      })),
      activeScreen: activeScreenIndex,
      // Only what is on the wall: a tile kept out of sight has no place for a
      // key, and one without a place throws the deck off its arrangement. The
      // deck numbers them in this order, so its presses are mapped back.
      tiles: drawnTiles.map(idx => {
        const node = activeSources[idx];
        const source = resolveSource(node?.sourceSlug, node?.source);
        return {
          name: source?.name ?? node?.sourceSlug ?? '',
          logo: source?.logoUrl ?? source?.imageUrl
        };
      }),
      selectedTile: drawnTiles.indexOf(editingSourceIdx),
      fullscreen: isFullscreen,
      muted: isMuted,
      audioBlocked
    },
    measureTiles: () => {
      // The reel is one channel filling the monitor.
      if (isZappingMode) return [[0, 0, 1, 1]];
      const fraction = (value: number) => Math.round(value * 1000) / 1000;
      // The deck keeps the grid while the monitor is on the focus wall: each
      // pick there moves the tiles, and the keys would move under the finger.
      if (focusActive) {
        const cols = isGrid
          ? gridColumns
          : Math.ceil(Math.sqrt(activeSources.length));
        const rows = Math.ceil(drawnTiles.length / cols);
        return drawnTiles.map((_, n) => {
          const col = n % cols;
          const row = Math.floor(n / cols);
          return [
            fraction(col / cols),
            fraction(row / rows),
            fraction((col + 1) / cols),
            fraction((row + 1) / rows)
          ];
        });
      }
      const area = screenAreaRef.current;
      const box = area?.getBoundingClientRect();
      if (!area || !box?.width || !box.height) return [];
      const rects: TileRect[] = [];
      area.querySelectorAll<HTMLElement>('[data-screen-idx]').forEach(el => {
        const idx = Number(el.dataset.screenIdx);
        if (Number.isNaN(idx) || rects[idx]) return;
        // The tile's cell, not the tile: a fullscreen tile leaves its cell
        // behind in the arrangement.
        const cell = (el.parentElement ?? el).getBoundingClientRect();
        rects[idx] = [
          fraction((cell.left - box.left) / box.width),
          fraction((cell.top - box.top) / box.height),
          fraction((cell.right - box.left) / box.width),
          fraction((cell.bottom - box.top) / box.height)
        ];
      });
      return drawnTiles.map(idx => rects[idx]);
    },
    layoutKey: `${JSON.stringify(displayConfig)}|${gridColumns}|${drawnTiles}|${focusActive}`,
    onCommand: command => {
      if (command.type === 'screen') {
        if (command.index < savedScreens.length)
          setActiveScreenIndex(command.index);
      } else if (command.type === 'tile') {
        const idx = drawnTiles[command.index];
        if (idx === undefined) return;
        if (idx !== editingSourceIdx) return pickScreen(idx);
        // Pressing the tile that is heard again steps it up a level, and from
        // fullscreen all the way back to the grid, as the deck has no Back
        // key of its own.
        if (hasGridLevel || isFullscreen) cycleView();
      } else toggleMute();
    }
  });
  useHotkeys('m', () => toggleMute(), [toggleMute]);
  // Unfolds every shortcut under the picker. Browsers open their own help on
  // F1, so it is taken from them.
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  useHotkeys('f1', () => setIsHelpOpen(open => !open), {
    enabled: !isTv && !isMobile,
    preventDefault: true
  });
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

      {isGrid && !isLiveMode && (
        <LiveOnlyBar
          total={liveOnlyTiles.length}
          onAir={liveOnlyTiles.filter(node => !isOffAir(node)).length}
          view={liveOnlyView}
          onCycleView={() => setLiveOnlyView(nextLiveOnlyView)}
          onAdd={addLiveOnlyTile}
        />
      )}
      {/* The full list folds away behind F1; only what the current state
          changes is always written out: a swap halfway done. */}
      {!isMobile && !isTv && (
        <div className="mt-2 flex flex-none flex-col gap-1 text-xs text-gray-300">
          {swapSourceIdx !== undefined && (
            <>
              <Shortcut
                keys="Enter"
                label={`Intercambiar con ${getSourceShortcutLabel(drawnTiles.indexOf(swapSourceIdx))}`}
              />
              <Shortcut keys="Esc" label="Cancelar intercambio" />
            </>
          )}
          {isHelpOpen && <ShortcutsHelp />}
          <button
            type="button"
            onClick={() => setIsHelpOpen(open => !open)}
            aria-expanded={isHelpOpen}
            className="self-start text-[10px] leading-none text-gray-400 hover:text-white"
          >
            <span className="font-bold">F1</span>{' '}
            {isHelpOpen ? 'ocultar atajos' : 'atajos de teclado'}
          </button>
        </div>
      )}
      {/* A remote has no F1, and only these few keys. */}
      {isTv && (
        <div className="mt-3 flex flex-none flex-col gap-1 text-xs text-gray-300">
          <Shortcut
            keys="OK"
            label={
              swapSourceIdx === undefined
                ? 'Ver pantallas'
                : `Intercambiar con ${getSourceShortcutLabel(drawnTiles.indexOf(swapSourceIdx))}`
            }
          />
          {canSwap && swapSourceIdx === undefined && (
            <Shortcut keys="Mantener OK" label="Marcar para Intercambiar" />
          )}
          <Shortcut
            keys="Atrás"
            label={
              swapSourceIdx === undefined
                ? 'Cerrar selector'
                : 'Cancelar intercambio'
            }
          />
          {savedScreens.length > 1 && (
            <Shortcut keys="CH− / CH+" label="Cambiar pantalla guardada" />
          )}
        </div>
      )}
    </>
  );

  const floatingControls = (
    // Fullscreen they sit level with the player's control bar, which is as
    // tall as they are (see globals.css).
    <div
      className={`absolute right-2 z-[60] flex items-center gap-2 ${
        isFullscreen ? 'bottom-[1px]' : 'bottom-2'
      }`}
    >
      <FloatingButton
        onClick={toggleMute}
        label={isMuted ? 'Activar el audio (M)' : 'Silenciar (M)'}
      >
        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
      </FloatingButton>
      <FloatingButton
        onClick={toggleFullscreen}
        label={
          isFullscreen
            ? 'Salir de pantalla completa (G)'
            : canFocus && !focusActive
              ? 'Pantalla completa'
              : 'Pantalla completa (G)'
        }
      >
        {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
      </FloatingButton>
      {canFocus && !isFullscreen && (
        <FloatingButton
          onClick={() => setIsFocused(!focusActive)}
          label={
            focusActive
              ? 'Volver a la grilla (Esc)'
              : 'Destacar pantalla (Enter / G)'
          }
        >
          {focusActive ? <LayoutGrid size={20} /> : <PanelsTopLeft size={20} />}
        </FloatingButton>
      )}
      {isEditing && canEditTiles && (
        <FloatingButton onClick={addTile} label="Agregar pantalla">
          <Plus size={20} />
        </FloatingButton>
      )}
      <FloatingButton
        onClick={togglePicker}
        label={isEditing ? 'Salir de edición (E)' : 'Editar canales (E)'}
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
            onSelect={pickScreen}
            onEdit={isLiveMode ? undefined : handleSourceEdit}
            editingSourceIdx={editingSourceIdx}
            swapSourceIdx={swapSourceIdx}
            fullscreenIdx={fullscreenIdx}
            focusIdx={focusActive ? editingSourceIdx : undefined}
            onSwitch={isLiveMode ? undefined : handleSwitch}
            gridColumns={gridColumns}
            onSourceChange={isZappingMode ? handleSourceChange : undefined}
            onFullscreenSourceChange={
              isLiveMode ? undefined : handleSourceChange
            }
            onToggleLiveOnly={isLiveMode ? undefined : toggleLiveOnly}
            onRemove={canEditTiles ? removeTile : undefined}
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
