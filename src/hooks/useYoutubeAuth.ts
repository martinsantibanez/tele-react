import {
  useCallback,
  useEffect,
  useRef,
  useSyncExternalStore
} from 'react';
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

type TokenResult = {
  accessToken?: string;
  /** Unset when the backend couldn't be reached: nothing was learnt. */
  status?: YoutubeAuthStatus;
};

// Shared across all hook instances so they don't each hit /token on mount.
// It resolves to the outcome rather than setting anyone's state itself, so
// every instance that awaited it learns the status, not just the one that
// started it.
let inFlight: Promise<TokenResult> | undefined;

/**
 * What the backend last said about the session, shared by every instance. Kept
 * per instance it went wrong: only the instances that happened to await a
 * token fetch learnt it, so the rest stayed `unknown` and judged the session by
 * the cached token's clock alone — and for the minutes between its expiry and
 * the next refresh, YouTube was disconnected in some of the page's hooks and
 * not in others.
 */
let sharedStatus: YoutubeAuthStatus = 'unknown';
const statusListeners = new Set<() => void>();
function setSharedStatus(status: YoutubeAuthStatus) {
  if (status === sharedStatus) return;
  sharedStatus = status;
  statusListeners.forEach(listener => listener());
}
const subscribeStatus = (listener: () => void) => {
  statusListeners.add(listener);
  return () => {
    statusListeners.delete(listener);
  };
};
const getStatus = () => sharedStatus;
const getServerStatus = (): YoutubeAuthStatus => 'unknown';

export function useYoutubeAccessToken() {
  return useLocalStorageState<StoredToken | undefined>('youtubeToken', {
    defaultValue: undefined
  });
}

export function useYoutubeAuth() {
  const [token, setToken] = useYoutubeAccessToken();
  const status = useSyncExternalStore(
    subscribeStatus,
    getStatus,
    getServerStatus
  );
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
              return { status: 'disconnected' };
            }
            if (!res.ok) throw new Error(`token endpoint ${res.status}`);
            const json = await res.json();
            const stored: StoredToken = {
              accessToken: json.accessToken,
              expiresAt: Date.now() + (json.expiresIn ?? 3600) * 1000
            };
            setToken(stored);
            return { accessToken: stored.accessToken, status: 'connected' };
          } catch (err) {
            console.error('[youtube] token fetch failed', err);
            return {};
          }
        })();
      try {
        const result = await inFlight;
        if (result.status) setSharedStatus(result.status);
        return result.accessToken;
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
      `/api/youtube/login?returnTo=${encodeURIComponent(returnTo)}`
    );
  }, []);

  const disconnect = useCallback(async () => {
    try {
      await fetch('/api/youtube/logout', { method: 'POST' });
    } catch (err) {
      console.error('[youtube] logout failed', err);
    }
    setToken(undefined);
    setSharedStatus('disconnected');
  }, [setToken]);

  // An expired token is not a lost session: the backend mints the next one
  // from the refresh token, the next time one is asked for. Only the backend
  // saying so (a 401, or logging out) disconnects. Not read off the clock
  // either, which made the answer change between two renders of the same
  // state.
  const isConnected =
    status === 'connected' || (status === 'unknown' && !!token);

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
