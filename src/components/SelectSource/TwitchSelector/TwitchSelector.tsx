import React, { useState } from 'react';
import { Accordion } from 'react-bootstrap';
import { Source } from '../../../sources';
import { SourceButton } from '../SourceButton/SourceButton';
import { BsTwitch } from 'react-icons/bs';
import { useCustomSources } from '../../../hooks/useCustomSources';
import {
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box
} from '@chakra-ui/react';

type Props = {
  onSourceSelect: (source: Source) => void;
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
    const source: Source = {
      slug: `custom_twitch_${customTwitchValue}`,
      titleHtml: customTwitchValue,
      twitchAccount: customTwitchValue
    };
    createSource(source);
    onSourceSelect(source);
  };

  return (
    <AccordionItem>
      <h2>
        <AccordionButton>
          <Box flex="1" textAlign="left">
            Twitch
          </Box>
          <AccordionIcon />
        </AccordionButton>
      </h2>
      <AccordionPanel pb={4}>
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
      </AccordionPanel>
    </AccordionItem>
  );
}
