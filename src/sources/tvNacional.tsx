import { SourcesMap } from '.';

export const tvNacionalYoutubeSources: SourcesMap = {
  '24HTVN_YT': {
    slug: '24HTVN_YT',
    titleIcons: [
      <img src="/imagenes/Logo_YT.svg" key="yt" />,
      <img src="imagenes/Logo_24HORAS.svg" key="logo" />
    ],
    titleHtml: '',
    youtubeChannelId: 'UCTXNz3gjAypWp3EhlIATEJQ'
  },
  TVN_YT: {
    slug: 'TVN_YT',
    titleIcons: [
      <img src="/imagenes/Logo_YT.svg" key="yt" />,
      <img src="imagenes/Logo_TVN.svg" key="logo" />
    ],
    youtubeChannelId: 'UCaVaCaiG6qRzDiJDuEGKOhQ'
  },
  T13_YT: {
    slug: 'T13_YT',
    titleIcons: [
      <img src="/imagenes/Logo_YT.svg" key="yt" />,
      <img src="imagenes/Logo_T13.svg" key="logo" />
    ],
    youtubeChannelId: 'UCsRnhjcUCR78Q3Ud6OXCTNg'
  },
  MEGA_YT: {
    slug: 'MEGA_YT',
    youtubeVideoId: 'f7_om6wwnps',
    titleIcons: [
      <img src="/imagenes/Logo_YT.svg" key="yt" />,
      <img src="imagenes/Logo_MEGANOTICIAS.svg" key="logo" />
    ]
  },
  MEGANOTICIAS_YT: {
    slug: 'MEGANOTICIAS_YT',
    titleIcons: [
      <img src="/imagenes/Logo_YT.svg" key="yt" />,
      <img src="imagenes/Logo_MEGANOTICIAS.svg" key="logo" />
    ],
    titleHtml: '2',
    youtubeChannelId: 'UCkccyEbqhhM3uKOI6Shm-4Q',
    fuente: 'https://www.youtube.com/channel/UCkccyEbqhhM3uKOI6Shm-4Q'
  },
  CHV_NOTICIAS_YT: {
    slug: 'CHV_NOTICIAS_YT',
    titleIcons: [
      <img src="/imagenes/Logo_YT.svg" key="yt" />,
      <img src="imagenes/Logo_CHV_NOTICIAS.svg" key="logo" />
    ],
    youtubeChannelId: 'UCRsUoZYC1ULUspipMRnMhwg'
  },
  CNN_CHILE_YT: {
    slug: 'CNN_CHILE_YT',
    titleIcons: [
      <img src="/imagenes/Logo_YT.svg" key="yt" />,
      <img src="imagenes/Logo_CNNCHILE2.svg" key="logo" />
    ],
    youtubeChannelId: 'UCpOAcjJNAp0Y0fhznRrXIJQ',
    name: 'YT'
  }
};

export const tvNacionalSources: SourcesMap = {
  '24HTVN': {
    slug: '24HTVN',
    // name: '24 Horas',
    titleIcons: [<img src="imagenes/Logo_24HORAS.svg" alt="24H" key="logo" />],
    m3u8Url:
      'https://mdstrm.com/live-stream-playlist/57d1a22064f5d85712b20dab.m3u8',
    fuente: 'https://www.24horas.cl/envivo/'
  },
  '24HTVN_DOS': {
    slug: '24HTVN_DOS',
    // name: '24 Horas',
    titleIcons: [<img src="imagenes/Logo_24HORAS.svg" alt="24H" key="logo" />],
    iframeSrc:
      'https://mdstrm.com/live-stream/57d1a22064f5d85712b20dab?jsapi=true&autoplay=true&controls=true&volume=0&mute=true&player=57f4e28f9c53768535d65782&access_token=&custom.preroll=&custom.overlay=',
    fuente: 'https://www.24horas.cl/envivo/'
  },
  LARED: {
    slug: 'LARED',
    titleIcons: [
      <img src="imagenes/Logo_LA_RED.svg" alt="LA RED" key="logo" />
    ],
    // name: 'LA RED',
    m3u8Url: 'https://unlimited1-cl-isp.dps.live/lared/lared.smil/playlist.m3u8'
  },
  'la-red-4': {
    slug: 'la-red-4',
    titleIcons: [
      <img src="imagenes/Logo_LA_RED.svg" alt="LA RED" key="logo" />
    ],
    m3u8Url:
      'https://unlimited2-cl-isp.dps.live/lared/lared.smil/playlist.m3u8',
    fuente: 'https://www.lared.cl/Source-online'
  },
  MEGA: {
    slug: 'MEGA',
    titleIcons: [<img src="imagenes/Logo_MEGA.svg" alt="MEGA" key="logo" />],
    // name: 'Mega',
    m3u8Url: 'https://unlimited1-cl-isp.dps.live/mega/mega.smil/playlist.m3u8',
    // m3u8Url: "https://unlimited2-cl-isp.dps.live/mega/mega.smil/playlist.m3u8",
    fuente: 'https://www.mega.cl/'
  },
  MEGANOTICIAS: {
    slug: 'MEGANOTICIAS',
    titleIcons: [<img src="imagenes/Logo_MEGANOTICIAS.svg" key="logo" />],
    youtubeChannelId: '8SOZCjrnVxQ'
  },
  CHV_NOTICIAS: {
    slug: 'CHV_NOTICIAS',
    titleIcons: [<img src="imagenes/Logo_CHV_NOTICIAS.svg" key="logo" />],
    m3u8Url:
      'https://siloh-latam-aka.plutotv.net/lilo/production/Chilevision/master.m3u8'
  },
  CHV_WEB_IFRAME: {
    slug: 'CHV_WEB_IFRAME',
    titleIcons: [<img src="imagenes/Logo_CHV.svg" alt="CHV" key="logo" />],
    m3u8Url: 'https://marine2.miplay.cl/chilevision/index.m3u8',
    iframeSrc: '/Source/CHV_EMBED.html'
  },
  T13_ENVIVO: {
    slug: 'T13_ENVIVO',
    titleIcons: [<img src="imagenes/Logo_T13_ENVIVO.svg" key="logo" />],
    iframeSrc: '/Source/T13_EMBED.html'
  },
  'canal-13-2': {
    slug: 'canal-13-2',
    titleIcons: [
      <img src="imagenes/Logo_Canal13.svg" alt="CANAL 13" key="logo" />
    ],
    iframeSrc: 'https://13313131.tnvas.repl.co/',
    fuente: 'https://www.13.cl/en-vivo'
  },
  TVN_WEB_IFRAME: {
    slug: 'TVN_WEB_IFRAME',
    titleIcons: [<img src="imagenes/Logo_TVN.svg" key="logo" />],
    iframeSrc: '/Source/TVN_EMBED.html'
  },
  TVN_M3: {
    slug: 'TVN_M3',
    titleIcons: [<img src="imagenes/Logo_TVN.svg" key="logo" />],
    name: '2',
    m3u8Url:
      'https://mdstrm.com/live-stream-playlist/5346f657c1e6f5810b5b9df3.m3u8?PlaylistM3UCL'
  },
  TVMAS: {
    slug: 'TVMAS',
    titleIcons: [<img src="imagenes/Logo_TVMAS.svg" key="logo" />],
    m3u8Url:
      'https://mdstrm.com/live-stream-playlist/5c0e8b19e4c87f3f2d3e6a59.m3u8'
  },
  UCVTV: {
    slug: 'UCVTV',
    titleIcons: [<img src="imagenes/Logo_UCVTV.svg" key="logo" />],
    m3u8Url:
      'https://unlimited1-cl-isp.dps.live/ucvtv2/ucvtv2.smil/playlist.m3u8'
  },
  WAPP_TV: {
    slug: 'WAPP_TV',
    titleIcons: [
      <img src="imagenes/LogoTV_WappTV.svg" alt="WAPP TV" key="logo" />
    ],
    m3u8Url:
      'https://mdstrm.com/live-stream-playlist-v/6046495ddf98b007fa2fe807.m3u8'
  },
  NTV: {
    slug: 'NTV',
    titleIcons: [<img src="imagenes/Logo_NTV.svg" alt="NTV" key="logo" />],
    m3u8Url:
      'https://mdstrm.com/live-stream-playlist/5aaabe9e2c56420918184c6d.m3u8'
    // name: 'NTV'
  },
  '13E': {
    slug: '13E',
    titleIcons: [<img src="imagenes/Logo_Canal13E.svg" alt="13E" key="logo" />],
    m3u8Url: 'https://unlimited1-cl-isp.dps.live/13e/13e.smil/playlist.m3u8'
  },
  Señal_Interna_24HTVN_5: {
    slug: 'Señal_Interna_24HTVN_5',
    titleIcons: [<img src="imagenes/Logo_24HTVN.svg" key="logo" />],
    name: 'ALT',
    m3u8Url:
      'https://mdstrm.com/live-stream-playlist-v/5653641561b4eba30a7e4929.m3u8'
  }
};
