import { SourcesMap } from '.';

export const tvNacionalYoutubeSources: SourcesMap = {
  '24HTVN_YT': {
    slug: '24HTVN_YT',
    name: '24H',
    titleIcons: [
      <img
        style={{ maxWidth: 10 }}
        className="img-fluid"
        src="/imagenes/Logo_YT.svg"
        key="yt"
      />,
      <img
        style={{ maxHeight: 30 }}
        className="img-fluid"
        src="imagenes/Logo_24HORAS.svg"
        key="logo"
      />
    ],
    titleHtml: '',
    youtubeChannelId: 'UCTXNz3gjAypWp3EhlIATEJQ'
  },
  TVN_YT: {
    slug: 'TVN_YT',
    name: 'TVN',
    titleIcons: [
      <img
        style={{ maxHeight: 30 }}
        className="img-fluid"
        src="/imagenes/Logo_YT.svg"
        key="yt"
      />,
      <img
        style={{ maxHeight: 30 }}
        className="img-fluid"
        src="imagenes/Logo_TVN.svg"
        key="logo"
      />
    ],
    youtubeChannelId: 'UCaVaCaiG6qRzDiJDuEGKOhQ'
  },
  T13_YT: {
    slug: 'T13_YT',
    name: 'T13',
    titleIcons: [
      <img
        style={{ maxHeight: 30 }}
        className="img-fluid"
        src="/imagenes/Logo_YT.svg"
        key="yt"
      />,
      <img
        style={{ maxHeight: 30 }}
        className="img-fluid"
        src="imagenes/Logo_T13.svg"
        key="logo"
      />
    ],
    youtubeChannelId: 'UCsRnhjcUCR78Q3Ud6OXCTNg'
  },
  MEGA_YT: {
    slug: 'MEGA_YT',
    name: 'MEGA',
    youtubeVideoId: 'f7_om6wwnps',
    titleIcons: [
      <img
        style={{ maxHeight: 30 }}
        className="img-fluid"
        src="/imagenes/Logo_YT.svg"
        key="yt"
      />,
      <img
        style={{ maxHeight: 30 }}
        className="img-fluid"
        src="imagenes/Logo_MEGANOTICIAS.svg"
        key="logo"
      />
    ]
  },
  MEGANOTICIAS_yt_2: {
    slug: 'MEGANOTICIAS_yt_2',
    name: 'Meganoticias',
    titleIcons: [
      <img
        style={{ maxHeight: 30 }}
        className="img-fluid"
        src="imagenes/Logo_MEGANOTICIAS.svg"
        key="logo"
      />
    ],
    youtubeChannelId: '8SOZCjrnVxQ'
  },
  MEGANOTICIAS_YT: {
    slug: 'MEGANOTICIAS_YT',
    name: 'MEGANOTICIAS',
    titleIcons: [
      <img
        style={{ maxHeight: 30 }}
        className="img-fluid"
        src="/imagenes/Logo_YT.svg"
        key="yt"
      />,
      <img
        style={{ maxHeight: 30 }}
        className="img-fluid"
        src="imagenes/Logo_MEGANOTICIAS.svg"
        key="logo"
      />
    ],
    titleHtml: '2',
    youtubeChannelId: 'UCkccyEbqhhM3uKOI6Shm-4Q',
    fuente: 'https://www.youtube.com/channel/UCkccyEbqhhM3uKOI6Shm-4Q'
  },
  CHV_NOTICIAS_YT: {
    slug: 'CHV_NOTICIAS_YT',
    name: 'CHV_NOTICIAS',
    titleIcons: [
      <img
        style={{ maxHeight: 30 }}
        className="img-fluid"
        src="/imagenes/Logo_YT.svg"
        key="yt"
      />,
      <img
        style={{ maxHeight: 30 }}
        className="img-fluid"
        src="imagenes/Logo_CHV_NOTICIAS.svg"
        key="logo"
      />
    ],
    youtubeChannelId: 'UCRsUoZYC1ULUspipMRnMhwg'
  },
  CNN_CHILE_YT: {
    slug: 'CNN_CHILE_YT',
    titleIcons: [
      <img
        style={{ maxHeight: 30 }}
        className="img-fluid"
        src="/imagenes/Logo_YT.svg"
        key="yt"
      />,
      <img
        style={{ maxHeight: 30 }}
        className="img-fluid"
        src="imagenes/Logo_CNNCHILE2.svg"
        key="logo"
      />
    ],
    youtubeChannelId: 'UCpOAcjJNAp0Y0fhznRrXIJQ',
    name: 'YT'
  }
};

export const tvNacionalSources: SourcesMap = {
  '24HTVN': {
    slug: '24HTVN',
    name: '24 Horas',
    titleIcons: [
      <img
        style={{ maxHeight: 30 }}
        className="img-fluid"
        src="imagenes/Logo_24HORAS.svg"
        alt="24H"
        key="logo"
      />
    ],
    m3u8Url:
      'https://mdstrm.com/live-stream-playlist/57d1a22064f5d85712b20dab.m3u8',
    fuente: 'https://www.24horas.cl/envivo/'
  },
  LARED: {
    slug: 'LARED',
    titleIcons: [
      <img
        style={{ maxHeight: 30 }}
        className="img-fluid"
        src="imagenes/Logo_LA_RED.svg"
        alt="LA RED"
        key="logo"
      />
    ],
    name: 'LA RED',
    m3u8Url: 'https://unlimited1-cl-isp.dps.live/lared/lared.smil/playlist.m3u8'
  },
  'la-red-4': {
    slug: 'la-red-4',
    name: 'LA RED 2',
    titleIcons: [
      <img
        style={{ maxHeight: 30 }}
        className="img-fluid"
        src="imagenes/Logo_LA_RED.svg"
        alt="LA RED"
        key="logo"
      />
    ],
    m3u8Url:
      'https://unlimited2-cl-isp.dps.live/lared/lared.smil/playlist.m3u8',
    fuente: 'https://www.lared.cl/Source-online'
  },
  MEGA: {
    slug: 'MEGA',
    titleIcons: [
      <img
        style={{ maxHeight: 30 }}
        className="img-fluid"
        src="imagenes/Logo_MEGA.svg"
        alt="MEGA"
        key="logo"
      />
    ],
    name: 'Mega',
    m3u8Url: 'https://unlimited1-cl-isp.dps.live/mega/mega.smil/playlist.m3u8',
    // m3u8Url: "https://unlimited2-cl-isp.dps.live/mega/mega.smil/playlist.m3u8",
    fuente: 'https://www.mega.cl/'
  },
  CHV_WEB_IFRAME: {
    slug: 'CHV_WEB_IFRAME',
    name: 'CHV',
    titleIcons: [
      <img
        style={{ maxHeight: 30 }}
        className="img-fluid"
        src="imagenes/Logo_CHV.svg"
        alt="CHV"
        key="logo"
      />
    ],
    iframeSrc: '/Source/CHV_EMBED.html'
  },
  TVMAS: {
    slug: 'TVMAS',
    titleIcons: [
      <img
        style={{ maxHeight: 30 }}
        className="img-fluid"
        src="imagenes/Logo_TVMAS.svg"
        key="logo"
      />
    ],
    name: 'TV+',
    m3u8Url:
      'https://mdstrm.com/live-stream-playlist/5c0e8b19e4c87f3f2d3e6a59.m3u8'
  },
  UCVTV: {
    slug: 'UCVTV',
    name: 'UCV',
    titleIcons: [
      <img
        style={{ maxHeight: 30 }}
        className="img-fluid"
        src="imagenes/Logo_UCVTV.svg"
        key="logo"
      />
    ],
    m3u8Url:
      'https://unlimited1-cl-isp.dps.live/ucvtv2/ucvtv2.smil/playlist.m3u8'
  },
  WAPP_TV: {
    slug: 'WAPP_TV',
    name: 'WAPP',
    titleIcons: [
      <img
        style={{ maxHeight: 30 }}
        className="img-fluid"
        src="imagenes/LogoTV_WappTV.svg"
        alt="WAPP TV"
        key="logo"
      />
    ],
    m3u8Url:
      'https://mdstrm.com/live-stream-playlist-v/6046495ddf98b007fa2fe807.m3u8'
  },
  NTV: {
    slug: 'NTV',
    name: 'NTV',
    titleIcons: [
      <img
        style={{ maxHeight: 30 }}
        className="img-fluid"
        src="imagenes/Logo_NTV.svg"
        alt="NTV"
        key="logo"
      />
    ],
    m3u8Url:
      'https://mdstrm.com/live-stream-playlist/5aaabe9e2c56420918184c6d.m3u8'
  },
  'TNT-Sports': {
    slug: 'TNT-Sports',
    name: 'TNT Sports',
    m3u8Url: 'https://ver-tele.vercel.app/api/tnt.m3u8'
  }
};
