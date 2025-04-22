'use client';
import { SourceType } from '../../../sources';
import { TwitchSource } from './SourceProvider/TwitchSource';
import { TwitterTimeline } from './SourceProvider/TwitterTimeline';
import VideoPlayer from './SourceProvider/VideoJS';
import { ZappingSource } from './SourceProvider/ZappingSource';

export function IframeOutput({ name, src }: { src: string; name?: string }) {
  return (
    <div className="w-full h-full">
      <div className="aspect-video">
        <iframe src={src} className="aspect-video w-full h-full" frameBorder="0" />
      </div>
    </div>
  );
}

type Props = {
  muted?: boolean;
  source: SourceType;
};

export function SourceOutput({ source, muted = true }: Props) {
  if (source.iframeSrc) {
    return <IframeOutput name={source.name} src={source.iframeSrc} />;
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
  } else if (source.youtubeChannelId) {
    const muteValue = muted ? '1' : '0';
    return (
      <IframeOutput
        name={source.name}
        src={`https://www.youtube-nocookie.com/embed/live_stream?channel=${source.youtubeChannelId}&autoplay=1&mute=${muteValue}&modestbranding=1&showinfo=0`}
      />
    );
  } else if (source.youtubeVideoId) {
    return (
      <IframeOutput
        name={source.name}
        src={`https://www.youtube-nocookie.com/embed/${source.youtubeVideoId}?autoplay=1&mute=1&modestbranding=1&showinfo=0`}
      />
    );
  } else if (source.twitterAcount) {
    return <TwitterTimeline account={source.twitterAcount} />;
  } else if (source.twitchAccount) {
    return <TwitchSource channel={source.twitchAccount} muted={muted} />;
  } else if (source.zappingChannel) {
    return <ZappingSource channelId={source.zappingChannel} />;
  }

  return null;
}
