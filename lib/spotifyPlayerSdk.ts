// The Spotify Web Playback SDK: what turns this browser into a real Spotify
// Connect device.
//
// Worth being precise about what that means, because it is not what the embed
// in `SpotifyEmbed` does. The embed is a player in an iframe: its audio belongs
// to that iframe, two of them play two different things, and nothing outside
// the page knows it exists. A device is the other thing entirely — it shows up
// in the device list of the Spotify app on your phone, it can be handed the
// session from there, and the session it plays is the account's one session. So
// every tile, every tab and the phone agree on what is playing, because there
// is only one thing playing.
//
// The cost of that is a short list of hard requirements, all of them Spotify's:
//
//   - Premium. A free account cannot host a device; the SDK reports it through
//     `account_error` and there is no way around it.
//   - EME/Widevine. The stream is DRM'd, so a Chromium build without the
//     proprietary codecs fails at `initialization_error`.
//   - Not mobile browsers. Spotify does not support them, and says so the same
//     way — through `initialization_error`.
//
// None of those are recoverable, which is why `SpotifyPlayerFailure` names them
// separately from the transient ones: the caller falls back to the embed for
// these and only for these.

/** Milliseconds and a fraction, as the SDK reports them. */
export type SdkPlayerState = {
  paused: boolean;
  position: number;
  duration: number;
  context?: { uri?: string | null };
  track_window?: {
    current_track?: {
      uri?: string;
      name?: string;
      duration_ms?: number;
      artists?: { name?: string }[];
      album?: { images?: { url?: string }[] };
    } | null;
  };
};

type ErrorEvent = { message: string };
type ReadyEvent = { device_id: string };

export type SpotifyPlayerInstance = {
  connect: () => Promise<boolean>;
  disconnect: () => void;
  /**
   * Satisfies the browser's autoplay rules by starting a silent element while
   * a user gesture is still in scope. Without it the first `play` on some
   * browsers is accepted by Spotify and then silently produces no sound.
   */
  activateElement?: () => Promise<void>;
  setVolume: (volume: number) => Promise<void>;
  getCurrentState: () => Promise<SdkPlayerState | null>;
  addListener: {
    (event: 'ready' | 'not_ready', cb: (e: ReadyEvent) => void): boolean;
    (
      event:
        | 'initialization_error'
        | 'authentication_error'
        | 'account_error'
        | 'playback_error',
      cb: (e: ErrorEvent) => void
    ): boolean;
    (event: 'player_state_changed', cb: (e: SdkPlayerState | null) => void): boolean;
  };
  removeListener: (event: string) => boolean;
};

type PlayerOptions = {
  name: string;
  getOAuthToken: (cb: (token: string) => void) => void;
  volume?: number;
};

type SpotifyNamespace = {
  Player: new (options: PlayerOptions) => SpotifyPlayerInstance;
};

declare global {
  interface Window {
    Spotify?: SpotifyNamespace;
    onSpotifyWebPlaybackSDKReady?: () => void;
  }
}

const SDK_SRC = 'https://sdk.scdn.co/spotify-player.js';

/** The ways hosting a device can be impossible rather than merely broken. */
export type SpotifyPlayerFailure =
  /** Free account. */
  | 'premium'
  /** No DRM, or a browser Spotify does not support. */
  | 'unsupported'
  /** The token was rejected; reconnecting may fix it. */
  | 'auth'
  | 'error';

// Like the IFrame API next door, the SDK announces itself through a single
// global callback, so it can only be loaded once per page however many players
// end up wanting it. React's development double-mount is the other reason this
// is module-level: both mounts wait on the one script.
let sdkPromise: Promise<SpotifyNamespace> | undefined;

/**
 * Resolves with the SDK namespace once the script has loaded and announced
 * itself. Rejects if the script cannot be fetched at all — an extension or a
 * content blocker, usually, which is `unsupported` as far as the caller cares.
 */
export function loadSpotifyPlayerSdk(): Promise<SpotifyNamespace> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('spotify sdk needs a browser'));
  }
  sdkPromise =
    sdkPromise ??
    new Promise<SpotifyNamespace>((resolve, reject) => {
      if (window.Spotify) {
        resolve(window.Spotify);
        return;
      }
      window.onSpotifyWebPlaybackSDKReady = () => {
        if (window.Spotify) resolve(window.Spotify);
        else reject(new Error('spotify sdk loaded without a namespace'));
      };
      const script = document.createElement('script');
      script.src = SDK_SRC;
      script.async = true;
      script.onerror = () => {
        // Let a later attempt try again rather than caching the failure.
        sdkPromise = undefined;
        reject(new Error('spotify sdk script failed to load'));
      };
      document.body.appendChild(script);
    });
  return sdkPromise;
}
