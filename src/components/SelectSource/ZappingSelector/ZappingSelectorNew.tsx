'use client';
import { useState } from 'react';
import { Accordion } from 'react-bootstrap';
import { useCustomSources } from '../../../hooks/useCustomSources';
import { useZappingConfig } from '../../../hooks/useZappingConfig';
import { SourceType } from '../../../sources';
import { SourceButton } from '../SourceButton/SourceButton';
import { canalesZapping } from './canales';
import { Button } from '../../../../components/ui/button';

const arrayCanales = Object.values(canalesZapping);

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
  const [selectedIndex, setSelectedIndex] = useState(2);

  const next = () => {
    setSelectedIndex(prevIndex =>
      Math.min(prevIndex + 1, arrayCanales.length - 1)
    );
  };

  const prev = () => {
    setSelectedIndex(prevIndex => Math.max(prevIndex - 1, 0));
  };
  // const handleKeyDown = (event: React.KeyboardEvent) => {
  //   if (event.key === 'ArrowUp') {
  //     setSelectedIndex(prevIndex => Math.max(prevIndex - 1, 0));
  //   } else if (event.key === 'ArrowDown') {
  //     setSelectedIndex(prevIndex =>
  //       Math.min(prevIndex + 1, arrayCanales.length - 1)
  //     );
  //   }
  // };

  const startIndex = Math.max(selectedIndex - 2, 0);
  const endIndex = Math.min(arrayCanales.length - 1, selectedIndex + 2);

  console.log;
  return (
    <div className="flex flex-col">
      <div>
        <Button
          onClick={() => prev()}
          variant="outline"
          disabled={selectedIndex === 0}
        >
          {'<'}
        </Button>
        {arrayCanales.map((canal, canalIndex) => {
          if (canalIndex < startIndex || canalIndex > endIndex) return null;
          const source: SourceType = {
            slug: `custom_zapping_${canal.id}`,
            zappingChannel: canal.url,
            name: canal.name
          };
          // const isSelected = source.slug === selectedSourceSlug
          const isSelected = false;

          const isActive = canalIndex === selectedIndex;
          return (
            <Button
              onClick={() => updateSelectedChannel(source)}
              variant={
                isActive ? 'secondary' : isSelected ? 'default' : 'outline'
              }
              key={`zapping_${canal.id}`}
            >
              {source.name}
            </Button>
          );
        })}
        <Button
          onClick={() => next()}
          variant="outline"
          disabled={selectedIndex === arrayCanales.length - 1}
        >
          {'>'}
        </Button>
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
          </a>
          <pre>
            {`console.log( JSON.stringify({ token: document.querySelector('#loginToken').value }) )`}
          </pre>
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
