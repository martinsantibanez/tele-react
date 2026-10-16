import { useCallback, useEffect, useState } from 'react';
import useLocalStorageState from 'use-local-storage-state';
import useSessionStorageState from 'use-session-storage-state';
import { useIsTv } from './useIsTv';
import { useYoutubeAuth } from './useYoutubeAuth';
import { useZappingLoginToken } from './useZappingConfig';

export type SetupStep = 'zapping' | 'youtube';

const CHECK_TIMEOUT_MS = 5000;

/**
 * Whether the user has been through the wizard, connecting or not. Kept for
 * good: once they have chosen, the app never asks again on its own.
 */
function useSetupDone() {
  return useLocalStorageState<boolean>('_setup_wizard_done_', {
    defaultValue: false
  });
}

/**
 * The step on screen, in sessionStorage because connecting YouTube is a full
 * OAuth round-trip: the wizard has to be standing where it was left when the
 * user comes back from Google.
 */
function useSetupStep() {
  return useSessionStorageState<SetupStep | undefined>('_setup_wizard_step_', {
    defaultValue: undefined
  });
}

/** The wizard's steps on this device: a TV box only offers Zapping. */
export function useSetupSteps(): SetupStep[] {
  return useIsTv() ? ['zapping'] : ['zapping', 'youtube'];
}

/**
 * Which of the full-quality providers this browser is linked to.
 *
 * A TV box leaves YouTube out altogether: it has no YouTube tab, so a session
 * left over from before would only hide the TV catalogue while offering
 * nothing in its place — and there is no check to wait for.
 */
export function useConnectedProviders() {
  const [loginToken] = useZappingLoginToken();
  const { isConnected, status: youtubeStatus } = useYoutubeAuth();
  const isTv = useIsTv();
  const zapping = Boolean(loginToken);
  const youtube = !isTv && isConnected;
  return {
    zapping,
    youtube,
    any: zapping || youtube,
    /** False until the YouTube session has been checked with the backend. */
    known: isTv || youtube || youtubeStatus === 'disconnected'
  };
}

/**
 * The TV catalogue is the open-web embeds: iframes and public streams, a step
 * down in quality from Zapping or YouTube. It is only offered to someone who
 * has neither — someone who connects gets the real thing instead.
 */
export function useShowTvCatalog() {
  return !useConnectedProviders().any;
}

/**
 * Drives the first-run wizard: opens it when the user is linked to nothing
 * and has never been through it, and keeps it open across the YouTube
 * redirect until they finish or skip.
 */
export function useSetupWizard() {
  const [done, setDone] = useSetupDone();
  const [step, setStep] = useSetupStep();
  const { any, known } = useConnectedProviders();

  useEffect(() => {
    if (done || step) return;
    // Waiting for YouTube to answer keeps a connected user from seeing the
    // wizard flash up while their session is still being checked.
    if (!known || any) return;
    setStep('zapping');
  }, [done, step, known, any, setStep]);

  // If the YouTube check never answers (backend down, offline), stop waiting
  // on it rather than holding the app back indefinitely.
  const [gaveUp, setGaveUp] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setGaveUp(true), CHECK_TIMEOUT_MS);
    return () => clearTimeout(id);
  }, []);

  const finish = useCallback(() => {
    setDone(true);
    setStep(undefined);
  }, [setDone, setStep]);

  return {
    step: done ? undefined : step,
    setStep,
    finish,
    /** Still working out whether the wizard is due. */
    pending: !done && !step && !any && !gaveUp
  };
}
