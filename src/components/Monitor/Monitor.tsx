import axios from 'axios';
import { useMemo } from 'react';
import useLocalStorageState from 'use-local-storage-state';
import { useTeleContext } from '../../context/TeleContext';
import { useCustomSources } from '../../hooks/useCustomSources';
import { useDisplayConfig } from '../../hooks/useDisplayConfig';
import { useFeaturedScreen } from '../../hooks/useFeaturedScreen';
import { useSavedGrid } from '../../hooks/useSavedGrid';
import { useZappingConfig } from '../../hooks/useZappingConfig';
import { Screen } from '../../pages/monitor/Screen';
import { DisplayMode, ScreenType } from '../../pages/monitor/types';
import { SourceType } from '../../sources';
import { uuid } from '../../utils/uuid';
import { ScreenOptions } from '../ScreenOptions/ScreenOptions';
import { SelectSource } from '../SelectSource/SelectSource';
import { OnSwitchCb } from './Source';

type SavedScreen = {
  name: string;
  screen: ScreenType;
};
export const useSavedScreens = () => {
  return useLocalStorageState<SavedScreen[]>('__saved_screens__', {
    defaultValue: [],
    ssr: false
  });
};

export const Monitor = () => {
  const { isEditing, editingSourceIdx, setEditingSourceIdx } = useTeleContext();
  const [selectedSources, setSelectedSources] = useSavedGrid();
  const [displayConfig, setDisplayConfig] = useDisplayConfig();
  const { customSources } = useCustomSources();
  const { zappingConfig } = useZappingConfig();
  const [, setFeaturedMonitor] = useFeaturedScreen();

  const screen: ScreenType = useMemo(
    () => ({
      config: displayConfig,
      sources: selectedSources,
      zappingConfig,
      customSources
    }),
    [displayConfig, selectedSources, zappingConfig, customSources]
  );

  const selectedSourceSlug = useMemo(
    () =>
      typeof editingSourceIdx === 'number'
        ? selectedSources[editingSourceIdx]?.sourceSlug
        : undefined,
    [editingSourceIdx, selectedSources]
  );

  const handlePromote = () => {
    setFeaturedMonitor(screen);
  };

  const handleModeChange = (mode: DisplayMode) => {
    if (mode === DisplayMode.Grid) {
      setDisplayConfig(cfg => ({
        ...cfg,
        mode,
        grid: { size: cfg.grid?.size || 4 }
      }));
    } else {
      setDisplayConfig(cfg => ({
        ...cfg,
        mode
      }));
    }
  };
  const handleSizeChange = (newSize: number) => {
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
      console.log({ sources });
      if (!sources) return sources;
      const newSources = [...sources];
      const leftBackup = { ...newSources[left] };
      newSources[left] = newSources[right];
      newSources[right] = leftBackup;
      console.log({ newSources });
      return newSources;
    });
  };

  return (
    <div className="row">
      <div className={isEditing ? 'col-xl-10 col-lg-12' : 'col-12'}>
        {typeof window !== 'undefined' && (
          <Screen
            screen={screen}
            onEdit={handleSourceEdit}
            onRemove={handleSourceRemove}
            editingSourceIdx={editingSourceIdx}
            onSwitch={handleSwitch}
          />
        )}
      </div>
      {isEditing && (
        <>
          <div className="col-xl-2 col-lg-12 pe-4">
            <SelectSource
              onSelect={handleSourceChange}
              selectedSourceSlug={selectedSourceSlug}
            />
          </div>
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
        </>
      )}
    </div>
  );
};
