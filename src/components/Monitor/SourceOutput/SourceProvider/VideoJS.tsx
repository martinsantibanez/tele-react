'use client';
import qualitySelector from 'videojs-hls-quality-selector';
import Script from 'next/script';
import { useEffect, useRef, useState } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

type Props = {
  src: string;
  muted?: boolean;
};
const VideoPlayer = ({ src, muted = true }: Props) => {
  const videoRef = useRef<any>(undefined);
  const [player, setPlayer] = useState<any>(undefined);

  if (typeof window === 'undefined') return null;
  useEffect(() => {
    if (player) {
      player.src([src]);
    }
  }, [src, player]);

  useEffect(() => {
    if (player) return;
    const videoJsOptions: videojs.PlayerOptions = {
      preload: 'auto',
      autoplay: 'any',
      techOrder: ['html5', 'hls', 'flash'],
      controls: true,
      muted,
      fluid: true,
      responsive: true,
      controlBar: {
        volumePanel: {
          inline: true
        }
      },
      aspectRatio: '16:9',
      poster: '/imagenes/SinSenal.png',
      sources: [
        {
          src: src,
          type: 'application/vnd.apple.mpegurl'
          // type: "application/x-mpegURL",
        }
      ]
    };

    videojs.registerPlugin('hlsQualitySelector', qualitySelector);
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
  }, [muted, player, src]);

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
