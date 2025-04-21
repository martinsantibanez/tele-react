'use client';
import { useState, useMemo, useEffect } from 'react';
import { useTeleContext } from '../../context/TeleContext';
import { useDisplayConfig } from '../../hooks/useDisplayConfig';
import { useSavedGrid } from '../../hooks/useSavedGrid';
import { ScreenType } from '../../_pages/monitor/types';
import { useSavedScreens } from '../Monitor/Monitor';
import { Card, CardContent, CardHeader } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';

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
      <CardHeader>Guardados</CardHeader>
      <CardContent className="d-flex flex-wrap">
        {/* <InputGroup className="mb-3">
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
        </InputGroup> */}
        {typeof window !== 'undefined' &&
          savedScreens.map((savedScreen, idx) => (
            <div className="d-flex align-items-center" key={idx}>
              <Button
                variant="default"
                onClick={() => {
                  setDisplayConfig(savedScreen.screen.config);
                  setSelectedSources(savedScreen.screen.sources);
                }}
              >
                {savedScreen.name}
              </Button>
              <Button
                variant="destructive"
                onClick={() =>
                  setSavedScreens(saved =>
                    saved.filter((_, savedIdx) => idx !== savedIdx)
                  )
                }
              >
                Remove
              </Button>
            </div>
          ))}
      </CardContent>
    </Card>
  );
}
