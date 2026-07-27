'use client';
import { SourceType } from '../../../sources';
import { TwitchSource } from './SourceProvider/TwitchSource';
import { TwitterTimeline } from './SourceProvider/TwitterTimeline';
import VideoPlayer from './SourceProvider/VideoJS';
import { YoutubeSource } from './SourceProvider/YoutubeSource';
import { ZappingSource } from './SourceProvider/ZappingSource';

export function IframeOutput({ src }: { src: string }) {
  return <iframe src={src} className="w-full h-full" frameBorder="0" />;
}

type Props = {
  muted?: boolean;
  source: SourceType;
};

export function SourceOutput({ source, muted = true }: Props) {
  if (source.activeSignalType === 'iframe' && source.iframeSrc) {
    return <IframeOutput src={source.iframeSrc} />;
  } else if (
    source.activeSignalType === 'm3u8' &&
    source.m3u8Url &&
    typeof window !== 'undefined'
  ) {
    return <VideoPlayer src={source.m3u8Url} muted={muted} />;
  } else if (source.activeSignalType === 'youtube' && source.youtubeVideoId) {
    return <YoutubeSource videoId={source.youtubeVideoId} muted={muted} />;
  } else if (source.activeSignalType === 'twitch' && source.twitchAccount) {
    return <TwitchSource channel={source.twitchAccount} muted={muted} />;
  }  else if (source.activeSignalType === 'youtubeChannel' && source.youtubeChannelId) {
    return <YoutubeSource channelId={source.youtubeChannelId} muted={muted} />;
  } else if (source.iframeSrc) {
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
