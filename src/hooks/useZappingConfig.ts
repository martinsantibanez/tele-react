import { useCallback, useEffect, useState } from 'react';
import useLocalStorageState from 'use-local-storage-state';
import useSessionStorageState from 'use-session-storage-state';
import {
  checkLinkedCode,
  mintPlayToken,
  requestActivationCode,
  sendHeartbeat,
  zappingLinkUrl,
  ZAPPING_ACTIVATION_TTL_MS
} from '@/lib/zapping';

/**
 * The live streaming token appended to HLS URLs. Entirely owned by
 * `useZappingSession` (minted from the durable loginToken and kept alive by
 * heartbeats), so consumers just read it. Session-scoped because it is only
 * good for as long as this tab keeps heart-beating it.
 */
export function useZappingToken() {
  return useSessionStorageState<string | undefined>('playToken', {
    defaultValue: undefined
  });
}

/**
 * Durable Zapping credential, obtained once by pairing this browser as a device
 * (see `useZappingActivation`). Persisted in localStorage; does not rotate.
 */
export function useZappingLoginToken() {
  return useLocalStorageState<string | undefined>('zappingLoginToken', {
    defaultValue: undefined
  });
}

export type ZappingSessionStatus = 'idle' | 'starting' | 'ready' | 'error';

/**
 * Status of the play session managed by `useZappingSession`. Shared through
 * sessionStorage so the config UI can show progress while the session warms up
 * (minting + heartbeats take a few seconds).
 */
export function useZappingSessionStatus() {
  return useSessionStorageState<ZappingSessionStatus>('zappingSessionStatus', {
    defaultValue: 'idle'
  });
}

/**
 * Stable per-device id the play session is minted against. Always issued by
 * Zapping — `getcode` returns it and the account gets linked to it — so the app
 * never invents one. Undefined until this browser has been paired.
 */
export function useZappingUuid() {
  return useLocalStorageState<string | undefined>('zappingUuid', {
    defaultValue: undefined
  });
}

/** A pairing code waiting to be linked by the user. */
export type ZappingActivation = {
  code: string;
  /** The uuid the backend issued with the code; adopted once linked. */
  uuid: string;
  expiresAt: number;
};

/**
 * The pending pairing, in sessionStorage because linking means sending the user
 * off to zapping.com — the code has to survive leaving the page and coming
 * back.
 */
export function useZappingActivationState() {
  return useSessionStorageState<ZappingActivation | undefined>(
    'zappingActivation',
    { defaultValue: undefined }
  );
}

/**
 * Device pairing, the way Zapping's smart-TV app does it: ask for a code, send
 * the user to `zappingLinkUrl(code)` to type it in while logged into their
 * account, and `useZappingActivationPolling` picks up the loginToken from the
 * other side. Replaces copying the token out of a devtools console, which is
 * impossible on a phone.
 */
export function useZappingActivation() {
  const [activation, setActivation] = useZappingActivationState();
  const [uuid] = useZappingUuid();
  const [isRequesting, setIsRequesting] = useState(false);
  const [error, setError] = useState<string>();
  // Drives the countdown, and flips the pairing over to expired on its own.
  const [, tick] = useState(0);

  useEffect(() => {
    if (!activation) return;
    const id = setInterval(() => tick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, [activation]);

  const start = useCallback(async () => {
    setError(undefined);
    setIsRequesting(true);
    try {
      const { code, uuid: issuedUuid } = await requestActivationCode(uuid);
      setActivation({
        code,
        uuid: issuedUuid,
        expiresAt: Date.now() + ZAPPING_ACTIVATION_TTL_MS
      });
    } catch (err) {
      console.error('[zapping] could not get an activation code', err);
      setError('No se pudo obtener un código. Intenta de nuevo.');
    } finally {
      setIsRequesting(false);
    }
  }, [uuid, setActivation]);

  const cancel = useCallback(() => {
    setActivation(undefined);
    setError(undefined);
  }, [setActivation]);

  const isExpired = !!activation && Date.now() >= activation.expiresAt;
  const secondsLeft = activation
    ? Math.max(0, Math.ceil((activation.expiresAt - Date.now()) / 1000))
    : 0;

  return {
    activation: isExpired ? undefined : activation,
    linkUrl: activation ? zappingLinkUrl(activation.code) : undefined,
    isExpired,
    isRequesting,
    secondsLeft,
    error,
    start,
    cancel
  };
}

/**
 * Mount once (see ClientProviders): while a pairing code is pending, polls
 * Zapping until the user links it, then stores the loginToken and the uuid it
 * was bound to — which is all `useZappingSession` needs to take over.
 */
export function useZappingActivationPolling() {
  const [activation, setActivation] = useZappingActivationState();
  const [loginToken, setLoginToken] = useZappingLoginToken();
  const [, setUuid] = useZappingUuid();
  const [, setStatus] = useZappingSessionStatus();

  useEffect(() => {
    if (!activation || loginToken) return;
    if (Date.now() >= activation.expiresAt) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const poll = async () => {
      if (cancelled) return;
      if (Date.now() >= activation.expiresAt) return;
      let retryIn = 5;
      try {
        const result = await checkLinkedCode(activation.code);
        if (cancelled) return;
        if (result.logged) {
          // Order matters: the uuid the code was issued against is the one the
          // account got linked to, so it has to be in place before the
          // loginToken starts a session.
          setUuid(activation.uuid);
          setStatus('starting');
          setLoginToken(result.loginToken);
          setActivation(undefined);
          return;
        }
        retryIn = result.nextQuery;
      } catch (err) {
        console.error('[zapping] activation poll failed', err);
      }
      if (!cancelled) timer = setTimeout(poll, retryIn * 1000);
    };

    poll();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [
    activation,
    loginToken,
    setActivation,
    setLoginToken,
    setStatus,
    setUuid
  ]);
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
  const [uuid] = useZappingUuid();
  const [, setPlayToken] = useZappingToken();
  const [, setStatus] = useZappingSessionStatus();

  useEffect(() => {
    if (!loginToken || !uuid) return;

    let cancelled = false;
    setStatus('starting');
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
        setStatus('ready');
        timer = setTimeout(beat, Math.max(5, nextHb) * 1000);
      } catch (err) {
        console.error('[zapping] session start failed', err);
        if (!cancelled) setStatus('error');
      }
    };

    start();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [loginToken, uuid, setPlayToken, setStatus]);
}
