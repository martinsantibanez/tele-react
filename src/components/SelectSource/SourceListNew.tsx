import { Accordion } from 'react-bootstrap';
import { SourceType, sourcesCategories } from '../../sources';
import { SourceButton } from './SourceButton/SourceButton';
import { TwitchSelector } from './TwitchSelector/TwitchSelector';
import { ZappingSelector } from './ZappingSelector/ZappingSelector';
import { ZappingSelectorNew } from './ZappingSelector/ZappingSelectorNew';

type Props = {
  selectedSourceSlug: string | undefined;
  onSelect: (source: SourceType) => void;
};
export function SourceAccordionListNew({
  onSelect,
  selectedSourceSlug
}: Props) {
  return (
    <div>
      <ZappingSelectorNew
        onSourceSelect={onSelect}
        selectedSourceSlug={selectedSourceSlug}
      />
    </div>
  );
}
