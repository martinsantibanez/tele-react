'use client';
import { useCallback, useEffect, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { SourceOutput } from '../../components/Monitor/SourceOutput/SourceOutput';
import { SourceSlider } from '../../components/SelectSource/SourceSlider';
import { canalesZapping } from '../../components/SelectSource/ZappingSelector/canales';
import {
  ZappingConfig,
  zappingSources
} from '../../components/SelectSource/ZappingSelector/ZappingConfig';
import { useCustomSources } from '../../hooks/useCustomSources';
import { useDuoState } from '../../hooks/useDuoState';
import { sourcesCategories, SourceType } from '../../sources';
import useLocalStorageState from 'use-local-storage-state';

export const useTwitchToken = () =>
  useLocalStorageState<string>('_tele_twitch_token_');

export const DuoPage = () => {
  const [isEditing, setIsEditing] = useState(true);
  const [invertControl, setInvertControl] = useState(false);

  const [, setTwitchToken] = useTwitchToken();

  useEffect(() => {
    if (document.location.hash) {
      const parsedHash = new URLSearchParams(window.location.hash.substring(1));
      if (parsedHash.get('access_token')) {
        setTwitchToken(parsedHash.get('access_token') || undefined);
      }
    }
  }, [setTwitchToken]);

  useHotkeys('i', () => setInvertControl(v => !v), { preventDefault: true });
  useHotkeys('e', () => setIsEditing(v => !v), { preventDefault: true });

  const [sources, setSources] = useDuoState();

  const handlePreviewChange = (source: SourceType) => {
    setSources(prev => ({ ...prev, preview: source.slug }));
  };
  const handleProgramChange = (source: SourceType) => {
    setSources(prev => ({ ...prev, program: source.slug }));
  };

  const handleSourceSwap = () => {
    setSources(sources => {
      if (!sources) return sources;
      const newSources = { ...sources };
      const oldPreview = newSources.preview;
      newSources.preview = newSources.program;
      newSources.program = oldPreview;
      return newSources;
    });
  };
  const index = zappingSources.findIndex(s => s.slug === sources.program);
  const image = Object.values(canalesZapping)[index]?.image;
  const activeImg = image
    ? `https://davinci.zappingtv.com/gato/media/128/canales/white/${image}.png`
    : undefined;
  const { customSources } = useCustomSources();

  const getSource = useCallback(
    (slug: string) => {
      if (slug.startsWith('custom_')) {
        return customSources?.find(src => src.slug === slug);
      } else {
        return [
          ...sourcesCategories.flatMap(category =>
            Object.values(category.sources)
          ),
          ...zappingSources
        ].find(src => src.slug === slug);
      }
    },
    [customSources]
  );
  const programSource = getSource(sources.program);
  const previewSource = getSource(sources.preview);
  return (
    <div className="flex flex-col items-center">
      <div className="grid grid-cols-16 h-screen aspect-video max-w-full">
        <div
          className={`${
            isEditing ? `col-span-12 row-auto` : 'col-span-16 row-span-9'
          } aspect-video`}
        >
          <div
            className={`w-full h-full box-border ${
              invertControl ? 'border-slate-500 border-2' : ''
            }`}
          >
            {!!programSource && (
              <SourceOutput source={programSource} muted={invertControl} />
            )}
          </div>
        </div>
        <div className="col-span-4 row-span-6 text-center w-full flex items-center justify-center">
          {isEditing && activeImg && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={activeImg} alt={programSource?.name} />
          )}
        </div>
        {isEditing && (
          <>
            <div className="col-span-12 row-span-3 row-start-7">
              <SourceSlider
                invertControl={invertControl}
                onSelect={
                  invertControl ? handleProgramChange : handlePreviewChange
                }
                selectedSourceSlug={
                  invertControl ? programSource?.slug : previewSource?.slug
                }
                onSourceSwap={handleSourceSwap}
              />
            </div>
            <div
              className={`col-span-4 row-span-2 col-start-13 row-start-7 aspect-video w-full h-full box-border ${
                !invertControl ? 'border-slate-500 border-2' : ''
              }`}
            >
              {!!previewSource && (
                <SourceOutput source={previewSource} muted={!invertControl} />
              )}
            </div>
          </>
        )}
      </div>
      <div className="flex">
        <div className="mt-3 flex flex-col mw-300 mr-6">
          <div>Keyboard shortcuts</div>
          <div className="flex flex-row gap-3">
            <div>
              <span className="font-bold text-xl">E</span> Toggle Edit Mode
            </div>
            <div>
              <span className="font-bold text-xl">Arrows</span> Preview
              Next/Previous source
            </div>
            <div>
              <span className="font-bold text-xl">Enter</span> Swap sources
            </div>
            <div>
              <span className="font-bold text-xl">F</span> Toggle Full Screen
            </div>
          </div>
          <ZappingConfig />
        </div>
      </div>
    </div>
  );
};
