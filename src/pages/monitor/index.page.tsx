import axios from 'axios';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useMemo } from 'react';
import { ScreenOptions } from '../../components/ScreenOptions/ScreenOptions';
import { SourceAccordionList } from '../../components/SelectSource/SourceAccordionList';
import { useTeleContext } from '../../context/TeleContext';
import { useDisplayConfig } from '../../hooks/useDisplayConfig';
import { useFeaturedScreen } from '../../hooks/useFeaturedScreen';
import { useSavedGrid } from '../../hooks/useSavedGrid';
import { MainLayout } from '../../layout/MainLayout';
import { Source } from '../../sources';
import { uuid } from '../../utils/uuid';
import { Screen } from './Screen';
import { DisplayMode, ScreenType } from './types';

const MonitorPage: NextPage = () => {
  const { isEditing, editingSourceIdx, setEditingSourceIdx } = useTeleContext();
  const [selectedSources, setSelectedSources] = useSavedGrid();
  const [displayConfig, setDisplayConfig] = useDisplayConfig();
  const [, setFeaturedMonitor] = useFeaturedScreen();

  const screen: ScreenType = useMemo(
    () => ({
      config: displayConfig,
      sources: selectedSources
    }),
    [displayConfig, selectedSources]
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

  const handleSourceChange = (source: Source) => {
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

  const handleSourceEdit = (idx: number) => {
    setEditingSourceIdx(idx);
  };
  const router = useRouter();

  const handleShare = async () => {
    const response = await axios.post('/api/share', screen);
    prompt(
      `Enlace para compartir. Valido por 24 horas.`,
      `${window.location.origin}/shared/${response.data.uuid}`
    );
  };

  return (
    <MainLayout>
      <Head>
        <title>Ver Tele</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="row">
        <div className={isEditing ? 'col-8' : 'col-12'}>
          {typeof window !== 'undefined' && (
            <Screen
              screen={screen}
              onEdit={handleSourceEdit}
              onRemove={handleSourceRemove}
              editingSourceIdx={editingSourceIdx}
            />
          )}
        </div>
        {isEditing && (
          <>
            <div className="col-4 pe-4">
              <SourceAccordionList
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
            {/* <button onClick={() => handleShare()}>Share</button> */}
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default MonitorPage;
