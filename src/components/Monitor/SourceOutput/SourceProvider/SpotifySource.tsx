'use client';
import { Loader2 } from 'lucide-react';
import { useSpotifyPlayerTile } from '../../../../hooks/useSpotifyPlayer';
import { SpotifyConnect } from './SpotifyConnect';
import { SpotifyEmbed } from './SpotifyEmbed';

type Props = {
  /** Canonical `spotify:type:id`; see `parseSpotifyRef`. */
  uri: string;
  muted?: boolean;
  /** The channel's own name and art, shown before anything is playing. */
  name?: string;
  imageUrl?: string;
};

/**
 * Which of the two Spotify tiles this one is.
 *
 * `SpotifyConnect` is the real player — a Spotify Connect device, one session
 * shared by every tile and tab and by the app on your phone. `SpotifyEmbed` is
 * the iframe, which plays inside itself and knows nothing of any of that.
 *
 * The choice is not a preference, it is what the account and the browser allow:
 * hosting a device needs Premium and needs the DRM stack, and where either is
 * missing the embed is the only thing that will make a sound. `connectEnabled`
 * is the provider's answer to that question, remembered across loads so the
 * verdict is reached once rather than on every page view.
 *
 * The gap between the two is the reason for the spinner. Falling back means
 * mounting an iframe that immediately starts loading a player; doing that
 * speculatively and then tearing it down when the device turns out to work
 * would be a visible flash and, worse, a second thing capable of playing audio.
 * So an undecided tile shows nothing but a spinner, which resolves in about a
 * second.
 *
 * The retain lives here rather than on the Connect view, and has to: it is what
 * makes the provider go and find the answer, so a view that only mounts once
 * the answer is known can never be the thing that asks for it.
 */
export function SpotifySource({ uri, muted = true, name, imageUrl }: Props) {
  const { connectEnabled, isProbing } = useSpotifyPlayerTile();

  if (connectEnabled) {
    if (isProbing) {
      return (
        <div className="flex h-full w-full items-center justify-center bg-neutral-950 text-white/40">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      );
    }
    return (
      <SpotifyConnect
        uri={uri}
        muted={muted}
        name={name}
        imageUrl={imageUrl}
      />
    );
  }

  return <SpotifyEmbed uri={uri} muted={muted} />;
}
