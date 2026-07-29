import { useCallback, useEffect, useRef, useState } from 'react';
import useLocalStorageState from 'use-local-storage-state';

/**
 * Client side of the durable Spotify auth, the twin of `useYoutubeAuth`. The
 * real credential (a refresh token) lives encrypted in an httpOnly cookie; this
 * hook never sees it. It just asks `/api/spotify/token` for a short-lived access
 * token — on mount, before expiry, and again whenever the Web API 401s — and the
 * backend silently mints one. So a connected user stays connected across reloads
 * with no re-auth prompt.
 *
 *   connect    -> navigate to /api/spotify/login (OAuth redirect)
 *   disconnect -> POST /api/spotify/logout (drops the cookie)
 *
 * Worth being clear about what this token is and is not for: it reads the
 * account's catalogue, and that is all. The embedded player is a separate world
 * — it plays full tracks when the browser itself is logged into Spotify and
 * thirty-second previews when it is not, and no token this app holds can change
 * that. Connecting here fills the list; whether the music plays whole is between
 * the user and open.spotify.com.
 */

type StoredToken = {
  accessToken: string;
  /** epoch ms when the token stops being valid. */
  expiresAt: number;
};

export type SpotifyAuthStatus = 'unknown' | 'connected' | 'disconnected';

// Shared across all hook instances so they don't each hit /token on mount.
let inFlight: Promise<string | undefined> | undefined;

export function useSpotifyAccessToken() {
  return useLocalStorageState<StoredToken | undefined>('spotifyToken', {
    defaultValue: undefined
  });
}

export function useSpotifyAuth() {
  const [token, setToken] = useSpotifyAccessToken();
  const [status, setStatus] = useState<SpotifyAuthStatus>('unknown');
  const tokenRef = useRef(token);
  tokenRef.current = token;

  /**
   * Return a valid access token, refreshing from the backend when the cached
   * one is missing or within a minute of expiry. `force` skips the cache (used
   * after a 401 from the Web API). Returns undefined when disconnected.
   */
  const getAccessToken = useCallback(
    async (force = false): Promise<string | undefined> => {
      const current = tokenRef.current;
      if (!force && current && current.expiresAt - Date.now() > 60_000) {
        return current.accessToken;
      }
      inFlight =
        inFlight ??
        (async () => {
          try {
            const res = await fetch('/api/spotify/token');
            if (res.status === 401) {
              setToken(undefined);
              setStatus('disconnected');
              return undefined;
            }
            if (!res.ok) throw new Error(`token endpoint ${res.status}`);
            const json = await res.json();
            const stored: StoredToken = {
              accessToken: json.accessToken,
              expiresAt: Date.now() + (json.expiresIn ?? 3600) * 1000
            };
            setToken(stored);
            setStatus('connected');
            return stored.accessToken;
          } catch (err) {
            console.error('[spotify] token fetch failed', err);
            return undefined;
          }
        })();
      try {
        return await inFlight;
      } finally {
        inFlight = undefined;
      }
    },
    [setToken]
  );

  // Establish connection status once on mount.
  useEffect(() => {
    getAccessToken();
  }, [getAccessToken]);

  const connect = useCallback(() => {
    // Come back to the page the user launched the connect from (e.g. /monitor).
    const returnTo = window.location.pathname + window.location.search;
    window.location.assign(
      `/api/spotify/login?returnTo=${encodeURIComponent(returnTo)}`
    );
  }, []);

  const disconnect = useCallback(async () => {
    try {
      await fetch('/api/spotify/logout', { method: 'POST' });
    } catch (err) {
      console.error('[spotify] logout failed', err);
    }
    setToken(undefined);
    setStatus('disconnected');
  }, [setToken]);

  const isConnected =
    status === 'connected' || Boolean(token && token.expiresAt > Date.now());

  return {
    accessToken:
      token && token.expiresAt > Date.now() ? token.accessToken : undefined,
    isConnected,
    status,
    getAccessToken,
    connect,
    disconnect
  };
}
