import { SourcesMap } from '.';

export const tvNacionalYoutubeSources: SourcesMap = {
  '24HTVN_YT': {
    slug: '24HTVN_YT',
    name: 'Canal 24 horas',
    titleIcons: [
      <img src="/imagenes/Logo_YT.svg" key="yt" />,
      <img src="imagenes/Logo_24HORAS.svg" key="logo" />
    ],
    titleHtml: '',
    youtubeChannelId: 'UCTXNz3gjAypWp3EhlIATEJQ'
  },
  T13_YT: {
    slug: 'T13_YT',
    titleIcons: [
      <img src="/imagenes/Logo_YT.svg" key="yt" />,
      <img src="imagenes/Logo_T13.svg" key="logo" />
    ],
    titleHtml: '',
    name: 'T13 MOVIL',
    youtubeChannelId: 'UCsRnhjcUCR78Q3Ud6OXCTNg'
  },
  // ocasionales:
  TVN_YT: {
    slug: 'TVN_YT',
    titleIcons: [
      <img src="/imagenes/Logo_YT.svg" key="yt" />,
      <img src="imagenes/Logo_TVN.svg" key="logo" />
    ],
    titleHtml: '',
    name: 'TVN',
    youtubeChannelId: 'UCaVaCaiG6qRzDiJDuEGKOhQ'
  },
  MEGANOTICIAS_YT: {
    slug: 'MEGANOTICIAS_YT',
    titleIcons: [
      <img src="/imagenes/Logo_YT.svg" key="yt" />,
      <img src="imagenes/Logo_MEGANOTICIAS.svg" key="logo" />
    ],
    titleHtml: '',
    youtubeChannelId: 'UCkccyEbqhhM3uKOI6Shm',
    fuente: 'https://www.youtube.com/channel/UCkccyEbqhhM3uKOI6Shm-4Q'
  },
  CHV_NOTICIAS_YT: {
    slug: 'CHV_NOTICIAS_YT',
    titleIcons: [
      <img src="/imagenes/Logo_YT.svg" key="yt" />,
      <img src="imagenes/Logo_CHV_NOTICIAS.svg" key="logo" />
    ],
    titleHtml: '',
    iframeSrc: 'https://www.youtube.com'
  },
  'CANAL 13_YT': {
    slug: 'CANAL 13_YT',
    name: 'Canal 13',
    titleIcons: [
      <img src="/imagenes/Logo_YT.svg" key="yt" />,
      <img src="imagenes/Logo_Canal13.svg" key="logo" />
    ],
    titleHtml: '',
    youtubeChannelId: 'UCd4D3LfXC_9MY2zSv_3gMgw'
  },
  CHV_YT: {
    slug: 'CHV_YT',
    titleIcons: [
      <img src="/imagenes/Logo_YT.svg" key="yt" />,
      <img src="imagenes/Logo_CHV.svg" key="logo" />
    ],
    youtubeChannelId: 'UC8EdTmyUaFIfZvVttJ9lgIA',
    name: 'CHV'
  },
  MEGA_YT: {
    slug: 'MEGA_YT',
    titleIcons: [
      <img src="/imagenes/Logo_YT.svg" key="yt" />,
      <img src="imagenes/Logo_MEGA.svg" key="logo" />
    ],
    youtubeChannelId: 'UCEpId-jtRABuZyX6D2z6FZQ'
  }
};

export const tvNacionalSources: SourcesMap = {
  '24HTVN': {
    slug: '24HTVN',
    name: '24 Horas',
    titleIcons: [<img src="imagenes/Logo_24PLAY.svg" key="logo" />],
    m3u8Url:
      'https://mdstrm.com/live-stream-playlist/57d1a22064f5d85712b20dab.m3u8',
    fuente: 'https://www.24horas.cl/envivo/'
  },
  LARED: {
    slug: 'LARED',
    titleIcons: [<img src="imagenes/Logo_LA_RED.svg" key="logo" />],
    name: 'LA RED',
    m3u8Url: 'https://unlimited1-cl-isp.dps.live/lared/lared.smil/playlist.m3u8'
  },
  MEGA: {
    slug: 'MEGA',
    titleIcons: [<img src="imagenes/Logo_MEGA.svg" key="logo" />],
    name: 'Mega',
    m3u8Url: 'https://unlimited1-cl-isp.dps.live/mega/mega.smil/playlist.m3u8',
    // m3u8Url: "https://unlimited2-cl-isp.dps.live/mega/mega.smil/playlist.m3u8",
    fuente: 'https://www.mega.cl/'
  },
  CHV_WEB_IFRAME: {
    slug: 'CHV_WEB_IFRAME',
    titleIcons: [<img src="imagenes/Logo_CHV.svg" key="logo" />],
    m3u8Url: 'https://marine2.miplay.cl/chilevision/index.m3u8'
  },
  CANAL13_WEB_IFRAME: {
    slug: 'CANAL13_WEB_IFRAME',
    titleIcons: [<img src="imagenes/Logo_Canal13.svg" key="logo" />],
    iframeSrc: '/Senal/CANAL13_EMBED.html',
    name: 'CANAL 13'
  },
  Señal_Interna_24HTVN_5: {
    slug: 'Señal_Interna_24HTVN_5',
    titleIcons: [<img src="imagenes/Logo_24HTVN.svg" key="logo" />],
    iframeSrc: '/Monitores/SeñalInterna24H_5.html'
  },

  TVMAS: {
    slug: 'TVMAS',
    titleIcons: [<img src="imagenes/Logo_TVMAS.svg" key="logo" />],
    iframeSrc: '/Monitores/SeñalTVMAS.html'
  },
  UCVTV: {
    slug: 'UCVTV',
    titleIcons: [<img src="imagenes/Logo_UCVTV.svg" key="logo" />],
    iframeSrc: '/Monitores/Señal_UCVTV.html'
  },
  CNN_CHILE: {
    slug: 'CNN_CHILE',
    titleIcons: [<img src="imagenes/Logo_CNNCHILE2.svg" key="logo" />],
    youtubeChannelId: 'UCpOAcjJNAp0Y0fhznRrXIJQ'
  },
  MEGANOTICIAS: {
    slug: 'MEGANOTICIAS',
    titleIcons: [<img src="imagenes/Logo_MEGANOTICIAS.svg" key="logo" />],
    youtubeChannelId: '8SOZCjrnVxQ'
  },
  T13_ENVIVO: {
    slug: 'T13_ENVIVO',
    titleIcons: [<img src="imagenes/Logo_T13_ENVIVO.svg" key="logo" />],
    iframeSrc: '/Monitores/SeñalT13_ENVIVO.html'
  },
  TVN_WEB_IFRAME: {
    slug: 'TVN_WEB_IFRAME',
    titleIcons: [<img src="imagenes/Logo_TVN.svg" key="logo" />],
    iframeSrc: '/Senal/WEB/SeñalTVN_IFRAME.html'
  },
  WAPP_TV: {
    slug: 'WAPP_TV',
    titleIcons: [<img src="imagenes/LogoTV_WappTV.svg" key="logo" />],
    m3u8Url:
      'https://mdstrm.com/live-stream-playlist-v/6046495ddf98b007fa2fe807.m3u8',
    name: 'WAPP TV'
  },
  NTV: {
    slug: 'NTV',
    titleIcons: [<img src="imagenes/Logo_NTV.svg" key="logo" />],
    m3u8Url:
      'https://mdstrm.com/live-stream-playlist/5aaabe9e2c56420918184c6d.m3u8',
    name: 'NTV'
  },
  '13E': {
    slug: '13E',
    titleIcons: [<img src="imagenes/Logo_Canal13E.svg" key="logo" />],
    m3u8Url: 'https://unlimited1-cl-isp.dps.live/13e/13e.smil/playlist.m3u8',
    name: 'CANAL 13E'
  },
  'canal-13-2': {
    slug: 'canal-13-2',
    titleHtml: 'Canal 13',
    iframeSrc: 'https://13313131.tnvas.repl.co/',
    fuente: 'https://www.13.cl/en-vivo'
  },
  'chv-2': {
    slug: 'chv-2',
    titleHtml: 'CHV',
    iframeSrc: 'https://chvvvvvvvv.temporalservel.repl.co/',
    fuente: 'https://www.chilevision.cl/senal-online'
  },
  'la-red-4': {
    slug: 'la-red-4',
    titleHtml: 'La Red',
    m3u8Url:
      'https://unlimited2-cl-isp.dps.live/lared/lared.smil/playlist.m3u8',
    fuente: 'https://www.lared.cl/senal-online'
  }
};
