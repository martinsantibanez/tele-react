'use client';
import axios from 'axios';
import { useMemo, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useTeleContext } from '../../context/TeleContext';
import { useCustomSources } from '../../hooks/useCustomSources';
import {
  DEFAULT_GRID_SIZE,
  useDisplayConfig
} from '../../hooks/useDisplayConfig';
import { useFeaturedScreen } from '../../hooks/useFeaturedScreen';
import { useSavedGrid } from '../../hooks/useSavedGrid';
import { SourceType } from '../../sources';
import { DisplayMode, GridSize, ScreenType } from '../../types/Monitor';
import {
  getIndexFromKeyEvent,
  getSourceShortcutLabel
} from '../../utils/sourceShortcut';
import { uuid } from '../../utils/uuid';
import { ScreenOptions } from '../ScreenOptions/ScreenOptions';
import { SourceSlider, useActiveCategory } from '../SelectSource/SourceSlider';
import { OnSwitchCb } from './MonitorSource';
import { Screen } from './Screen';

const Shortcut = ({ keys, label }: { keys: string; label: string }) => (
  <div>
    <span className="font-bold text-xl">{keys}</span> {label}
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
  const { customSources } = useCustomSources();
  const [, setFeaturedMonitor] = useFeaturedScreen();
  const [activeCategory, setActiveCategory] = useActiveCategory();
  const [isFullscreen, setIsFullscreen] = useState(false);

  const screen: ScreenType = useMemo(
    () => ({
      config: displayConfig,
      sources: selectedSources,
      customSources
    }),
    [displayConfig, selectedSources, customSources]
  );

  const fullscreenIdx =
    isFullscreen && typeof editingSourceIdx === 'number'
      ? editingSourceIdx
      : undefined;

  const selectedSourceSlug = useMemo(
    () =>
      typeof editingSourceIdx === 'number'
        ? selectedSources[editingSourceIdx]?.sourceSlug
        : undefined,
    [editingSourceIdx, selectedSources]
  );

  const visibleScreenCount =
    displayConfig.mode === DisplayMode.Layout
      ? displayConfig.layout.length
      : (selectedSources?.length ?? 0);

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

  const handleSourceRemove = (idx: number) => {
    setSwapSourceIdx(undefined);
    setSelectedSources(sources => {
      if (!sources) return sources;
      return sources.filter((src, index) => index !== idx);
    });
  };

  const handleSourceChange = (source: SourceType) => {
    if (editingSourceIdx === undefined) return;
    setSelectedSources(sources => {
      if (!sources) return sources;
      if (sources.length < editingSourceIdx + 1) {
        for (let i = sources.length; i <= editingSourceIdx; i++) {
          sources[i] = { uuid: uuid() };
        }
      }
      return sources.map((src, idx) => {
        if (editingSourceIdx === idx)
          return { ...src, sourceSlug: source.slug };
        else return src;
      });
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

  // Leaving the layouts category falls back to the channels list.
  const showSources = () =>
    setActiveCategory(category => (category === 'layouts' ? 'tv' : category));

  const handleSourceEdit = (newIdx: number) => {
    // if it's already being edited, unselect it
    setEditingSourceIdx(current => (current !== newIdx ? newIdx : undefined));
    showSources();
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

  useHotkeys('e', () => toggleEditting());
  useHotkeys(
    [
      '1,2,3,4,5,6,7,8,9',
      'shift+1,shift+2,shift+3,shift+4,shift+5,shift+6,shift+7,shift+8,shift+9'
    ].join(','),
    e => {
      const idx = getIndexFromKeyEvent(e);
      if (idx === undefined || idx >= visibleScreenCount) return;
      setEditingSourceIdx(idx);
      if (!isEditing) {
        if (swapSourceIdx === undefined) handleSoloAudio(idx);
        return;
      }
      showSources();
    },
    [isEditing, visibleScreenCount, swapSourceIdx]
  );
  useHotkeys(
    'enter',
    () => {
      if (editingSourceIdx === undefined) return;
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
    [editingSourceIdx, swapSourceIdx]
  );
  useHotkeys(
    'g',
    () => {
      if (editingSourceIdx === undefined) {
        setIsFullscreen(false);
        return;
      }
      setIsFullscreen(current => !current);
    },
    [editingSourceIdx]
  );
  useHotkeys(
    'escape',
    () => {
      if (isFullscreen) {
        setIsFullscreen(false);
        return;
      }
      setSwapSourceIdx(undefined);
      setEditingSourceIdx(undefined);
    },
    [isFullscreen]
  );
  useHotkeys(
    'm',
    () => {
      if (editingSourceIdx === undefined || swapSourceIdx !== undefined) return;
      handleToggleMute(editingSourceIdx);
    },
    [editingSourceIdx, swapSourceIdx]
  );
  useHotkeys('c', () => (isEditing ? showSources() : undefined), [isEditing]);
  useHotkeys(
    'l',
    () => (isEditing ? setActiveCategory('layouts') : undefined),
    [isEditing]
  );

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <div className="min-h-0 flex-1">
        <Screen
          screen={screen}
          onEdit={handleSourceEdit}
          onRemove={handleSourceRemove}
          editingSourceIdx={editingSourceIdx}
          swapSourceIdx={swapSourceIdx}
          fullscreenIdx={fullscreenIdx}
          onSwitch={handleSwitch}
        />
      </div>

      {isEditing && (
        <div className="flex-none overflow-y-auto p-3">
          <SourceSlider
            onSelect={handleSourceChange}
            selectedSourceSlug={selectedSourceSlug}
            noScreenSelected={editingSourceIdx === undefined}
          />

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

          <div className="mt-3 flex flex-row flex-wrap gap-3 text-sm">
            <Shortcut keys="E" label="Toggle Edit Mode" />
            <Shortcut keys="1-9 / ⇧1-9" label="Select Screen" />
            <Shortcut keys="Esc" label="Deselect" />
            <Shortcut
              keys="Enter"
              label={
                swapSourceIdx === undefined
                  ? 'Marcar para Intercambiar'
                  : `Intercambiar con ${getSourceShortcutLabel(swapSourceIdx)}`
              }
            />
            <Shortcut keys="C / L" label="Canales/Layouts" />
            {editingSourceIdx !== undefined && (
              <Shortcut
                keys="G"
                label={
                  isFullscreen ? 'Salir Pantalla Completa' : 'Pantalla Completa'
                }
              />
            )}
            {editingSourceIdx !== undefined && (
              <Shortcut
                keys="M"
                label={
                  (selectedSources?.[editingSourceIdx]?.muted ?? true)
                    ? 'Activar Audio'
                    : 'Silenciar'
                }
              />
            )}
            <Shortcut keys="↑ ↓" label="Switch Category" />
            {activeCategory === 'layouts' ? (
              <Shortcut keys="← →" label="Previous/Next Layout" />
            ) : (
              editingSourceIdx !== undefined && (
                <>
                  <Shortcut keys="← →" label="Previous/Next Source" />
                  <Shortcut keys="F" label="Toggle Favourite" />
                  <Shortcut keys="Tab" label="Cycle Signal" />
                </>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
};
