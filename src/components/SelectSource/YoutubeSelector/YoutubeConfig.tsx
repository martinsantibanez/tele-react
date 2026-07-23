'use client';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { LogOut, Youtube } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { useYoutubeAuth } from '../../../hooks/useYoutubeAuth';

/**
 * Connect / disconnect UI for the durable YouTube auth, mirroring
 * `ZappingConfig`. There is no token to paste: connecting is an OAuth redirect
 * (`useYoutubeAuth.connect`), disconnecting drops the server-side session.
 */
export function YoutubeConfig() {
  const { isConnected, status, connect, disconnect } = useYoutubeAuth();

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">YouTube Config</Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="grid gap-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">YouTube en vivo</h4>
              <p className="text-sm text-muted-foreground">
                Conecta tu cuenta de YouTube para ver cuáles de tus canales
                suscritos están transmitiendo en vivo ahora.
              </p>
              <p className="text-xs text-muted-foreground">
                Usamos el permiso de solo lectura{' '}
                <code>youtube.readonly</code>. La sesión se guarda de forma
                segura en el servidor y se mantiene conectada sin volver a pedir
                permiso. Puedes desconectarte cuando quieras. Código en{' '}
                <a
                  href="https://github.com/martinsantibanez/tele-react"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: 'underline' }}
                >
                  GitHub
                </a>
                .
              </p>
            </div>
            <div className="flex items-center justify-end gap-2">
              {status === 'disconnected' && (
                <span className="text-xs text-muted-foreground">
                  No conectado
                </span>
              )}
              {isConnected ? (
                <Button variant="outline" onClick={() => disconnect()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Desconectar
                </Button>
              ) : (
                <Button onClick={() => connect()}>
                  <Youtube className="mr-2 h-4 w-4" />
                  Conectar
                </Button>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
      <Button variant="outline" disabled>
        {isConnected ? 'Conectado' : 'Desconectado'}
      </Button>
      {isConnected && (
        <Button
          variant="outline"
          onClick={() => disconnect()}
          title="Cerrar la sesión de YouTube"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Desconectar
        </Button>
      )}
    </>
  );
}
