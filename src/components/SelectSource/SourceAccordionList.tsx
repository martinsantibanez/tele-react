import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '../../../components/ui/accordion';
import { SourceType, sourcesCategories } from '../../sources';
import { SourceButton } from './SourceButton/SourceButton';
import { TwitchSelector } from './TwitchSelector/TwitchSelector';
import { ZappingSelector } from './ZappingSelector/ZappingSelector';

type Props = {
  selectedSourceSlug: string | undefined;
  onSelect: (source: SourceType) => void;
};
export function SourceAccordionList({ onSelect, selectedSourceSlug }: Props) {
  return (
    <Accordion
      collapsible
      type="single"
      className="w-full"
      style={{ maxHeight: '90vh', overflowY: 'scroll' }}
    >
      <TwitchSelector
        accordionEventKey="0"
        onSourceSelect={onSelect}
        selectedSourceSlug={selectedSourceSlug}
      />
      {sourcesCategories.map((sourceCategory, idx) => (
        <AccordionItem value={`${idx + 1}`} key={sourceCategory.name}>
          <AccordionTrigger>{sourceCategory.name}</AccordionTrigger>
          <AccordionContent>
            {Object.values(sourceCategory.sources).map(source => (
              <SourceButton
                onSelect={onSelect}
                source={source}
                isSelected={source.slug === selectedSourceSlug}
                key={source.slug}
              />
            ))}
          </AccordionContent>
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
