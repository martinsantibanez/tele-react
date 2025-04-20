'use client';
import { useState } from 'react';
import { Accordion } from 'react-bootstrap';
import { useCustomSources } from '../../../hooks/useCustomSources';
import { useZappingConfig } from '../../../hooks/useZappingConfig';
import { SourceType } from '../../../sources';
import { SourceButton } from '../SourceButton/SourceButton';
import { canalesZapping } from './canales';
import { Button } from '../../../../components/ui/button';

type Props = {
  onSourceSelect: (source: SourceType) => void;
  selectedSourceSlug: string | undefined;
};
export function ZappingSelectorNew({
  onSourceSelect,
  selectedSourceSlug
}: Props) {
  const { setZappingConfig } = useZappingConfig();
  const [jsonInput, setJsonInput] = useState('');

  const { createSource } = useCustomSources();

  const updateSelectedChannel = (source: SourceType) => {
    createSource(source);
    onSourceSelect(source);
  };

  return (
    <div className="flex flex-col">
      <div>
        {Object.values(canalesZapping).map(canal => {
          const source: SourceType = {
            slug: `custom_zapping_${canal.id}`,
            zappingChannel: canal.url,
            name: canal.name
          };
          const isSelected = source.slug === selectedSourceSlug;
          return (
            <Button
              onClick={() => updateSelectedChannel(source)}
              variant={isSelected ? 'default' : 'outline'}
              key={`zapping_${canal.id}`}
            >
              {source.name}
            </Button>
          );
        })}
      </div>
      <div>
        <div>
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
            readOnly
            rows={2}
            defaultValue={`console.log( JSON.stringify({ token: document.querySelector('#loginToken').value }) )`}
          />
          Introduce el resultado:
          <input
            type="text"
            className="w-full"
            onChange={e => setJsonInput(e.target.value)}
            value={jsonInput}
          />
          <button onClick={() => setZappingConfig(JSON.parse(jsonInput))}>
            Configurar
          </button>
        </div>
      </div>
    </div>
    // <Accordion.Item eventKey={accordionEventKey}>
    //   <Accordion.Header>Zapping</Accordion.Header>
    //   <Accordion.Body>
    //     {Object.values(canalesZapping).map(canal => {
    //       const source: SourceType = {
    //         slug: `custom_zapping_${canal.id}`,
    //         zappingChannel: canal.url,
    //         titleHtml: canal.name
    //       };
    //       return (
    //         <SourceButton
    //           onSelect={() => updateSelectedChannel(source)}
    //           source={source}
    //           isSelected={source.slug === selectedSourceSlug}
    //           key={source.slug}
    //         />
    //       );
    //     })}

    //   </Accordion.Body>
    // </Accordion.Item>
  );
}
