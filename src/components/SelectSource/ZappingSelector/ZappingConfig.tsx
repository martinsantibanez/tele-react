'use client';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { Loader2, LogOut, Settings } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '../../../../components/ui/button';
import {
  useZappingActivation,
  useZappingLoginToken,
  useZappingSessionStatus,
  useZappingToken
} from '../../../hooks/useZappingConfig';
import { useZappingPresetsVersion } from '../../../hooks/useZappingPresetScreens';
import { ZappingConnect } from './ZappingConnect';

/**
 * Connecting is the whole tab until it is done; once it is, the account is
 * only a gear at the foot of the list, with the session's state as a dot on
 * it and disconnecting one press away inside.
 */
export function ZappingConfig() {
  const [loginToken, setZappingLoginToken] = useZappingLoginToken();
  const [sessionStatus, setSessionStatus] = useZappingSessionStatus();
  const [, setPlayToken] = useZappingToken();
  const [, setPresetsVersion] = useZappingPresetsVersion();
  const { cancel: cancelActivation } = useZappingActivation();

  const isStarting = sessionStatus === 'starting';
  const isConnected = Boolean(loginToken);

  const [isOpen, setIsOpen] = useState(false);
  const statusRef = useRef<HTMLButtonElement>(null);
  const closedOnConnect = useRef(false);

  // The popover the account was connected from closes on its own, handing the
  // focus to the gear that takes its place. Only on the way in: opening the
  // gear afterwards must stay open.
  const wasConnected = useRef(isConnected);
  useEffect(() => {
    const justConnected = isConnected && !wasConnected.current;
    wasConnected.current = isConnected;
    if (!justConnected || !isOpen) return;
    closedOnConnect.current = true;
    setIsOpen(false);
  }, [isConnected, isOpen]);

  /**
   * Drops the stored credential, which unmounts the heartbeat loop in
   * `useZappingSession`, and clears the live token so nothing keeps playing.
   * The preset screens stay where they are — they are the user's now — but
   * connecting again seeds them afresh, so a set that was deleted comes back.
   */
  const handleDisconnect = () => {
    setIsOpen(false);
    setZappingLoginToken(undefined);
    setPlayToken(undefined);
    setSessionStatus('idle');
    setPresetsVersion(0);
    cancelActivation();
  };

  const statusLabel = isStarting
    ? 'Conectando...'
    : sessionStatus === 'ready'
      ? 'Conectado'
      : sessionStatus === 'error'
        ? 'No se pudo iniciar la sesión'
        : 'Desconectado';

  return (
    <>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        {isConnected ? (
          <PopoverTrigger asChild>
            <Button
              ref={statusRef}
              variant="ghost"
              size="icon"
              aria-label={`Cuenta de Zapping: ${statusLabel}`}
              title={`Cuenta de Zapping: ${statusLabel}`}
              className="relative h-7 w-7 text-gray-400 hover:text-white focus-visible:text-white"
            >
              {isStarting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Settings className="h-4 w-4" />
              )}
              {!isStarting && (
                <span
                  aria-hidden
                  className={`absolute top-1 right-1 h-1.5 w-1.5 rounded-full ${
                    sessionStatus === 'ready' ? 'bg-green-500' : 'bg-red-500'
                  }`}
                />
              )}
            </Button>
          </PopoverTrigger>
        ) : (
          sessionStatus === 'idle' && (
            <PopoverTrigger asChild>
              <Button variant="outline">Zapping Config</Button>
            </PopoverTrigger>
          )
        )}
        <PopoverContent
          className="w-80"
          side={isConnected ? 'top' : undefined}
          onCloseAutoFocus={event => {
            if (!closedOnConnect.current) return;
            closedOnConnect.current = false;
            event.preventDefault();
            statusRef.current?.focus();
          }}
        >
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
              {isStarting && (
                <p className="text-xs text-muted-foreground">Conectando...</p>
              )}
            </div>
            {isConnected ? (
              <>
                <p className="text-sm text-muted-foreground">
                  Tu cuenta está vinculada en este navegador.
                </p>
                <Button
                  variant="outline"
                  onClick={handleDisconnect}
                  title="Borrar el token guardado en este navegador"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Desconectar
                </Button>
              </>
            ) : (
              <ZappingConnect />
            )}
          </div>
        </PopoverContent>
      </Popover>
      {!isConnected && (
        <Button
          variant="outline"
          aria-disabled
          tabIndex={-1}
          className="pointer-events-none opacity-50"
        >
          {isStarting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isStarting ? 'Conectando...' : 'Desconectado'}
        </Button>
      )}
    </>
  );
}
