import { useCallback, useEffect, useRef, useState } from 'react';
import useLocalStorageState from 'use-local-storage-state';

/**
 * Client side of the durable YouTube auth. The real credential (a refresh
 * token) lives server-side in KV behind an httpOnly session cookie; this hook
 * never sees it. It just asks `/api/youtube/token` for a short-lived access
 * token — on mount, before expiry, and again whenever the YouTube API 401s —
 * and the backend silently mints one from the refresh token. So a connected
 * user stays connected across reloads with no re-auth prompt.
 *
 * Connecting/disconnecting are full server round-trips:
 *   connect    -> navigate to /api/youtube/login (OAuth redirect)
 *   disconnect -> POST /api/youtube/logout (drops the KV token + cookie)
 *
 * The access token is cached in localStorage so multiple mounting components
 * (and StrictMode's double-mount) share one, mirroring how the Zapping token is
 * shared through storage.
 */

type StoredToken = {
  accessToken: string;
  /** epoch ms when the token stops being valid. */
  expiresAt: number;
};

export type YoutubeAuthStatus = 'unknown' | 'connected' | 'disconnected';

// Shared across all hook instances so they don't each hit /token on mount.
let inFlight: Promise<string | undefined> | undefined;

export function useYoutubeAccessToken() {
  return useLocalStorageState<StoredToken | undefined>('youtubeToken', {
    defaultValue: undefined
  });
}

export function useYoutubeAuth() {
  const [token, setToken] = useYoutubeAccessToken();
  const [status, setStatus] = useState<YoutubeAuthStatus>('unknown');
  const tokenRef = useRef(token);
  tokenRef.current = token;

  /**
   * Return a valid access token, refreshing from the backend when the cached
   * one is missing or within a minute of expiry. `force` skips the cache (used
   * after a 401 from the YouTube API). Returns undefined when disconnected.
   */
  const getAccessToken = useCallback(
    async (force = false): Promise<string | undefined> => {
      const current = tokenRef.current;
      if (
        !force &&
        current &&
        current.expiresAt - Date.now() > 60_000
      ) {
        return current.accessToken;
      }
      inFlight =
        inFlight ??
        (async () => {
          try {
            const res = await fetch('/api/youtube/token');
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
            console.error('[youtube] token fetch failed', err);
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
    window.location.assign('/api/youtube/login');
  }, []);

  const disconnect = useCallback(async () => {
    try {
      await fetch('/api/youtube/logout', { method: 'POST' });
    } catch (err) {
      console.error('[youtube] logout failed', err);
    }
    setToken(undefined);
    setStatus('disconnected');
  }, [setToken]);

  const isConnected =
    status === 'connected' ||
    Boolean(token && token.expiresAt > Date.now());

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
