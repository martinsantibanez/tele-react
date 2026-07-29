'use client';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { LogOut, Music } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { useCustomSpotifyItems } from '../../../hooks/useCustomSpotifyItems';
import { useSpotifyAuth } from '../../../hooks/useSpotifyAuth';
import { SourceType } from '../../../sources';
import { SpotifyPlayerPanel } from './SpotifyPlayerPanel';

type Props = {
  /** Plays the newly added item straight away, as the other tabs do on click. */
  onSourceSelect: (source: SourceType) => void;
  /** Uri of the saved item the caret is on, if the list is where it stands. */
  selectedUri?: string;
  /** Whether the row the caret is on is one the user pasted (and can remove). */
  isSelectedCustom?: boolean;
};

/**
 * Where a Spotify tab's catalogue comes from. Two ways in, and they stack:
 * connect the account and its playlists, albums, podcasts and top artists are
 * listed on their own, or paste a link to anything — including something no
 * account of yours follows — and it joins the list.
 */
export function SpotifyConfig({
  onSourceSelect,
  selectedUri,
  isSelectedCustom = true
}: Props) {
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);
  const { addItem, removeItem } = useCustomSpotifyItems();
  const { isConnected, status, connect, disconnect } = useSpotifyAuth();

  const handleAdd = () => {
    const source = addItem(value);
    if (!source) {
      setError(true);
      return;
    }
    setError(false);
    setValue('');
    onSourceSelect(source);
  };

  return (
    <div className="flex w-full flex-col items-stretch gap-2">
      <Input
        type="text"
        value={value}
        placeholder="Link de Spotify"
        aria-label="Link de Spotify"
        aria-invalid={error}
        onChange={e => {
          setValue(e.target.value);
          setError(false);
        }}
        onKeyDown={e => {
          if (e.key !== 'Enter') return;
          e.preventDefault();
          handleAdd();
        }}
        className="h-8 text-sm"
      />
      {error && (
        <span className="text-xs text-red-400">
          Pega un link de canción, álbum, playlist, artista o podcast
        </span>
      )}
      <div className="flex gap-2">
        <Button className="h-8 flex-1 text-xs" onClick={handleAdd}>
          Agregar
        </Button>
        {selectedUri && isSelectedCustom && (
          <Button
            variant="destructive"
            className="h-8 flex-1 text-xs"
            onClick={() => removeItem(selectedUri)}
          >
            Quitar
          </Button>
        )}
      </div>

      <div className="flex gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="h-8 flex-1 text-xs">
              Spotify Config
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Tu cuenta</h4>
                <p className="text-sm text-muted-foreground">
                  Conecta tu cuenta de Spotify para listar tus playlists, tus
                  álbumes y podcasts guardados, tus artistas más escuchados y
                  los lanzamientos de la semana, sin pegar ningún link.
                </p>
                <p className="text-xs text-muted-foreground">
                  Leemos tu biblioteca solo para listarla, y pedimos control de
                  reproducción para el reproductor. La sesión se guarda cifrada
                  en el servidor y se mantiene conectada sin volver a pedir
                  permiso. Código en{' '}
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

              <SpotifyPlayerPanel />
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
                    <Music className="mr-2 h-4 w-4" />
                    Conectar
                  </Button>
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>
        {isConnected ? (
          <Button
            variant="outline"
            className="h-8 flex-1 text-xs"
            onClick={() => disconnect()}
            title="Cerrar la sesión de Spotify"
          >
            <LogOut className="mr-1 h-3 w-3" />
            Desconectar
          </Button>
        ) : (
          <Button
            variant="outline"
            className="h-8 flex-1 text-xs"
            onClick={() => connect()}
          >
            <Music className="mr-1 h-3 w-3" />
            Conectar
          </Button>
        )}
      </div>
    </div>
  );
}
