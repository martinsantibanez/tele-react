import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box
} from '@chakra-ui/react';
import { Source, sourcesCategories } from '../../sources';
import { SourceButton } from './SourceButton/SourceButton';
import { TwitchSelector } from './TwitchSelector/TwitchSelector';
import { ZappingSelector } from './ZappingSelector/ZappingSelector';

type Props = {
  selectedSourceSlug: string | undefined;
  onSelect: (source: Source) => void;
};
export function SourceAccordionList({ onSelect, selectedSourceSlug }: Props) {
  return (
    <Accordion>
      <TwitchSelector
        accordionEventKey="0"
        onSourceSelect={onSelect}
        selectedSourceSlug={selectedSourceSlug}
      />
      {sourcesCategories.map((sourceCategory, idx) => (
        <AccordionItem key={sourceCategory.name}>
          <h2>
            <AccordionButton>
              <Box flex="1" textAlign="left">
                {sourceCategory.name}
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4}>
            {Object.values(sourceCategory.sources).map(source => (
              <SourceButton
                onSelect={onSelect}
                source={source}
                isSelected={source.slug === selectedSourceSlug}
                key={source.slug}
              />
            ))}
          </AccordionPanel>
        </AccordionItem>
      ))}
      <ZappingSelector
        accordionEventKey={`${sourcesCategories.length + 1}`}
        onSourceSelect={onSelect}
        selectedSourceSlug={selectedSourceSlug}
      />
    </Accordion>
  );
}
