'use client';
import { useCallback, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { SourceOutput } from '../../components/Monitor/SourceOutput/SourceOutput';
import { SourceSlider } from '../../components/SelectSource/SourceSlider';
import { canalesZapping } from '../../components/SelectSource/ZappingSelector/canales';
import { zappingSources } from '../../components/SelectSource/ZappingSelector/ZappingConfig';
import { useCustomSources } from '../../hooks/useCustomSources';
import { useDuoState } from '../../hooks/useDuoState';
import { sourcesCategories, SourceType } from '../../sources';

export const DuoPage = () => {
  const [isEditing, setIsEditing] = useState(true);
  const [invertAudio, setInvertAudio] = useState(false);

  useHotkeys('i', () => setInvertAudio(v => !v), { preventDefault: true });
  useHotkeys('e', () => setIsEditing(v => !v), { preventDefault: true });

  const [sources, setSources] = useDuoState();

  const handlePreviewChange = (source: SourceType) => {
    setSources(prev => ({ ...prev, preview: source.slug }));
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

  const getSource = useCallback((slug: string) => {
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
  }, []);
  const programSource = getSource(sources.program);
  const previewSource = getSource(sources.preview);
  return (
    <div className="grid grid-cols-16 grid-rows-9">
      <div
        className={
          isEditing ? `col-span-12 row-span-6` : 'col-span-16 row-span-9'
        }
      >
        <div className="w-full h-full">
          {!!programSource && (
            <SourceOutput source={programSource} muted={invertAudio} />
          )}
        </div>
      </div>
      {isEditing && activeImg && (
        <div className="col-span-4 row-span-6 text-center w-full flex items-center justify-center">
          <img src={activeImg} />
        </div>
      )}
      {isEditing && (
        <>
          <div className="col-span-12 row-span-3 row-start-7">
            <SourceSlider
              onSelect={source => handlePreviewChange(source)}
              selectedSourceSlug={sources.preview}
              onSourceSwap={handleSourceSwap}
            />
          </div>
          <div className={`col-span-4 row-span-2 col-start-13 row-start-7`}>
            <div className="w-full h-full">
              {!!previewSource && (
                <SourceOutput source={previewSource} muted={!invertAudio} />
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
