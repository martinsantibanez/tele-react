import { useEffect } from 'react';
import useLocalStorageState from 'use-local-storage-state';
import useSessionStorageState from 'use-session-storage-state';
import { v4 as uuidv4 } from 'uuid';
import { mintPlayToken, sendHeartbeat } from '@/lib/zapping';

/**
 * The live streaming token appended to HLS URLs. It is auto-managed by
 * `useZappingSession` (minted from the durable loginToken and kept alive by
 * heartbeats), so consumers just read it. Kept in sessionStorage for backwards
 * compatibility with shared screens that still carry a token.
 */
export function useZappingToken() {
  return useSessionStorageState<string | undefined>('playToken', {
    defaultValue: window.sessionStorage.getItem('playToken') || undefined
  });
}

/**
 * Durable Zapping credential the user provides once (from the webplayer's
 * `sessionStorage.loginToken`). Persisted in localStorage; does not rotate.
 */
export function useZappingLoginToken() {
  return useLocalStorageState<string | undefined>('zappingLoginToken', {
    defaultValue: undefined
  });
}

/** Stable per-device id used to mint/keep-alive the play session. */
export function useZappingUuid() {
  const [uuid, setUuid] = useLocalStorageState<string | undefined>(
    'zappingUuid',
    { defaultValue: undefined }
  );
  useEffect(() => {
    if (!uuid) setUuid(uuidv4());
  }, [uuid, setUuid]);
  return uuid;
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Mount once (see ClientProviders): mints a playToken from the stored
 * loginToken and keeps it alive with a heartbeat loop, writing the live token
 * into the shared `playToken` slot. Does nothing until a loginToken is set, so
 * the legacy paste-a-playToken flow keeps working as a fallback.
 */
export function useZappingSession() {
  const [loginToken] = useZappingLoginToken();
  const uuid = useZappingUuid();
  const [, setPlayToken] = useZappingToken();

  useEffect(() => {
    if (!loginToken || !uuid) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let playToken: string | undefined;

    const beat = async () => {
      if (cancelled || !playToken) return;
      let nextHb = 15;
      try {
        nextHb = await sendHeartbeat(playToken, uuid);
      } catch (err) {
        console.error('[zapping] heartbeat failed, re-minting', err);
        try {
          playToken = await mintPlayToken(loginToken, uuid);
          if (!cancelled) setPlayToken(playToken);
        } catch (mintErr) {
          console.error('[zapping] re-mint failed', mintErr);
        }
      }
      if (!cancelled) {
        timer = setTimeout(beat, Math.max(5, nextHb) * 1000);
      }
    };

    const start = async () => {
      try {
        playToken = await mintPlayToken(loginToken, uuid);
        if (cancelled) return;
        // The CDN authorises the token only after the session is active, which
        // takes the first one or two heartbeats. Warm it up before exposing the
        // token so the first playlist request doesn't 403.
        await sendHeartbeat(playToken, uuid);
        await sleep(2500);
        if (cancelled) return;
        const nextHb = await sendHeartbeat(playToken, uuid);
        if (cancelled) return;
        setPlayToken(playToken);
        timer = setTimeout(beat, Math.max(5, nextHb) * 1000);
      } catch (err) {
        console.error('[zapping] session start failed', err);
      }
    };

    start();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [loginToken, uuid, setPlayToken]);
}
