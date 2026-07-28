'use client';
import useLocalStorageState from 'use-local-storage-state';

/**
 * Twitch channels typed in by hand. No feed knows about them, so the account
 * names are kept here — the source itself is rebuilt from the name, which is
 * all a Twitch embed needs.
 */
export function useCustomTwitchAccounts() {
  return useLocalStorageState<string[]>('_tele_twitch_accounts_', {
    defaultValue: []
  });
}
