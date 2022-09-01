import { Accordion } from 'react-bootstrap';
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
    <Accordion
      defaultActiveKey="0"
      className="w-100"
      style={{ maxHeight: '90vh', overflowY: 'scroll' }}
    >
      <TwitchSelector
        accordionEventKey="0"
        onSourceSelect={onSelect}
        selectedSourceSlug={selectedSourceSlug}
      />
      {sourcesCategories.map((sourceCategory, idx) => (
        <Accordion.Item eventKey={`${idx + 1}`} key={sourceCategory.name}>
          <Accordion.Header>{sourceCategory.name}</Accordion.Header>
          <Accordion.Body>
            {Object.values(sourceCategory.sources).map(source => (
              <SourceButton
                onSelect={onSelect}
                source={source}
                isSelected={source.slug === selectedSourceSlug}
                key={source.slug}
              />
            ))}
          </Accordion.Body>
        </Accordion.Item>
      ))}
      <ZappingSelector
        accordionEventKey={`${sourcesCategories.length + 1}`}
        onSourceSelect={onSelect}
        selectedSourceSlug={selectedSourceSlug}
      />
    </Accordion>
  );
}
