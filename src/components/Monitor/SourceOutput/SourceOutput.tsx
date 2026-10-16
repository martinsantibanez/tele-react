'use client';
import { findSignal, Signal, SourceType } from '../../../sources';
import { TwitchSource } from './SourceProvider/TwitchSource';
import { TwitterTimeline } from './SourceProvider/TwitterTimeline';
import { SpotifySource } from './SourceProvider/SpotifySource';
import VideoPlayer from './SourceProvider/VideoJS';
import { YoutubeSource } from './SourceProvider/YoutubeSource';
import { ZappingSource } from './SourceProvider/ZappingSource';

export function IframeOutput({ src }: { src: string }) {
  // Permissions are not inherited: a player nested inside the embedded page
  // only gets autoplay and fullscreen if this frame passes them down.
  return (
    <iframe
      src={src}
      className="w-full h-full"
      frameBorder="0"
      allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
      allowFullScreen
    />
  );
}

type Props = {
  muted?: boolean;
  source: SourceType;
  /** Key of the signal the screen picked; unset plays the source's default. */
  activeSignal?: string;
  /**
   * Whether this is the tile filling the screen. Players that keep their
   * clicks to themselves are held at arm's length on the wall — a press there
   * is meant for the tile, not for them — and handed the pointer back here,
   * where there is nothing left to pick and their own controls are useful.
   */
  fullscreen?: boolean;
  /**
   * Holds the picture still without tearing the player down, for a tile
   * nobody can see. Only the video.js players answer to it: they are the ones
   * decoding in this page, while an embed decodes inside its own frame.
   */
  paused?: boolean;
};

/** The one input the screen asked for, mirror included. */
function SignalOutput({
  signal,
  source,
  muted,
  fullscreen,
  paused
}: {
  signal: Signal;
  source: SourceType;
  muted: boolean;
  fullscreen: boolean;
  paused: boolean;
}) {
  const { type, input } = signal;
  if (type === 'iframe' && input.iframeSrc) {
    return <IframeOutput src={input.iframeSrc} />;
  } else if (type === 'm3u8' && input.m3u8Url && typeof window !== 'undefined') {
    return <VideoPlayer src={input.m3u8Url} muted={muted} paused={paused} />;
  } else if (type === 'youtube' && input.youtubeVideoId) {
    return (
      <YoutubeSource
        videoId={input.youtubeVideoId}
        muted={muted}
        interactive={fullscreen}
      />
    );
  } else if (type === 'twitch' && input.twitchAccount) {
    return <TwitchSource channel={input.twitchAccount} muted={muted} />;
  } else if (type === 'youtubeChannel' && input.youtubeChannelId) {
    return (
      <YoutubeSource
        channelId={input.youtubeChannelId}
        muted={muted}
        interactive={fullscreen}
      />
    );
  } else if (type === 'spotify' && input.spotifyUri) {
    // The Connect tile has no iframe to fill itself with, so it renders the
    // channel's own name and cover until the session says otherwise.
    return (
      <SpotifySource
        uri={input.spotifyUri}
        muted={muted}
        name={source.name}
        imageUrl={source.imageUrl}
      />
    );
  }
  return null;
}

export function SourceOutput({
  source,
  activeSignal,
  muted = true,
  fullscreen = false,
  paused = false
}: Props) {
  // A key that no longer resolves — a mirror the feed dropped — falls through
  // to the default chain rather than leaving the tile blank.
  const signal = activeSignal ? findSignal(source, activeSignal) : undefined;
  if (signal) {
    return (
      <SignalOutput
        signal={signal}
        source={source}
        muted={muted}
        fullscreen={fullscreen}
        paused={paused}
      />
    );
  }

  if (source.iframeSrc) {
    return <IframeOutput src={source.iframeSrc} />;
  } else if (source.codeHtml) {
    return (
      <div
        dangerouslySetInnerHTML={{
          __html: source.codeHtml
        }}
      />
    );
  } else if (source.component) {
    const Component = source.component;
    return <Component />;
  } else if (source.m3u8Url && typeof window !== 'undefined') {
    return <VideoPlayer src={source.m3u8Url} muted={muted} paused={paused} />;
  } else if (source.youtubeVideoId) {
    return (
      <YoutubeSource
        videoId={source.youtubeVideoId}
        muted={muted}
        interactive={fullscreen}
      />
    );
  } else if (source.twitterAcount) {
    return <TwitterTimeline account={source.twitterAcount} />;
  } else if (source.twitchAccount) {
    return <TwitchSource channel={source.twitchAccount} muted={muted} />;
  } else if (source.zappingChannel) {
    return (
      <ZappingSource
        channelId={source.zappingChannel}
        muted={muted}
        paused={paused}
      />
    );
  } else if (source.spotifyUri) {
    return (
      <SpotifySource
        uri={source.spotifyUri}
        muted={muted}
        name={source.name}
        imageUrl={source.imageUrl}
      />
    );
  }

  return null;
}
