'use client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import axios from 'axios';
import { useMemo, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import useLocalStorageState from 'use-local-storage-state';
import { useTeleContext } from '../../context/TeleContext';
import { useCustomSources } from '../../hooks/useCustomSources';
import {
  DEFAULT_GRID_SIZE,
  useDisplayConfig
} from '../../hooks/useDisplayConfig';
import { useFeaturedScreen } from '../../hooks/useFeaturedScreen';
import { useSavedGrid } from '../../hooks/useSavedGrid';
import { useZappingToken } from '../../hooks/useZappingConfig';
import { SourceType } from '../../sources';
import { DisplayMode, GridSize, ScreenType } from '../../types/Monitor';
import { uuid } from '../../utils/uuid';
import { ScreenOptions } from '../ScreenOptions/ScreenOptions';
import { LayoutPicker } from '../SelectSource/LayoutPicker';
import { SourceSlider } from '../SelectSource/SourceSlider';
import { OnSwitchCb } from './MonitorSource';
import { Screen } from './Screen';

type SavedScreen = {
  name: string;
  screen: ScreenType;
};
export const useSavedScreens = () => {
  return useLocalStorageState<SavedScreen[]>('_saved_screens_', {
    defaultValue: []
  });
};

type PanelTab = 'sources' | 'layouts';

const Shortcut = ({ keys, label }: { keys: string; label: string }) => (
  <div>
    <span className="font-bold text-xl">{keys}</span> {label}
  </div>
);

export const Monitor = () => {
  const { toggleEditting, isEditing, editingSourceIdx, setEditingSourceIdx } =
    useTeleContext();
  const [selectedSources, setSelectedSources] = useSavedGrid();
  const [displayConfig, setDisplayConfig] = useDisplayConfig();
  const { customSources } = useCustomSources();
  const [zappingToken] = useZappingToken();
  const [, setFeaturedMonitor] = useFeaturedScreen();
  const [activeTab, setActiveTab] = useState<PanelTab>('sources');

  const screen: ScreenType = useMemo(
    () => ({
      config: displayConfig,
      sources: selectedSources,
      zappingToken,
      customSources
    }),
    [displayConfig, selectedSources, zappingToken, customSources]
  );

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
      : selectedSources?.length ?? 0;

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

  const handleSourceEdit = (newIdx: number) => {
    // if it's already being edited, unselect it
    setEditingSourceIdx(current => (current !== newIdx ? newIdx : undefined));
    setActiveTab('sources');
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
      const leftBackup = { ...newSources[left] };
      newSources[left] = newSources[right];
      newSources[right] = leftBackup;
      return newSources;
    });
  };

  useHotkeys('e', () => toggleEditting());
  useHotkeys(
    '1,2,3,4,5,6,7,8,9',
    e => {
      if (!isEditing) return;
      const idx = Number(e.key) - 1;
      if (idx >= visibleScreenCount) return;
      setEditingSourceIdx(idx);
      setActiveTab('sources');
    },
    [isEditing, visibleScreenCount]
  );
  useHotkeys('escape', () => setEditingSourceIdx(undefined));
  useHotkeys('c', () => (isEditing ? setActiveTab('sources') : undefined), [
    isEditing
  ]);
  useHotkeys('l', () => (isEditing ? setActiveTab('layouts') : undefined), [
    isEditing
  ]);

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <div className="min-h-0 flex-1">
        <Screen
          screen={screen}
          onEdit={handleSourceEdit}
          onRemove={handleSourceRemove}
          editingSourceIdx={editingSourceIdx}
          onSwitch={handleSwitch}
        />
      </div>

      {isEditing && (
        <div className="flex-none overflow-y-auto p-3">
          <Tabs
            value={activeTab}
            onValueChange={value => setActiveTab(value as PanelTab)}
          >
            <TabsList>
              <TabsTrigger value="sources">Canales</TabsTrigger>
              <TabsTrigger value="layouts">Layouts</TabsTrigger>
            </TabsList>
            <TabsContent value="sources">
              {editingSourceIdx !== undefined ? (
                <SourceSlider
                  onSelect={handleSourceChange}
                  selectedSourceSlug={selectedSourceSlug}
                />
              ) : (
                <div className="p-6 text-center text-gray-400">
                  Selecciona una pantalla con las teclas 1-9 o con el botón
                  Cambiar
                </div>
              )}
            </TabsContent>
            <TabsContent value="layouts">
              <div className="flex flex-wrap items-start gap-6">
                <LayoutPicker />
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
            </TabsContent>
          </Tabs>

          <div className="mt-3 flex flex-row flex-wrap gap-3 text-sm">
            <Shortcut keys="E" label="Toggle Edit Mode" />
            <Shortcut keys="1-9" label="Select Screen" />
            <Shortcut keys="Esc" label="Deselect" />
            <Shortcut keys="C / L" label="Canales/Layouts" />
            {editingSourceIdx !== undefined && activeTab === 'sources' && (
              <>
                <Shortcut keys="↑ ↓" label="Switch Category" />
                <Shortcut keys="← →" label="Previous/Next Source" />
                <Shortcut keys="F" label="Toggle Favourite" />
                <Shortcut keys="Tab" label="Cycle Signal" />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
