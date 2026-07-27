import useLocalStorageState from 'use-local-storage-state';

export const useTwitchToken = () =>
  useLocalStorageState<string>('_tele_twitch_token_');
