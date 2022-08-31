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
        <div className="mb-2">
          <input
            type="text"
            value={zappingEndpoint}
            placeholder="Endpoint"
            onChange={e => setZappingEndpoint(e.target.value)}
          />
          <input
            type="text"
            value={zappingToken}
            placeholder="Token"
            onChange={e => setZappingToken(e.target.value)}
          />
        </div>
        <button onClick={handleConfigSubmit} className="btn btn-primary">
          Configurar
        </button>
        {Object.values(canales)?.map(canal => {
          const source: Source = {
            titleIcons: [<BsTwitch key="twitch" />],
            slug: `custom_zapping_${canal.zapping_id}`,
            zappingChannel: canal.zapping_id,
            titleHtml: canal.name
          };

          return (
            <SourceButton
              onSelect={updateSelectedChannel}
              source={source}
              isSelected={source.slug === selectedSourceSlug}
              key={source.slug}
            />
          );
        })}
      </Accordion.Body>
    </Accordion.Item>
  );
}
