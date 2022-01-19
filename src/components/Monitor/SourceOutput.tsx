import React from "react";
import { Source } from "../../sources";
import { TwitterTimeline } from "./SourceOutput/TwitterTimeline";
import VideoPlayer from "./VideoJS";
import { VideoM3u8Source } from "./VideoM3u8Source";

export function IframeOutput({ name, src }: { src: string; name?: string }) {
  return (
    <div className="w-100 h-100">
      <div className="embed-responsive embed-responsive-16by9">
        <iframe
          src={src}
          className="embed-responsive-item embed-responsive-16by9"
          frameBorder="0"
        />
        {name && (
          <div className="CAJATituloDePantallaPequeña2">
            <div className="TextoTitulosMonitor1">{name}</div>
          </div>
        )}
      </div>
    </div>
  );
}

type Props = {
  source: Source;
};

export function SourceOutput({ source }: Props) {
  if (source.iframeSrc) {
    return <IframeOutput name={source.name} src={source.iframeSrc} />;
  } else if (source.codeHtml) {
    return (
      <div
        dangerouslySetInnerHTML={{
          __html: source.codeHtml,
        }}
      />
    );
  } else if (source.component) {
    const Component = source.component;
    return Component;
  } else if (source.m3u8Url && typeof window !== "undefined") {
    // return <VideoM3u8Source src={source.m3u8Url} />;
    return <VideoPlayer src={source.m3u8Url} />;
  } else if (source.youtubeChannelId) {
    return (
      <IframeOutput
        name={source.name}
        src={`https://www.youtube-nocookie.com/embed/live_stream?channel=${source.youtubeChannelId}&autoplay=1&mute=1&modestbranding=1&showinfo=0`}
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
  }

  return null;
}
