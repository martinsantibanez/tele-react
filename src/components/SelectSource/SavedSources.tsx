import { useState, useMemo, useEffect } from 'react';
import { Button, Card, CloseButton, Form, InputGroup } from 'react-bootstrap';
import { useTeleContext } from '../../context/TeleContext';
import { useDisplayConfig } from '../../hooks/useDisplayConfig';
import { useSavedGrid } from '../../hooks/useSavedGrid';
import { ScreenType } from '../../pages/monitor/types';
import { useSavedScreens } from '../Monitor/Monitor';

type Props = {};
export function SavedSources({}: Props) {
  const [selectedSources, setSelectedSources] = useSavedGrid();
  const [displayConfig, setDisplayConfig] = useDisplayConfig();
  const [savedScreens, setSavedScreens] = useSavedScreens();
  const [name, setName] = useState('');
  useEffect(() => {}, [savedScreens]);

  const screen: ScreenType = useMemo(
    () => ({
      config: displayConfig,
      sources: selectedSources
    }),
    [displayConfig, selectedSources]
  );
  return (
    <Card className="mb-3">
      <Card.Header>Guardados</Card.Header>
      <Card.Body className="d-flex flex-wrap">
        <InputGroup className="mb-3">
          <Form.Control
            placeholder="Nombre"
            aria-label="Nombre"
            aria-describedby="basic-addon2"
            onChange={event => setName(event.target.value)}
          />
          <Button
            onClick={async () => {
              setSavedScreens(saved => [...(saved || []), { name, screen }]);
            }}
            variant="primary"
          >
            Guardar
          </Button>
        </InputGroup>
        {typeof window !== 'undefined' &&
          savedScreens.map((savedScreen, idx) => (
            <div className="d-flex align-items-center" key={idx}>
              <button
                type="button"
                className="btn btn-primary position-relative"
                onClick={() => {
                  setDisplayConfig(savedScreen.screen.config);
                  setSelectedSources(savedScreen.screen.sources);
                }}
              >
                {savedScreen.name}
              </button>
              <CloseButton
                onClick={() =>
                  setSavedScreens(saved =>
                    saved.filter((_, savedIdx) => idx !== savedIdx)
                  )
                }
              />
            </div>
          ))}
      </Card.Body>
    </Card>
  );
}
