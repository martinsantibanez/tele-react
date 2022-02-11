import React, { useRef, useState, useEffect } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import qualitySelector from "videojs-hls-quality-selector";
import qualityLevels from "videojs-contrib-quality-levels";

type Props = {
  src: string;
};
const VideoPlayer = ({ src }: Props) => {
  const videoRef = useRef<any>();
  const [player, setPlayer] = useState<any>(undefined);

  useEffect(() => {
    if (player) {
      player.src([src]);
    }
  }, [src, player]);

  useEffect(() => {
    if (player) return;
    const videoJsOptions: videojs.PlayerOptions = {
      preload: "auto",
      autoplay: "any",
      controls: true,
      muted: true,
      fluid: true,
      responsive: true,
      aspectRatio: "16:9", 
      poster: '/imagenes/SinSenal.png',
      sources: [
        {
          src: src,
          type: "application/vnd.apple.mpegurl",
          // type: "application/x-mpegURL",
        },
      ],
    };

    videojs.registerPlugin("hlsQualitySelector", qualitySelector);
    if (!videoRef.current) return;
    const p = videojs(
      videoRef.current,
      videoJsOptions,
      function onPlayerReaady() {
        // console.log('onPlayerReady');
      }
    );
    setPlayer(p);
    return () => {
      if (player) player.dispose();
    };
  }, [player, src]);

  return (
    <div data-vjs-player>
      <video
        ref={videoRef}
        className="video-js vjs-default-skin vjs-big-play-centered"
      ></video>
    </div>
  );
};

export default VideoPlayer;
