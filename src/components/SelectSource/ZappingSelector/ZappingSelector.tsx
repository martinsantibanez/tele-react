'use client';
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '../../../../components/ui/accordion';
import { useCustomSources } from '../../../hooks/useCustomSources';
import { useZappingSources } from '../../../hooks/useZappingChannels';
import { useZappingLoginToken } from '../../../hooks/useZappingConfig';
import { SourceType } from '../../../sources';
import { SourceButton } from '../SourceButton/SourceButton';
import { ZappingConnect } from './ZappingConnect';

type Props = {
  onSourceSelect: (source: SourceType) => void;
  selectedSourceSlug: string | undefined;
  accordionEventKey: string;
};
export function ZappingSelector({
  onSourceSelect,
  selectedSourceSlug,
  accordionEventKey
}: Props) {
  const [loginToken] = useZappingLoginToken();

  const { createSource } = useCustomSources();
  const zappingSources = useZappingSources();

  const updateSelectedChannel = (source: SourceType) => {
    createSource(source);
    onSourceSelect(source);
  };

  return (
    <AccordionItem value={accordionEventKey}>
      <AccordionTrigger>Zapping</AccordionTrigger>
      <AccordionContent>
        {zappingSources.map(source => {
          return (
            <SourceButton
              onSelect={() => updateSelectedChannel(source)}
              source={source}
              isSelected={source.slug === selectedSourceSlug}
              key={source.slug}
            />
          );
        })}
        {!loginToken && (
          <div className="mb-2">
            <ZappingConnect />
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}
