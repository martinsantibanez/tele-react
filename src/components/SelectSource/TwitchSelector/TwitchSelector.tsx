'use client'
import React, { useState } from 'react';
import { SourceType } from '../../../sources';
import { SourceButton } from '../SourceButton/SourceButton';
import { BsTwitch } from 'react-icons/bs';
import { useCustomSources } from '../../../hooks/useCustomSources';
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '../../../../components/ui/accordion';

type Props = {
  onSourceSelect: (source: SourceType) => void;
  selectedSourceSlug: string | undefined;
  accordionEventKey: string;
};
export function TwitchSelector({
  onSourceSelect,
  selectedSourceSlug,
  accordionEventKey
}: Props) {
  const [customTwitchValue, setCustomTwitchValue] = useState<string>('');
  const { createSource, customSources } = useCustomSources();
  const twitchSources = customSources.filter(source => !!source.twitchAccount);
  const handleCreateSource = () => {
    const source: SourceType = {
      slug: `custom_twitch_${customTwitchValue}`,
      titleHtml: customTwitchValue,
      twitchAccount: customTwitchValue
    };
    createSource(source);
    onSourceSelect(source);
  };

  return (
    <AccordionItem value={accordionEventKey}>
      <AccordionTrigger>Twitch</AccordionTrigger>
      <AccordionContent>
        {twitchSources?.map(source => (
          <SourceButton
            onSelect={onSourceSelect}
            source={{ ...source, titleIcons: [<BsTwitch key="twitch" />] }}
            isSelected={source.slug === selectedSourceSlug}
            key={source.slug}
          />
        ))}
        <div className="mb-2 mt-4">
          <input
            type="text"
            value={customTwitchValue}
            placeholder="Canal de Twitch"
            onChange={e => setCustomTwitchValue(e.target.value)}
          />
        </div>
        <button onClick={handleCreateSource} className="btn btn-primary">
          Agregar
        </button>
      </AccordionContent>
    </AccordionItem>
  );
}
