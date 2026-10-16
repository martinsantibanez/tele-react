'use client';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { LogOut, Settings, Youtube } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { useYoutubeAuth } from '../../../hooks/useYoutubeAuth';

/**
 * Connect / disconnect UI for the durable YouTube auth, mirroring
 * `ZappingConfig`. There is no token to paste: connecting is an OAuth redirect
 * (`useYoutubeAuth.connect`), disconnecting drops the server-side session.
 * Once connected the account shrinks to a gear, like Zapping's.
 */
export function YoutubeConfig() {
  const { isConnected, status, connect, disconnect } = useYoutubeAuth();

  if (isConnected)
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Cuenta de YouTube: Conectado"
            title="Cuenta de YouTube: Conectado"
            className="relative h-7 w-7 text-gray-400 hover:text-white focus-visible:text-white"
          >
            <Settings className="h-4 w-4" />
            <span
              aria-hidden
              className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-green-500"
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" side="top">
          <div className="grid gap-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">YouTube en vivo</h4>
              <p className="text-sm text-muted-foreground">
                Tu cuenta está conectada.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => disconnect()}
              title="Cerrar la sesión de YouTube"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Desconectar
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    );

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
                Usamos el permiso de solo lectura <code>youtube.readonly</code>.
                La sesión se guarda de forma segura en el servidor y se mantiene
                conectada sin volver a pedir permiso. Puedes desconectarte
                cuando quieras. Código en{' '}
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
              <Button onClick={() => connect()}>
                <Youtube className="mr-2 h-4 w-4" />
                Conectar
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      <Button variant="outline" disabled>
        Desconectado
      </Button>
    </>
  );
}
