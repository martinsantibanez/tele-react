import { SourceType } from '../../sources';
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
