'use client';
import { findSignal, Signal, SourceType } from '../../../sources';
import { TwitchSource } from './SourceProvider/TwitchSource';
import { TwitterTimeline } from './SourceProvider/TwitterTimeline';
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
};

/** The one input the screen asked for, mirror included. */
function SignalOutput({ signal, muted }: { signal: Signal; muted: boolean }) {
  const { type, input } = signal;
  if (type === 'iframe' && input.iframeSrc) {
    return <IframeOutput src={input.iframeSrc} />;
  } else if (type === 'm3u8' && input.m3u8Url && typeof window !== 'undefined') {
    return <VideoPlayer src={input.m3u8Url} muted={muted} />;
  } else if (type === 'youtube' && input.youtubeVideoId) {
    return <YoutubeSource videoId={input.youtubeVideoId} muted={muted} />;
  } else if (type === 'twitch' && input.twitchAccount) {
    return <TwitchSource channel={input.twitchAccount} muted={muted} />;
  } else if (type === 'youtubeChannel' && input.youtubeChannelId) {
    return <YoutubeSource channelId={input.youtubeChannelId} muted={muted} />;
  }
  return null;
}

export function SourceOutput({ source, activeSignal, muted = true }: Props) {
  // A key that no longer resolves — a mirror the feed dropped — falls through
  // to the default chain rather than leaving the tile blank.
  const signal = activeSignal ? findSignal(source, activeSignal) : undefined;
  if (signal) {
    return <SignalOutput signal={signal} muted={muted} />;
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
    return <VideoPlayer src={source.m3u8Url} muted={muted} />;
  } else if (source.youtubeVideoId) {
    return <YoutubeSource videoId={source.youtubeVideoId} muted={muted} />;
  } else if (source.twitterAcount) {
    return <TwitterTimeline account={source.twitterAcount} />;
  } else if (source.twitchAccount) {
    return <TwitchSource channel={source.twitchAccount} muted={muted} />;
  } else if (source.zappingChannel) {
    return <ZappingSource channelId={source.zappingChannel} muted={muted} />;
  }

  return null;
}
