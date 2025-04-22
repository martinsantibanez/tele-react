'use client';
import { useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { Source } from '../../components/Monitor/Source';
import { SelectSource } from '../../components/SelectSource/SelectSource';
import { canalesZapping } from '../../components/SelectSource/ZappingSelector/canales';
import { zappingSources } from '../../components/SelectSource/ZappingSelector/ZappingConfig';
import { useCustomSources } from '../../hooks/useCustomSources';
import { useZappingConfig } from '../../hooks/useZappingConfig';
import { SourceType } from '../../sources';
import { useDuoState } from '../../hooks/useDuoState';

export const DuoPage = () => {
  const [isEditing, setIsEditing] = useState(true);
  const [invertAudio, setInvertAudio] = useState(false);

  useHotkeys('i', () => setInvertAudio(v => !v), { preventDefault: true });
  useHotkeys('e', () => setIsEditing(v => !v), { preventDefault: true });

  const [sources, setSources] = useDuoState();
  const { customSources } = useCustomSources();
  const { zappingConfig } = useZappingConfig();

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
  const img = image
    ? `https://davinci.zappingtv.com/gato/media/128/canales/white/${image}.png`
    : undefined;
  return (
    <div className="grid grid-cols-16 grid-rows-9">
      <div
        className={
          isEditing ? `col-span-12 row-span-6` : 'col-span-16 row-span-9'
        }
      >
        <Source idx={0} sourceSlug={sources.program} muted={invertAudio} />
      </div>
      {isEditing && img && (
        <div className="col-span-4 row-span-6 text-center w-full flex items-center justify-center">
          <img src={img} />
        </div>
      )}
      {isEditing && (
        <>
          <div className="col-span-12 row-span-3 row-start-7">
            <SelectSource
              onSelect={source => handlePreviewChange(source)}
              selectedSourceSlug={sources.preview}
              onSourceSwap={handleSourceSwap}
            />
          </div>
          <div className={`col-span-4 row-span-2 col-start-13 row-start-7`}>
            <Source idx={1} sourceSlug={sources.preview} muted={!invertAudio} />
          </div>
        </>
      )}
    </div>
  );
};
