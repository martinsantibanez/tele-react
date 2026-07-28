import { FaFlask } from 'react-icons/fa';
import { SourcesMap } from '.';

const FlaskIcon = <FaFlask key="flask" />;

/**
 * Some videos refuse to play in an embed unless the page asking for them is on
 * the uploader's whitelist of domains, and CodePen is a common entry on it.
 * This pen re-embeds the player from `cdpn.io`, so the request reaches YouTube
 * with CodePen's origin instead of ours and the video plays where our own embed
 * gets the "video unavailable" screen. It is still YouTube's player — only the
 * page hosting it changes — so it breaks the moment the pen goes away or the
 * uploader drops CodePen from the whitelist.
 */
export const codepenYoutubeSrc = (videoId: string) =>
  `https://cdpn.io/pen/debug/oNPzxKo?v=${videoId}`;

/** The video the workaround is being tried against. */
const BLOCKED_VIDEO_ID = 'sYT4pPHKRak';

export const pruebasSources: SourcesMap = {
  CODEPEN_YOUTUBE: {
    slug: 'CODEPEN_YOUTUBE',
    name: 'YouTube vía CodePen',
    titleIcons: [FlaskIcon],
    titleHtml: 'YouTube vía CodePen [prueba]',
    iframeSrc: codepenYoutubeSrc(BLOCKED_VIDEO_ID),
    // The blocked embed is what the pen works around; keeping it as the second
    // signal makes the two comparable with TAB, on the same screen.
    youtubeVideoId: BLOCKED_VIDEO_ID
  },
  CHV_HLS: {
    slug: 'CHV_HLS',
    name: 'CHV HLS',
    titleIcons: [
      FlaskIcon,
      <img
        style={{ maxHeight: 30 }}
        className="img-fluid"
        src="imagenes/Logo_CHV.svg"
        alt="CHV"
        key="logo"
      />
    ],
    titleHtml: 'CHV HLS [prueba]',
    // The feed behind the rudo.video player the channel's own page embeds. The
    // path token is the channel's, not a session's: the CDN answers this with a
    // 302 that mints the dpssid/sid pair the chunk urls carry, so the url keeps
    // working without one. What is untested is how long that token lives.
    m3u8Url:
      'https://jireh-19-hls-video-cl-isp.dps.live/hls-video/339f69c6122f6d8f4574732c235f09b7683e31a5/chvn/chvn.smil/playlist.m3u8',
    fuente: 'https://www.chilevision.cl/noticias/senal-online/'
  }
};
