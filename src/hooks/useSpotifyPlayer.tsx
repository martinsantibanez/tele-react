'use client';
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import useLocalStorageState from 'use-local-storage-state';
import {
  fetchSpotifyDevices,
  fetchSpotifyPlayback,
  pauseSpotifyPlayback,
  seekSpotifyPlayback,
  setSpotifyVolume,
  skipSpotifyTrack,
  SpotifyAuthError,
  SpotifyNoDeviceError,
  SpotifyPlayback,
  SpotifyPremiumError,
  SpotifyRateLimitError,
  SpotifyScopeError,
  startSpotifyPlayback,
  transferSpotifyPlayback
} from '../../lib/spotify';
import {
  loadSpotifyPlayerSdk,
  SpotifyPlayerInstance
} from '../../lib/spotifyPlayerSdk';
import { useSpotifyAuth } from './useSpotifyAuth';
import { useTabLock } from './useTabLock';

/**
 * The account's one playback session, shared by every Spotify tile on the wall.
 *
 * This is the whole point of the thing, so it is worth stating plainly: what
 * plays is not owned by a tile, or by this tab, or by this app. Spotify keeps
 * one session per account, on whichever device is active, and this provider
 * does two jobs against it.
 *
 * First, it hosts a device. One tab — elected by `useTabLock`, because the Web
 * Playback SDK registers a device per instance and two devices is two sessions
 * again — runs the SDK, and that tab is where the audio comes out. It appears
 * in the device list on your phone under the name below, and can be taken over
 * from there like any speaker.
 *
 * Second, it is a remote control. Every tab, host or not, reads `/me/player` on
 * a poll and issues transport commands through the Web API. That is what makes
 * two tiles — or two tabs, or a tile and your phone — agree: none of them holds
 * the answer, they all ask the same server the same question.
 *
 * When the SDK cannot run (a free account, a browser without the DRM, a phone)
 * there is no device to host, and the tiles fall back to the old iframe embed.
 * `capability` remembers which of those it was so the next load does not have
 * to find out the hard way a second time.
 */

/** What the device list on the user's phone will call this browser. */
const DEVICE_NAME = 'Ver Tele';
const LOCK_KEY = 'spotifyPlayerHost';
/** Cross-tab nudge, so a command in one tab refreshes the others at once. */
const CHANNEL_NAME = 'spotify-playback';

/** How often `/me/player` is re-read, by whether anything is actually playing. */
const POLL_PLAYING_MS = 5000;
const POLL_IDLE_MS = 15000;
/** A command lands a beat before Spotify's state reflects it. */
const SETTLE_MS = [400, 1600];
/**
 * How long a silent SDK is given before it counts as one that cannot run. The
 * tile is showing a spinner for all of it, so this is as much a patience budget
 * as a timeout; the SDK's own failures arrive in a second or two, and only a
 * script that never answers gets anywhere near it.
 */
const SDK_TIMEOUT_MS = 8000;

export type SpotifyPlayerStatus =
  /** No connected account; nothing to play with. */
  | 'disconnected'
  /** Connected, but no tile has asked for a player yet. */
  | 'idle'
  /** This tab is bringing a device up. */
  | 'loading'
  /** This tab hosts the device. */
  | 'ready'
  /** Another tab hosts it, or the session lives on a device elsewhere. */
  | 'remote'
  /** Free account: the player is Premium-only. Falls back to the embed. */
  | 'premium'
  /** Browser cannot host a device. Falls back to the embed. */
  | 'unsupported'
  /** The grant does not cover the player scopes; the user has to reconnect. */
  | 'scope'
  | 'error';

/** Remembered across loads, so a free account is not re-probed every time. */
type Capability = 'unknown' | 'ok' | 'premium' | 'unsupported';

type SpotifyPlayerValue = {
  status: SpotifyPlayerStatus;
  /**
   * Whether tiles should render as Connect views rather than iframe embeds.
   * False means the embed, and the embed is the only thing that will make a
   * sound for this user.
   */
  connectEnabled: boolean;
  /** True while it is still unknown which of the two a tile should be. */
  isProbing: boolean;
  /** This browser's device, when this tab is the one hosting it. */
  deviceId?: string;
  isHost: boolean;
  playback?: SpotifyPlayback;
  error?: string;
  /** Mount-time registration: a player exists while at least one tile wants it. */
  retain: () => () => void;
  refresh: () => void;
  play: (uri?: string) => Promise<void>;
  pause: () => Promise<void>;
  skip: (direction: 'next' | 'previous') => Promise<void>;
  seek: (positionMs: number) => Promise<void>;
  setVolume: (percent: number) => Promise<void>;
  /** Move the session onto this browser's device. */
  claimDevice: () => Promise<void>;
};

const noop = async () => {};

const SpotifyPlayerContext = createContext<SpotifyPlayerValue>({
  status: 'disconnected',
  connectEnabled: false,
  isProbing: false,
  isHost: false,
  retain: () => () => {},
  refresh: () => {},
  play: noop,
  pause: noop,
  skip: noop,
  seek: noop,
  setVolume: noop,
  claimDevice: noop
});

export const useSpotifyPlayer = () => useContext(SpotifyPlayerContext);

/**
 * Registers a tile's interest in the player for as long as it is mounted. The
 * device is only brought up while something wants it, and goes away with the
 * last tile — a wall with no music on it should not sit in the account's device
 * list.
 *
 * This belongs on the *dispatcher* — `SpotifySource` — and not on the Connect
 * view it may or may not choose. Putting it on the view is circular and visibly
 * so: no tile has retained, so nothing is probing, so the view renders, so it
 * retains, so probing starts, so the view is replaced by the spinner, so the
 * retain is released, so probing stops. The tile flickers between the two
 * forever. A tile declares that it wants a player before anyone asks what kind
 * of player it is going to get.
 */
export function useSpotifyPlayerTile() {
  const player = useSpotifyPlayer();
  const { retain } = player;
  useEffect(() => retain(), [retain]);
  return player;
}

export function SpotifyPlayerProvider({ children }: PropsWithChildren) {
  const { isConnected, getAccessToken } = useSpotifyAuth();
  const [capability, setCapability] = useLocalStorageState<Capability>(
    'spotifyPlayerCapability',
    { defaultValue: 'unknown' }
  );

  const [retainCount, setRetainCount] = useState(0);
  const [deviceId, setDeviceId] = useState<string>();
  const [playback, setPlayback] = useState<SpotifyPlayback>();
  const [error, setError] = useState<string>();
  const [sdkReady, setSdkReady] = useState(false);
  /**
   * The account is connected on a grant that does not cover the player scopes.
   * Nothing refreshes its way out of that — a refresh token only ever mints the
   * scopes it was issued with — so the player stays off until the user passes
   * through the consent screen again, and meanwhile the embed still plays.
   * Deliberately *not* remembered in `capability`: this is a property of one
   * grant, not of this browser, and reconnecting fixes it.
   */
  const [scopeDenied, setScopeDenied] = useState(false);

  // Held in a ref because the SDK's token callback outlives every render, and
  // rebuilding the player to pick up a new function identity would drop the
  // device out of the account's list for no reason.
  const getTokenRef = useRef(getAccessToken);
  getTokenRef.current = getAccessToken;

  /**
   * Whether Connect is on the table at all. False sends every tile to the
   * embed, and with it goes the reason to poll or to host anything: a browser
   * playing iframes has no session to watch.
   */
  const connectEnabled =
    isConnected &&
    !scopeDenied &&
    capability !== 'premium' &&
    capability !== 'unsupported';

  // Nothing runs — no device, no polling — until a tile says it wants one.
  const wanted = connectEnabled && retainCount > 0;
  const isHost = useTabLock(LOCK_KEY, wanted);

  const retain = useCallback(() => {
    setRetainCount(count => count + 1);
    let released = false;
    return () => {
      if (released) return;
      released = true;
      setRetainCount(count => Math.max(0, count - 1));
    };
  }, []);

  /**
   * Run a Web API call with a valid token, retrying once against a fresh one
   * when the old had expired underneath. The failures that mean something to
   * the UI are turned into state here rather than thrown at every call site.
   */
  const withToken = useCallback(
    async <T,>(fn: (token: string) => Promise<T>): Promise<T | undefined> => {
      const token = await getTokenRef.current();
      if (!token) return undefined;
      try {
        return await fn(token);
      } catch (err) {
        if (err instanceof SpotifyAuthError) {
          const fresh = await getTokenRef.current(true);
          if (!fresh) return undefined;
          return await fn(fresh);
        }
        if (err instanceof SpotifyPremiumError) {
          setCapability('premium');
          setError('Spotify Premium es necesario para reproducir aquí.');
          return undefined;
        }
        if (err instanceof SpotifyScopeError) {
          setScopeDenied(true);
          return undefined;
        }
        if (err instanceof SpotifyNoDeviceError) {
          setError('No hay ningún dispositivo de Spotify disponible.');
          return undefined;
        }
        throw err;
      }
    },
    [setCapability]
  );

  // --- the shared truth ----------------------------------------------------

  const refreshRef = useRef<() => void>(() => {});
  const refresh = useCallback(() => refreshRef.current(), []);

  // The poll reads its own last answer to decide how soon to ask again.
  const playbackRef = useRef(playback);
  playbackRef.current = playback;

  /**
   * One channel per tab, used to both send and receive: a BroadcastChannel
   * never delivers to the object that posted, so sharing it is what stops this
   * tab's own commands from bouncing back as a redundant refresh.
   */
  const channelRef = useRef<BroadcastChannel | undefined>(undefined);
  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return;
    const channel = new BroadcastChannel(CHANNEL_NAME);
    channel.onmessage = () => refreshRef.current();
    channelRef.current = channel;
    return () => {
      channel.close();
      channelRef.current = undefined;
    };
  }, []);

  const announce = useCallback(() => {
    channelRef.current?.postMessage({ type: 'changed' });
  }, []);

  useEffect(() => {
    if (!wanted) {
      setPlayback(undefined);
      return;
    }
    let disposed = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let settling: ReturnType<typeof setTimeout>[] = [];
    /**
     * Epoch ms before which Spotify has asked not to be called again. Every
     * path into `read` goes through it, which is the point: the settle
     * refreshes and the cross-tab nudges are exactly what turn one 429 into a
     * dozen, each one earning the next.
     */
    let backoffUntil = 0;

    /**
     * The read currently on the wire. Overlapping reads are one request, not
     * several: a command's settle timers, a cross-tab nudge and the poll itself
     * all land within the same beat, and once per tile at that. Coalescing them
     * here is what keeps a single click from costing a burst of identical calls
     * — which is how the quota gets spent, and a spent quota is what makes
     * Spotify start refusing.
     */
    let inFlight: Promise<void> | undefined;

    const readOnce = async () => {
      if (disposed) return;
      const waiting = backoffUntil - Date.now();
      if (waiting > 0) {
        clearTimeout(timer);
        timer = setTimeout(read, waiting);
        return;
      }
      let retryIn: number | undefined;
      try {
        const next = await withToken(fetchSpotifyPlayback);
        if (disposed) return;
        setPlayback(next);
        // A reading that names a device settles any "nothing to play on" the
        // last command left behind.
        if (next?.deviceId) setError(undefined);
      } catch (err) {
        if (err instanceof SpotifyRateLimitError) {
          backoffUntil = Date.now() + err.retryAfterMs;
          retryIn = err.retryAfterMs;
          console.warn(
            `[spotify] rate limited, holding off ${err.retryAfterMs}ms`
          );
        } else {
          console.error('[spotify] playback poll failed', err);
        }
      }
      if (disposed) return;
      // Nothing playing is not worth asking about every five seconds.
      const interval =
        playbackRef.current?.isPlaying === true ? POLL_PLAYING_MS : POLL_IDLE_MS;
      timer = setTimeout(read, retryIn ?? interval);
    };

    const read = () => {
      if (disposed) return;
      inFlight ??= readOnce().finally(() => {
        inFlight = undefined;
      });
    };

    refreshRef.current = () => {
      clearTimeout(timer);
      settling.forEach(clearTimeout);
      read();
      // Spotify's own state lags the command that changed it, so ask again.
      settling = SETTLE_MS.map(delay =>
        setTimeout(() => {
          if (!disposed) read();
        }, delay)
      );
    };

    read();

    return () => {
      disposed = true;
      clearTimeout(timer);
      settling.forEach(clearTimeout);
      refreshRef.current = () => {};
    };
  }, [wanted, withToken]);

  // --- the device ----------------------------------------------------------

  const playerRef = useRef<SpotifyPlayerInstance | undefined>(undefined);
  const deviceIdRef = useRef<string | undefined>(undefined);
  deviceIdRef.current = deviceId;
  const capabilityRef = useRef(capability);
  capabilityRef.current = capability;
  const scopeDeniedRef = useRef(scopeDenied);
  scopeDeniedRef.current = scopeDenied;

  useEffect(() => {
    if (!isHost) {
      setSdkReady(false);
      setDeviceId(undefined);
      return;
    }
    let disposed = false;
    let instance: SpotifyPlayerInstance | undefined;

    // The SDK reports every way it can fail — except never answering at all,
    // which is what a blocked script or a stalled handshake looks like. A tile
    // cannot wait on that forever, so silence past this point counts as a
    // browser that cannot host a device and the embed takes over.
    const watchdog = setTimeout(() => {
      if (disposed || capabilityRef.current !== 'unknown') return;
      // A grant without `streaming` also produces silence here, and that is
      // not the browser's fault — remembering it as `unsupported` would keep
      // the player off even after the user reconnects.
      if (scopeDeniedRef.current) return;
      console.error('[spotify] sdk never became ready');
      setCapability('unsupported');
    }, SDK_TIMEOUT_MS);

    loadSpotifyPlayerSdk()
      .then(Spotify => {
        if (disposed) return;
        instance = new Spotify.Player({
          name: DEVICE_NAME,
          getOAuthToken: cb => {
            getTokenRef.current()
              .then(token => {
                if (token) cb(token);
              })
              .catch(err => console.error('[spotify] sdk token failed', err));
          },
          volume: 0.8
        });
        playerRef.current = instance;

        instance.addListener('ready', ({ device_id }) => {
          if (disposed) return;
          setDeviceId(device_id);
          setSdkReady(true);
          setCapability('ok');
          setError(undefined);
        });
        instance.addListener('not_ready', () => {
          if (disposed) return;
          setSdkReady(false);
        });
        instance.addListener('initialization_error', ({ message }) => {
          console.error('[spotify] sdk initialization', message);
          setCapability('unsupported');
        });
        instance.addListener('account_error', ({ message }) => {
          console.error('[spotify] sdk account', message);
          setCapability('premium');
        });
        // Almost always the missing `streaming` scope rather than a bad token:
        // the token is minted fresh a line above this.
        instance.addListener('authentication_error', ({ message }) => {
          console.error('[spotify] sdk auth', message);
          setScopeDenied(true);
        });
        instance.addListener('playback_error', ({ message }) => {
          console.error('[spotify] sdk playback', message);
        });
        // The SDK knows before the Web API does, so this is what makes the
        // hosting tab feel instant; the poll still has the last word.
        instance.addListener('player_state_changed', state => {
          if (disposed || !state) return;
          const track = state.track_window?.current_track ?? undefined;
          setPlayback(current => ({
            ...current,
            contextUri: state.context?.uri ?? current?.contextUri,
            trackUri: track?.uri,
            trackName: track?.name,
            artists:
              track?.artists
                ?.map(artist => artist.name)
                .filter(Boolean)
                .join(', ') || undefined,
            imageUrl: track?.album?.images?.[0]?.url,
            isPlaying: !state.paused,
            position: state.position,
            duration: state.duration || track?.duration_ms || 0,
            fetchedAt: Date.now(),
            deviceId: deviceIdRef.current,
            deviceName: DEVICE_NAME,
            volumePercent: current?.volumePercent,
            shuffle: current?.shuffle ?? false,
            repeat: current?.repeat ?? 'off'
          }));
          announce();
        });

        return instance.connect();
      })
      .catch(err => {
        console.error('[spotify] sdk load failed', err);
        if (!disposed) setCapability('unsupported');
      });

    return () => {
      disposed = true;
      clearTimeout(watchdog);
      instance?.disconnect();
      if (playerRef.current === instance) playerRef.current = undefined;
      setSdkReady(false);
      setDeviceId(undefined);
    };
  }, [isHost, setCapability, announce]);

  // --- commands ------------------------------------------------------------

  /**
   * Where a command should land. This browser's device when it has one — the
   * point of hosting it is that the sound comes out here — and otherwise
   * whatever the account is already using, so a tab that is not the host still
   * drives the phone or the desktop app rather than doing nothing.
   */
  const resolveDevice = useCallback(async (): Promise<string | undefined> => {
    if (sdkReady && deviceIdRef.current) return deviceIdRef.current;
    const active = playbackRef.current?.deviceId;
    if (active) return active;
    const list = (await withToken(fetchSpotifyDevices)) ?? [];
    return (list.find(device => device.isActive) ?? list[0])?.id;
  }, [sdkReady, withToken]);

  const command = useCallback(
    async (fn: (token: string, device?: string) => Promise<void>) => {
      const device = await resolveDevice();
      if (!device) {
        setError(
          'Abre Spotify en este navegador o en tu teléfono para elegir dónde suena.'
        );
        return;
      }
      setError(undefined);
      try {
        await withToken(token => fn(token, device));
      } catch (err) {
        console.error('[spotify] command failed', err);
        setError(
          err instanceof SpotifyRateLimitError
            ? 'Spotify está recibiendo demasiadas peticiones; probá en unos segundos.'
            : 'Spotify no aceptó el comando.'
        );
      }
      announce();
      refresh();
    },
    [announce, refresh, resolveDevice, withToken]
  );

  const play = useCallback(
    async (uri?: string) => {
      // Browsers want a gesture in scope before a media element makes noise,
      // and the SDK's element was created long before this click.
      await playerRef.current?.activateElement?.().catch(() => {});
      // Optimistic, so the tile flips the moment it is clicked rather than a
      // poll later; the refresh behind it corrects anything guessed wrong.
      setPlayback(current =>
        current
          ? {
              ...current,
              isPlaying: true,
              contextUri: uri ?? current.contextUri,
              fetchedAt: Date.now()
            }
          : current
      );
      await command((token, device) =>
        startSpotifyPlayback(token, { uri, deviceId: device })
      );
    },
    [command]
  );

  const pause = useCallback(async () => {
    setPlayback(current =>
      current ? { ...current, isPlaying: false, fetchedAt: Date.now() } : current
    );
    await command((token, device) => pauseSpotifyPlayback(token, device));
  }, [command]);

  const skip = useCallback(
    async (direction: 'next' | 'previous') => {
      await command((token, device) =>
        skipSpotifyTrack(token, direction, device)
      );
    },
    [command]
  );

  const seek = useCallback(
    async (positionMs: number) => {
      setPlayback(current =>
        current ? { ...current, position: positionMs, fetchedAt: Date.now() } : current
      );
      await command((token, device) =>
        seekSpotifyPlayback(token, positionMs, device)
      );
    },
    [command]
  );

  const setVolume = useCallback(
    async (percent: number) => {
      setPlayback(current =>
        current ? { ...current, volumePercent: percent } : current
      );
      await command((token, device) =>
        setSpotifyVolume(token, percent, device)
      );
    },
    [command]
  );

  /**
   * "Listening on…", pointed at this browser. A transfer rather than a play:
   * it moves the session as it stands — playing if it was playing, paused where
   * it was paused — which is what pulling music off your phone and into the tab
   * in front of you should do.
   */
  const claimDevice = useCallback(async () => {
    const device = deviceIdRef.current;
    if (!device) return;
    await playerRef.current?.activateElement?.().catch(() => {});
    await withToken(token =>
      transferSpotifyPlayback(token, device, playbackRef.current?.isPlaying)
    ).catch(err => console.error('[spotify] claim failed', err));
    announce();
    refresh();
  }, [announce, refresh, withToken]);

  // --- what the tiles read -------------------------------------------------

  const status: SpotifyPlayerStatus = !isConnected
    ? 'disconnected'
    : scopeDenied
      ? 'scope'
      : capability === 'premium'
        ? 'premium'
        : capability === 'unsupported'
          ? 'unsupported'
          : retainCount === 0
            ? 'idle'
            : sdkReady
              ? 'ready'
              : isHost
                ? 'loading'
                : 'remote';

  /**
   * Still finding out whether this browser can host a device, so a tile should
   * wait rather than flash an embed it is about to replace. A tab that is not
   * the host never finds out first-hand — it learns from `capability`, which
   * the hosting tab writes to localStorage and every tab reads.
   */
  const isProbing = wanted && capability === 'unknown' && !sdkReady;

  const value = useMemo<SpotifyPlayerValue>(
    () => ({
      status,
      connectEnabled,
      isProbing,
      deviceId,
      isHost,
      playback,
      error,
      retain,
      refresh,
      play,
      pause,
      skip,
      seek,
      setVolume,
      claimDevice
    }),
    [
      status,
      connectEnabled,
      isProbing,
      deviceId,
      isHost,
      playback,
      error,
      retain,
      refresh,
      play,
      pause,
      skip,
      seek,
      setVolume,
      claimDevice
    ]
  );

  return (
    <SpotifyPlayerContext.Provider value={value}>
      {children}
    </SpotifyPlayerContext.Provider>
  );
}

/**
 * The playing position, ticking. Spotify is asked for it every few seconds and
 * a progress bar wants it every frame or so, so the gap is filled by running
 * the clock forward from the last reading.
 */
export function useSpotifyProgress(playback?: SpotifyPlayback): number {
  const [now, setNow] = useState(() => Date.now());
  const isPlaying = playback?.isPlaying ?? false;

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(interval);
  }, [isPlaying]);

  if (!playback) return 0;
  if (!playback.isPlaying) return playback.position;
  const elapsed = Math.max(0, now - playback.fetchedAt);
  const position = playback.position + elapsed;
  return playback.duration ? Math.min(position, playback.duration) : position;
}
