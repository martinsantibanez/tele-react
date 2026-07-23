'use client';
import qualitySelector from 'videojs-hls-quality-selector';
import { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

type Props = {
  src: string;
  muted?: boolean;
};
let hlsQualitySelectorRegistered = false;

const VideoPlayer = ({ src, muted = true }: Props) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<any>(undefined);
  const currentSrcRef = useRef<string>(src);

  useEffect(() => {
    if (!containerRef.current) return;

    if (!hlsQualitySelectorRegistered) {
      videojs.registerPlugin('hlsQualitySelector', qualitySelector);
      hlsQualitySelectorRegistered = true;
    }

    const videoElement = document.createElement('video-js');
    videoElement.classList.add(
      'video-js',
      'vjs-default-skin',
      'vjs-big-play-centered',
      'vjs-fill'
    );
    containerRef.current.appendChild(videoElement);

    const videoJsOptions: videojs.PlayerOptions = {
      preload: 'auto',
      autoplay: 'any',
      techOrder: ['html5'],
      controls: true,
      muted,
      userActions: {
        click: false,
        doubleClick: false
      },
      responsive: true,
      fill: true,
      controlBar: {
        volumePanel: {
          inline: true
        }
      },
      poster: '/imagenes/SinSenal.png',
      sources: [
        {
          src: src,
          type: 'application/vnd.apple.mpegurl'
          // type: "application/x-mpegURL",
        }
      ]
    };

    const p = videojs(videoElement, videoJsOptions, function onPlayerReaady() {
      // console.log('onPlayerReady');
    });
    playerRef.current = p;
    currentSrcRef.current = src;
    return () => {
      if (playerRef.current && !playerRef.current.isDisposed()) {
        playerRef.current.dispose();
      }
      playerRef.current = undefined;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!playerRef.current || currentSrcRef.current === src) return;
    currentSrcRef.current = src;
    playerRef.current.src([{ src, type: 'application/vnd.apple.mpegurl' }]);
  }, [src]);

  useEffect(() => {
    playerRef.current?.muted(muted);
  }, [muted]);

  useEffect(() => {
    if (muted) return;
    const unlock = () => {
      const player = playerRef.current;
      if (!player || player.isDisposed()) return;
      player.muted(false);
      const playPromise = player.play();
      if (playPromise?.catch) playPromise.catch(() => {});
    };
    const events = ['pointerdown', 'keydown'] as const;
    events.forEach(e =>
      document.addEventListener(e, unlock, { once: true, capture: true })
    );
    return () => {
      events.forEach(e =>
        document.removeEventListener(e, unlock, { capture: true } as never)
      );
    };
  }, [muted]);

  return <div ref={containerRef} data-vjs-player className="w-full h-full" />;
};

export default VideoPlayer;
