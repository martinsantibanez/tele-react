import { SourcesMap } from '.';

export const tvNacionalYoutubeSources: SourcesMap = {
  '24HTVN_YT': {
    slug: '24HTVN_YT',
    // name: 'Canal 24 horas',
    titleIcons: [
      <img src="/imagenes/Logo_YT.svg" key="yt" />,
      <img src="imagenes/Logo_24HORAS.svg" key="logo" />
    ],
    titleHtml: '',
    youtubeChannelId: 'UCTXNz3gjAypWp3EhlIATEJQ'
  },
  '24HTVN_FACEBOOK': {
    slug: '24HTVN_FACEBOOK',
    titleIcons: [<img src="imagenes/Logo_24HORAS.svg" alt="24H" key="logo" />],
    iframeSrc:
      'https://www.facebook.com/plugins/video.php?href=https%3A%2F%2Fwww.facebook.com%2F24horas.cl%2Flive%2F&show_text=0&mute=0'
  },
  T13_YT: {
    slug: 'T13_YT',
    titleIcons: [
      <img src="/imagenes/Logo_YT.svg" key="yt" />,
      <img src="imagenes/Logo_T13.svg" key="logo" />
    ],
    youtubeChannelId: 'UCsRnhjcUCR78Q3Ud6OXCTNg'
  },
  // ocasionales:
  TVN_YT: {
    slug: 'TVN_YT',
    titleIcons: [
      <img src="/imagenes/Logo_YT.svg" key="yt" />,
      <img src="imagenes/Logo_TVN.svg" key="logo" />
    ],
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
  CHV_M3: {
    slug: 'CHV_M3',
    titleIcons: [<img src="imagenes/Logo_CHV.svg" alt="CHV" key="logo" />],
    m3u8Url: 'https://marine2.miplay.cl/chilevision/index.m3u8'
  },
  CHV_WEB_IFRAME: {
    slug: 'CHV_WEB_IFRAME',
    titleIcons: [<img src="imagenes/Logo_CHV.svg" alt="CHV" key="logo" />],
    m3u8Url: 'https://marine2.miplay.cl/chilevision/index.m3u8',
    iframeSrc: '/Source/CHV_EMBED.html'
  },
  // CNN_CHILE: {
  //   slug: 'CNN_CHILE',
  //   titleIcons: [<img src="imagenes/Logo_CNNCHILE2.svg" key="logo" />],
  //   m3u8Url: 'https://unlimited1-us.dps.live/cnn/cnn.smil/playlist.m3u8'
  // },
  CNN_CHILE_YT: {
    slug: 'CNN_CHILE_YT',
    titleIcons: [<img src="imagenes/Logo_CNNCHILE2.svg" key="logo" />],
    youtubeChannelId: 'UCpOAcjJNAp0Y0fhznRrXIJQ',
    name: 'YT'
  },
  CNN_CHILE_FACEBOOK: {
    slug: 'CNN_CHILE_FACEBOOK',
    titleIcons: [<img src="imagenes/Logo_CNNCHILE2.svg" key="logo" />],
    titleHtml:
      '<img style="height: 20px; width:auto:" src="imagenes/Icono_Facebook.svg"></img>ﾠ<img style="height: 20px; width:auto:" src="imagenes/Icono_TV_News.svg"></img>ﾠ<img style="height: 20px; width:auto:" src="imagenes/Logo_CNNCHILE2.svg"></img>',
    iframeSrc:
      'https://www.facebook.com/plugins/video.php?href=https%3A%2F%2Fwww.facebook.com%2Fcnnchile%2Flive%2F&show_text=0&mute=0',
    name: 'FB'
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
  // CANAL13_WEB_IFRAME: {
  //   slug: 'CANAL13_WEB_IFRAME',
  //   titleIcons: [
  //     <img src="imagenes/Logo_Canal13.svg" alt="CANAL 13" key="logo" />
  //   ],
  //   iframeSrc: '/Source/CANAL13_EMBED.html'
  //   // name: 'CANAL 13'
  // },
  TVN_M3: {
    slug: 'TVN_M3',
    titleIcons: [<img src="imagenes/Logo_TVN.svg" key="logo" />],
    m3u8Url:
      'https://mdstrm.com/live-stream-playlist/5346f657c1e6f5810b5b9df3.m3u8?PlaylistM3UCL'
  },
  TVN_WEB_IFRAME: {
    slug: 'TVN_WEB_IFRAME',
    titleIcons: [<img src="imagenes/Logo_TVN.svg" key="logo" />],
    iframeSrc: '/Source/TVN_EMBED.html'
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
  MEGANOTICIAS_FACEBOOK: {
    slug: 'MEGANOTICIAS_FACEBOOK',
    titleHtml:
      '<img style="height: 20px; width:auto:" src="imagenes/Icono_Facebook.svg"></img>ﾠ<img style="height: 20px; width:auto:" src="imagenes/Icono_TV_News.svg"></img>ﾠ<img style="height: 20px; width:auto:" src="imagenes/Logo_MEGANOTICIAS.svg"></img>',
    iframeSrc:
      'https://www.facebook.com/plugins/video.php?href=https%3A%2F%2Fwww.facebook.com%2Fmeganoticiascl%2Flive%2F&show_text=0&mute=0"'
  },
  T13_FACEBOOK: {
    slug: 'T13_FACEBOOK',
    titleHtml:
      '<img style="height: 20px; width:auto:" src="imagenes/Icono_Facebook.svg"></img>ﾠ<img style="height: 20px; width:auto:" src="imagenes/Icono_TV_News.svg"></img>ﾠ<img style="height: 20px; width:auto:" src="imagenes/Logo_T13.svg"></img>',
    iframeSrc:
      'https://www.facebook.com/plugins/video.php?href=https%3A%2F%2Fwww.facebook.com%2Fteletrece%2Flive%2F&show_text=0&mute=0',
    name: 'T13 MOVIL'
  },
  TVN_FACEBOOK: {
    slug: 'TVN_FACEBOOK',
    titleHtml:
      '<img style="height: 20px; width:auto:" src="imagenes/Icono_Facebook.svg"></img>ﾠ<img style="height: 20px; width:auto:" src="imagenes/Icono_TV_News.svg"></img>ﾠ<img style="height: 20px; width:auto:" src="imagenes/Logo_TVN.svg"></img>',
    iframeSrc:
      'https://www.facebook.com/plugins/video.php?href=https%3A%2F%2Fwww.facebook.com%2Ftvn.cl%2Flive%2F&show_text=0&mute=0',
    name: 'TVN'
  },
  MEGA_FACEBOOK: {
    slug: 'MEGA_FACEBOOK',
    titleHtml:
      '<img style="height: 20px; width:auto:" src="imagenes/Icono_Facebook.svg"></img>ﾠ<img style="height: 20px; width:auto:" src="imagenes/Icono_TV_News.svg"></img>ﾠ<img style="height: 20px; width:auto:" src="imagenes/Logo_MEGA.svg"></img>',
    iframeSrc:
      'https://www.facebook.com/plugins/video.php?href=https%3A%2F%2Fwww.facebook.com%2FMEGACL%2Flive%2F&show_text=0&mute=0',
    name: 'MEGA'
  },
  CHV_FACEBOOK: {
    slug: 'CHV_FACEBOOK',
    titleHtml:
      '<img style="height: 20px; width:auto:" src="imagenes/Icono_Facebook.svg"></img>ﾠ<img style="height: 20px; width:auto:" src="imagenes/Icono_TV_News.svg"></img>ﾠ<img style="height: 20px; width:auto:" src="imagenes/Logo_CHV.svg"></img>',
    iframeSrc:
      'https://www.facebook.com/plugins/video.php?href=https%3A%2F%2Fwww.facebook.com%2Fchilevision%2Flive%2F&show_text=0&mute=0',
    name: 'CHV'
  },
  'CANAL 13_FACEBOOK': {
    slug: 'CANAL 13_FACEBOOK',
    titleHtml:
      '<img style="height: 20px; width:auto:" src="imagenes/Icono_Facebook.svg"></img>ﾠ<img style="height: 20px; width:auto:" src="imagenes/Icono_TV_News.svg"></img>ﾠ<img style="height: 20px; width:auto:" src="imagenes/Logo_Canal13.svg"></img>',
    iframeSrc:
      'https://www.facebook.com/plugins/video.php?href=https%3A%2F%2Fwww.facebook.com%2Felcanal13%2Flive%2F&show_text=0&mute=0',
    name: 'CANAL 13'
  },
  Señal_Interna_24HTVN_5: {
    slug: 'Señal_Interna_24HTVN_5',
    titleIcons: [<img src="imagenes/Logo_24HTVN.svg" key="logo" />],
    m3u8Url:
      'https://mdstrm.com/live-stream-playlist-v/5653641561b4eba30a7e4929.m3u8'
  }
};
