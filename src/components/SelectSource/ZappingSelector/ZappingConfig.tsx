'use client';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { Loader2, LogOut } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import {
  useZappingActivation,
  useZappingLoginToken,
  useZappingSessionStatus,
  useZappingToken
} from '../../../hooks/useZappingConfig';
import { ZappingConnect } from './ZappingConnect';

export function ZappingConfig() {
  const [loginToken, setZappingLoginToken] = useZappingLoginToken();
  const [sessionStatus, setSessionStatus] = useZappingSessionStatus();
  const [, setPlayToken] = useZappingToken();
  const { cancel: cancelActivation } = useZappingActivation();

  const isStarting = sessionStatus === 'starting';
  const isConnected = Boolean(loginToken);

  /**
   * Drops the stored credential, which unmounts the heartbeat loop in
   * `useZappingSession`, and clears the live token so nothing keeps playing.
   */
  const handleDisconnect = () => {
    setZappingLoginToken(undefined);
    setPlayToken(undefined);
    setSessionStatus('idle');
    cancelActivation();
  };

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Zapping Config</Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="grid gap-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">Zapping</h4>
              {sessionStatus === 'error' && (
                <p className="text-xs text-destructive">
                  No se pudo iniciar la sesión
                </p>
              )}
              {sessionStatus === 'ready' && (
                <p className="text-xs text-muted-foreground">Sesión lista</p>
              )}
            </div>
            {isConnected ? (
              <p className="text-sm text-muted-foreground">
                Tu cuenta está vinculada en este navegador.
              </p>
            ) : (
              <ZappingConnect />
            )}
          </div>
        </PopoverContent>
      </Popover>
      <Button variant="outline" disabled>
        {isStarting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isStarting
          ? 'Conectando...'
          : sessionStatus === 'ready'
            ? 'Conectado'
            : 'Desconectado'}
      </Button>
      {isConnected && (
        <Button
          variant="outline"
          onClick={handleDisconnect}
          title="Borrar el token guardado en este navegador"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Desconectar
        </Button>
      )}
    </>
  );
}
