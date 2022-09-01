import React from 'react';
import { Monitor } from '../Monitor/Monitor';
import { useTeleContext } from '../../context/TeleContext';
import { useSavedGrid } from '../../hooks/useSavedGrid';

type Props = {
  size: number;
};
export function GridDisplay({ size }: Props) {
  const { setEditingSourceIdx } = useTeleContext();
  const [selectedSources, setSelectedSources] = useSavedGrid();
  const handleSourceRemove = (idx: number) => {
    setSelectedSources(sources => {
      if (!sources) return sources;
      return sources.filter((src, index) => index !== idx);
    });
  };
  return (
    <>
      {selectedSources.map((source, idx) => (
        <Monitor
          size={size}
          sourceSlug={source.sourceSlug}
          key={`${source.uuid}`}
          onChangeClick={() => setEditingSourceIdx(idx)}
          onRemove={() => handleSourceRemove(idx)}
        />
      ))}
    </>
  );
}
