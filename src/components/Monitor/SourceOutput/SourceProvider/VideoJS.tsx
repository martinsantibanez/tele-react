import qualitySelector from 'videojs-hls-quality-selector';
import Script from 'next/script';
import { useEffect, useRef, useState } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import initChromecast from './chromecast/js/index';

// require('@silvermine/videojs-chromecast')(videojs);
initChromecast(videojs, {});
// require('./VideoJS/silvermine-videojs-chromecast')(videojs);
//
type Props = {
  src: string;
  muted?: boolean;
};
const VideoPlayer = ({ src, muted = true }: Props) => {
  const videoRef = useRef<any>();
  const [player, setPlayer] = useState<any>(undefined);

  useEffect(() => {
    if (player) {
      player.src([src]);
    }
  }, [src, player]);

  useEffect(() => {
    if (player) return;
    const videoJsOptions: videojs.PlayerOptions & { chromecast: any } = {
      preload: 'auto',
      autoplay: 'any',
      techOrder: ['chromecast', 'html5', 'hls', 'flash'],
      chromecast: {
        modifyLoadRequestFn: function (loadRequest: any) {
          // HLS support
          console.log({ loadRequest });
          loadRequest.media.hlsSegmentFormat = 'FMP4';
          loadRequest.media.hlsVideoSegmentFormat = 'FMP4';
          return loadRequest;
        }
      },
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
      ],
      plugins: { chromecast: {} }
    };

    videojs.registerPlugin('hlsQualitySelector', qualitySelector);
    // videojs.registerPlugin('chromecast', chromecast);
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
      <Script
        type="text/javascript"
        src="https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1"
      />
      <video
        ref={videoRef}
        className="video-js vjs-default-skin vjs-big-play-centered"
      ></video>
    </div>
  );
};

export default VideoPlayer;
