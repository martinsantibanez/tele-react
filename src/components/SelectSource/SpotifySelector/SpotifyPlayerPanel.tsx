'use client';
import { Speaker } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { useSpotifyPlayer } from '../../../hooks/useSpotifyPlayer';

/**
 * What the Spotify player is doing, in the config popover.
 *
 * Mostly this exists to answer one question the wall cannot answer on its own:
 * *where is the sound coming from*. Because playback is a Connect session
 * rather than an iframe, the honest answer is sometimes "another tab" and
 * sometimes "your phone", and a user whose tiles are visibly playing to silence
 * has no other way to find that out. The button pulls the session back here.
 *
 * The two dead ends get said out loud for the same reason. Falling back to the
 * embed is not a failure the user can see — the tile still plays, in thirty
 * second previews, from inside itself — so being told that the real player
 * needs Premium, or needs a browser this one is not, beats wondering.
 */
export function SpotifyPlayerPanel() {
  const { status, playback, isHost, deviceId, claimDevice, error } =
    useSpotifyPlayer();

  if (status === 'disconnected') return null;

  const playingHere = !!deviceId && playback?.deviceId === deviceId;

  const message = (() => {
    switch (status) {
      case 'scope':
        return 'Tu cuenta está conectada sin permisos de reproducción. Desconecta y vuelve a conectar para habilitar el reproductor.';
      case 'premium':
        return 'Tu cuenta no es Premium, así que las canciones suenan en avances de 30 segundos dentro de cada recuadro.';
      case 'unsupported':
        return 'Este navegador no puede ser un dispositivo de Spotify, así que cada recuadro reproduce por su cuenta.';
      case 'idle':
        return 'El reproductor se activa al poner una fuente de Spotify en pantalla.';
      case 'loading':
        return 'Conectando este navegador como dispositivo…';
      case 'ready':
        return playingHere
          ? 'Sonando en esta pestaña.'
          : `Este navegador está disponible como dispositivo${
              playback?.deviceName ? `; ahora suena en ${playback.deviceName}` : ''
            }.`;
      case 'remote':
        return isHost
          ? 'Preparando el dispositivo…'
          : playback?.deviceName
            ? `Sonando en ${playback.deviceName}. Esta pestaña lo controla.`
            : 'Otra pestaña tiene el dispositivo. Esta la controla.';
      default:
        return undefined;
    }
  })();

  return (
    <div className="space-y-2 border-t pt-3">
      <h4 className="font-medium leading-none">Reproductor</h4>
      <p className="text-xs text-muted-foreground">
        Spotify reproduce en un solo lugar a la vez. Todos los recuadros y todas
        las pestañas muestran y controlan esa misma reproducción, igual que la
        app en tu teléfono.
      </p>
      {message && <p className="text-xs text-muted-foreground">{message}</p>}
      {error && <p className="text-xs text-amber-600">{error}</p>}
      {deviceId && !playingHere && (
        <Button
          variant="outline"
          className="h-8 w-full text-xs"
          onClick={() => claimDevice()}
        >
          <Speaker className="mr-2 h-3 w-3" />
          Reproducir aquí
        </Button>
      )}
    </div>
  );
}
