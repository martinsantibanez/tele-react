import React, { useRef } from "react";
import ReactHlsPlayer from "react-hls-player";

type Props = {
  src: string;
};
export function VideoM3u8Source({ src }: Props) {
  const playerRef = useRef<HTMLVideoElement>(null);

  return (
    <ReactHlsPlayer
      src={src}
      autoPlay
      playerRef={playerRef}
      muted
      controls
      width="100%"
    />
  );
}
