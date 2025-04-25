'use client';
import { useState } from 'react';
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '../../../../components/ui/accordion';
import { useCustomSources } from '../../../hooks/useCustomSources';
import { useZappingToken } from '../../../hooks/useZappingConfig';
import { SourceType } from '../../../sources';
import { SourceButton } from '../SourceButton/SourceButton';
import { canalesZapping } from './canales';

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
  const [, setZappingToken] = useZappingToken();
  const [jsonInput, setJsonInput] = useState('');

  const { createSource } = useCustomSources();

  const updateSelectedChannel = (source: SourceType) => {
    createSource(source);
    onSourceSelect(source);
  };

  return (
    <AccordionItem value={accordionEventKey}>
      <AccordionTrigger>Zapping</AccordionTrigger>
      <AccordionContent>
        {Object.values(canalesZapping).map(canal => {
          const source: SourceType = {
            slug: `custom_zapping_${canal.id}`,
            zappingChannel: canal.url,
            titleHtml: canal.name
          };
          return (
            <SourceButton
              onSelect={() => updateSelectedChannel(source)}
              source={source}
              isSelected={source.slug === selectedSourceSlug}
              key={source.slug}
            />
          );
        })}
        <div className="mb-2">
          <div className="w-full">
            Pega esto en la consola en{' '}
            <a
              href="https://app.zappingtv.com/player/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'underline' }}
            >
              Zapping
            </a>{' '}
            <textarea
              className="w-full"
              readOnly
              rows={2}
              defaultValue={`console.log( JSON.stringify({ token: document.querySelector('#loginToken').value }) )`}
            />
            Introduce el resultado:
            <textarea
              className="w-full"
              rows={2}
              onChange={e => setJsonInput(e.target.value)}
              value={jsonInput}
            />
            <button
              onClick={() => setZappingToken(JSON.parse(jsonInput))}
              className="btn btn-primary mt-2"
            >
              Configurar
            </button>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
