'use client';
import { useMemo, useState } from 'react';
import { ScreenType, SourceNode } from '../../_pages/monitor/types';
import { Source } from '../../components/Monitor/Source';
import { SelectSource } from '../../components/SelectSource/SelectSource';
import { SourceAccordionListNew } from '../../components/SelectSource/SourceListNew';
import { useTeleContext } from '../../context/TeleContext';
import { useCustomSources } from '../../hooks/useCustomSources';
import { useSavedGrid } from '../../hooks/useSavedGrid';
import { useZappingConfig } from '../../hooks/useZappingConfig';
import { SourceType } from '../../sources';
import { uuid } from '../../utils/uuid';
import { useHotkeys } from 'react-hotkeys-hook';

type SavedScreen = {
  name: string;
  screen: ScreenType;
};

export const DuoPage = () => {
  const [isEditing, setIsEditing] = useState(true);
  useHotkeys('e', () => setIsEditing(e => !e), { preventDefault: true });

  const [sources, setSources] = useState<{
    preview: string;
    program: string;
  }>({
    preview: 'Barras',
    program: 'Barras'
  });
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

  return (
    <div className="grid grid-cols-16 grid-rows-9">
      <div className={isEditing ? `col-span-12 row-span-6` : 'col-span-16 row-span-9'}>
        <Source
          idx={0}
          sourceSlug={sources.program}
          // muted={source.muted ?? true}
          muted={false}
        />
      </div>
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
            <Source idx={1} sourceSlug={sources.preview} muted />
          </div>
        </>
      )}
    </div>
  );
};
