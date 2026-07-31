'use client';
import { ApiClient } from '@twurple/api';
import { StaticAuthProvider } from '@twurple/auth';
import { useEffect, useSyncExternalStore } from 'react';
import { SourceType } from '../sources';
import { useTwitchToken } from './useTwitchToken';

export const TWITCH_CLIENT_ID = '0u3rttp1lk618elmdh5sg5b338dlrs';

/** How long to wait before trying again after a failed fetch. */
const RETRY_MS = 60 * 1000;

type Snapshot = { sources: SourceType[]; isLoading: boolean };

const EMPTY: Snapshot = { sources: [], isLoading: false };

/**
 * One fetch shared by every mounted consumer, as in the Zapping and YouTube
 * catalogues: the picker and the zapping reel both read this list, and neither
 * of them should be the reason the other one re-requests it. Kept in memory
 * rather than localStorage — it is a list of who is *live right now*, which is
 * stale the moment it is stored.
 */
let snapshot = EMPTY;
let fetchedToken: string | undefined;
let lastAttempt = 0;
let inFlight = false;
const listeners = new Set<() => void>();

function publish(next: Snapshot) {
  snapshot = next;
  listeners.forEach(listener => listener());
}

async function fetchFollowed(token: string): Promise<SourceType[]> {
  const authProvider = new StaticAuthProvider(TWITCH_CLIENT_ID, token);
  const apiClient = new ApiClient({ authProvider });

  const currentUserResponse = await fetch('https://api.twitch.tv/helix/users', {
    headers: {
      Authorization: `Bearer ${token}`,
      'Client-Id': TWITCH_CLIENT_ID
    }
  });
  const currentUser = await currentUserResponse.json();
  const userId = currentUser.data[0].id;

  const followedResponse = await apiClient.streams.getFollowedStreams(userId);

  return Promise.all(
    followedResponse.data.map(async followed => {
      const avatar = await apiClient.users.getUserById(followed.userId);
      return {
        slug: `custom_twitch-${followed.userName}`,
        name: followed.userName,
        imageUrl: avatar?.profilePictureUrl,
        twitchAccount: followed.userName
      };
    })
  );
}

function load(token: string | undefined) {
  // Disconnecting takes the list with it: it was read for a session that is
  // over, and the tab must not go on listing someone else's channels.
  if (!token) {
    fetchedToken = undefined;
    if (snapshot !== EMPTY) publish(EMPTY);
    return;
  }
  if (inFlight || token === fetchedToken) return;
  if (Date.now() - lastAttempt < RETRY_MS) return;
  lastAttempt = Date.now();
  inFlight = true;
  publish({ ...snapshot, isLoading: true });
  fetchFollowed(token)
    .then(sources => {
      fetchedToken = token;
      publish({ sources, isLoading: false });
    })
    .catch(err => {
      console.error('[twitch] followed streams fetch failed', err);
      publish({ ...snapshot, isLoading: false });
    })
    .finally(() => {
      inFlight = false;
    });
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const getSnapshot = () => snapshot;
/** The server has no token to read, so there is nobody being followed yet. */
const getServerSnapshot = () => EMPTY;

/**
 * The Twitch channels the connected account follows that are on air, as sources.
 *
 * This used to be state inside the picker; it is a hook now for the same reason
 * every other catalogue is one — the zapping reel walks the same list, and a
 * catalogue that only exists while the sidebar is open cannot be walked from
 * anywhere else.
 */
export function useTwitchFollowedSources(): Snapshot {
  const [token] = useTwitchToken();
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    load(token);
  }, [token]);

  return state;
}
