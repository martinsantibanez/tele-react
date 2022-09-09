import { useState } from 'react';
import { Accordion } from 'react-bootstrap';
import { BsTwitch } from 'react-icons/bs';
import { useCustomSources } from '../../../hooks/useCustomSources';
import { useZappingConfig } from '../../../hooks/useZappingConfig';
import { Source } from '../../../sources';
import { SourceButton } from '../SourceButton/SourceButton';
import canales from './canales.json';

type Props = {
  onSourceSelect: (source: Source) => void;
  selectedSourceSlug: string | undefined;
  accordionEventKey: string;
};
export function ZappingSelector({
  onSourceSelect,
  selectedSourceSlug,
  accordionEventKey
}: Props) {
  const { setZappingConfig, zappingConfig } = useZappingConfig();
  const [zappingEndpoint, setZappingEndpoint] = useState(
    zappingConfig?.endpoint || ''
  );
  const [zappingToken, setZappingToken] = useState(zappingConfig?.token || '');
  const [jsonInput, setJsonInput] = useState('');

  const { createSource } = useCustomSources();

  const updateSelectedChannel = (source: Source) => {
    createSource(source);
    onSourceSelect(source);
  };

  const handleConfigSubmit = () => {
    setZappingConfig({ endpoint: zappingEndpoint, token: zappingToken });
  };

  return (
    <Accordion.Item eventKey={accordionEventKey}>
      <Accordion.Header>Zapping</Accordion.Header>
      <Accordion.Body>
        {Object.values(canales)?.map(canal => {
          const source: Source = {
            slug: `custom_zapping_${canal.zapping_id}`,
            zappingChannel: canal.zapping_id,
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
          <div className="w-100">
            Pega esto en la consola en{' '}
            <a
              href="https://app.zappingtv.com/player/"
              target="_blank"
              rel="noreferrer"
            >
              Zapping
            </a>{' '}
            <textarea
              className="w-100"
              readOnly
              rows={2}
              defaultValue={
                'console.log( JSON.stringify( {endpoint: su, token: t} ) )'
              }
            />
            Introduce el resultado:
            <textarea
              className="w-100"
              rows={2}
              onChange={e => setJsonInput(e.target.value)}
              value={jsonInput}
            />
            <button
              onClick={() => setZappingConfig(JSON.parse(jsonInput))}
              className="btn btn-primary mt-2"
            >
              Configurar
            </button>
          </div>
        </div>
      </Accordion.Body>
    </Accordion.Item>
  );
}
