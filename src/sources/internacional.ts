import { SourcesMap } from '.';

const argentinaSources: SourcesMap = {
  'TyC-sports': {
    slug: 'TyC-sports',
    name: 'TyC Sports',
    m3u8Url:
      'https://d3awnlgqz0szay.cloudfront.net/out/v1/b841c366cbe540e6a106c3ba83e5c8d6/index_9.m3u8',
    titleHtml: 'TyC Sports (Mundial)'
  },
  tn: {
    slug: 'tn',
    name: 'Todonoticias',
    youtubeChannelId: 'UCj6PcyLvpnIRT_2W_mwa9Aw',
    flag: 'ar'
  },
  c5n: {
    slug: 'c5n',
    name: 'C5N',
    youtubeChannelId: 'UCFgk2Q2mVO1BklRQhSv6p0w',
    flag: 'ar'
  },
  'america-tv': {
    slug: 'america-tv',
    name: 'América TV',
    youtubeChannelId: 'UC6NVDkuzY2exMOVFw4i9oHw',
    flag: 'ar'
  },
  'net-tv': {
    slug: 'net-tv',
    name: 'Net TV',
    iframeSrc: 'https://rudo.video/live/nettv?volume=0&mute=1',
    fuente: 'https://www.canalnet.tv/page/senal-en-vivo',
    flag: 'ar'
  },
  'tv-publica-arg': {
    slug: 'tv-publica-arg',
    name: 'Televisión Pública',
    youtubeChannelId: 'UCs231K71Bnu5295_x0MB5Pg',
    flag: 'ar'
  },
  'cronica-tv': {
    slug: 'cronica-tv',
    name: 'Crónica TV',
    youtubeChannelId: 'UCT7KFGv6s2a-rh2Jq8ZdM1g',
    flag: 'ar'
  },
  'el-siete-tv': {
    slug: 'el-siete-tv',
    name: 'El Siete TV',
    youtubeChannelId: 'UC64ZNqX0FQHabP8iIkmnR3A',
    flag: 'ar'
  },
  a24: {
    slug: 'a24',
    name: 'A24',
    youtubeChannelId: 'UCR9120YBAqMfntqgRTKmkjQ',
    flag: 'ar'
  },
  'la-nacion': {
    slug: 'la-nacion',
    name: 'LA NACION',
    youtubeChannelId: 'UCba3hpU7EFBSk817y9qZkiA',
    flag: 'ar'
  },
  'ip-digital': {
    slug: 'ip-digital',
    name: 'Información Periodistica',
    m3u8Url:
      'https://d1nmqgphjn0y4.cloudfront.net/live/ip/live.isml/5ee6e167-1167-4a85-9d8d-e08a3f55cff3.m3u8',
    fuente: 'https://ip.digital/vivo',
    flag: 'ar'
  },
  'ip-digital-2': {
    slug: 'ip-digital-2',
    name: 'IP Noticias',
    youtubeChannelId: 'UC1bBjOZieJWHbsFA0LwjjJA',
    flag: 'ar'
  }
};

const colombiaSources: SourcesMap = {
  'el-tiempo': {
    slug: 'el-tiempo',
    name: 'EL TIEMPO',
    youtubeChannelId: 'UCe5-b0fCK3eQCpwS6MT0aNw',
    flag: 'co'
  },
  'noti-caracol': {
    slug: 'noti-caracol',
    name: 'Noticias Caracol',
    youtubeChannelId: 'UC2Xq2PK-got3Rtz9ZJ32hLQ',
    flag: 'co'
  },
  'red-mas-noticias': {
    slug: 'red-mas-noticias',
    name: 'RED MÁS Noticias',
    youtubeChannelId: 'UCpcvsK0UAI3MIHsjjj3CgMg',
    flag: 'co'
  }
};

const peruSources: SourcesMap = {
  'tv-peru': {
    slug: 'tv-peru',
    name: 'TVPerú Noticias',
    youtubeChannelId: 'UCkZCoc42IipR1ucqJmIehsA',
    flag: 'pe'
  },
  'nacional-tv': {
    slug: 'nacional-tv',
    name: 'Nacional TV',
    m3u8Url:
      'https://stmv.panel.grupolimalive.com/nacionaltv/nacionaltv/playlist.m3u8',
    fuente: 'https://ntvperu.pe/senal-en-vivo/',
    flag: 'pe'
  },
  'panamericana-tv': {
    slug: 'panamericana-tv',
    name: 'Panamericana TV',
    iframeSrc:
      'https://geo.dailymotion.com/player/x5poh.html?video=x774s7s&autoplay=true&volume=0',
    fuente: 'https://panamericana.pe/tvenvivo',
    flag: 'pe'
  },
  'onda-digital-tv': {
    slug: 'onda-digital-tv',
    name: 'Onda Digital TV',
    m3u8Url: 'https://ed1ov.live.opencaster.com/CwCfFGFdtebB/index.m3u8',
    fuente: 'https://ondadigitaltv.com',
    flag: 'pe'
  },
  uci: {
    slug: 'uci',
    name: 'UCI',
    m3u8Url: 'https://mediastreamm.com:3449/live/mlecaroslive.m3u8',
    fuente: 'https://uci.pe/envivo',
    flag: 'pe'
  },
  'uci-2': {
    slug: 'uci-2',
    name: 'UCI 2',
    youtubeChannelId: 'UCdl1ygFwPa6lUdNYPLjoAGg',
    flag: 'pe'
  },
  'cable-vision-peru': {
    slug: 'cable-vision-peru',
    name: 'Cable Visión Perú',
    m3u8Url:
      'https://5ee0faac3bbae.streamlock.net/visionnoticias/visionnoticias/playlist.m3u8',
    fuente: 'https://www.cablevisionperu.pe/?page_id=1938',
    flag: 'pe'
  },
  atv: {
    slug: 'atv',
    name: 'ATV',
    m3u8Url:
      'https://d2tr4gdfol9ja.cloudfront.net/atv/smil:atv.smil/playlist.m3u8',
    fuente: 'https://www.atv.pe/envivo-atv',
    flag: 'pe'
  },
  'atv-mas': {
    slug: 'atv-mas',
    name: 'ATV Más',
    m3u8Url:
      'https://d2tr4gdfol9ja.cloudfront.net/atv/smil:atv-mas.smil/playlist.m3u8',
    fuente: 'https://www.atv.pe/envivo-atvmas',
    flag: 'pe'
  },
  'la-republica': {
    slug: 'la-republica',
    name: 'La República',
    youtubeChannelId: 'UC-B7Xv56uNRDkj0vC3QW8Cg',
    flag: 'pe'
  },
  willax: {
    slug: 'willax',
    name: 'Willax',
    iframeSrc:
      'https://geo.dailymotion.com/player/x5poh.html?video=x7x4dgx&autoplay=true&volume=0',
    fuente: 'https://willax.tv/en-vivo/',
    flag: 'pe'
  },
  'latina-noticias': {
    slug: 'latina-noticias',
    name: 'Latina Noticias',
    youtubeChannelId: 'UCpSJ5fGhmAME9Kx2D3ZvN3Q',
    flag: 'pe'
  },
  'ovacion-tv': {
    slug: 'ovacion-tv',
    name: '📻 Ovación TV',
    m3u8Url:
      'https://5c3fb01839654.streamlock.net:1963/iptvovacion1/liveovacion1tv/playlist.m3u8',
    fuente: 'https://ovacion.pe/radio',
    flag: 'pe'
  },
  'pbo-radio': {
    slug: 'pbo-radio',
    name: '📻 PBO',
    youtubeChannelId: 'UCgR0st4ZLABi-LQcWNu3wnQ',
    flag: 'pe'
  },
  'santa-rosa': {
    slug: 'santa-rosa',
    name: '📻 Radio Santa Rosa',
    youtubeChannelId: 'UCIGV0oiNkdK2-tnf10DNp2A',
    flag: 'pe'
  },
  'san-borja': {
    slug: 'san-borja',
    name: '📻 Radio San Borja Tv',
    m3u8Url:
      'https://5c3fb01839654.streamlock.net:1963/iptvsanborja/livesanborjatv/playlist.m3u8',
    fuente: 'https://radiosanborjatv.com/',
    flag: 'pe'
  },
  'radio-onda-digital': {
    slug: 'radio-onda-digital',
    name: '📻 Radio Onda Digital',
    m3u8Url: 'https://tv.ondadigital.pe:1936/ondatv2/ondatv2/playlist.m3u8',
    fuente: 'https://www.ondadigital.pe/',
    flag: 'pe'
  },
  'radio-tropical': {
    slug: 'radio-tropical',
    name: '📻 Radio Tropical',
    m3u8Url:
      'https://5ee0faac3bbae.streamlock.net/raditropical/raditropical/playlist.m3u8',
    fuente: 'https://radiotropical.pe/',
    flag: 'pe'
  },
  'radio-uno': {
    slug: 'radio-uno',
    name: '📻 Radio Uno',
    youtubeChannelId: 'UCK0lpuL9PQb3I5CDcu7Y7bA',
    flag: 'pe'
  }
};

const venezuelaSources: SourcesMap = {
  globovision: {
    slug: 'globovision',
    name: 'Globovisión En Vivo',
    youtubeChannelId: 'UCfJtBtmhnIyfUB6RqXeImMw',
    flag: 've'
  },
  vpitv: {
    slug: 'vpitv',
    name: 'VPItv',
    youtubeChannelId: 'UCVFiIRuxJ2GmJLUkHmlmj4w',
    flag: 've'
  },
  'telesur-tv': {
    slug: 'telesur-tv',
    name: 'teleSUR tv',
    youtubeChannelId: 'UCbHFKMtqLYkIBRiPHJwxu_w',
    flag: 've'
  }
};
const mexicoSources: SourcesMap = {
  MILENIO: {
    slug: 'MILENIO',
    name: 'MILENIO',
    youtubeChannelId: 'UCFxHplbcoJK9m70c4VyTIxg',
    flag: 'mx'
  }
};
const hondurasSources: SourcesMap = {
  'hch-vivo': {
    slug: 'hch-vivo',
    name: 'HCH En Vivo',
    youtubeChannelId: 'UCIs6fmAXOI1K2jgkoBdWveg',
    flag: 'hn'
  }
};
const espanaSources: SourcesMap = {
  rtve: {
    slug: 'rtve',
    name: 'RTVE Noticias',
    youtubeChannelId: 'UC7QZIf0dta-XPXsp9Hv4dTw',
    flag: 'es'
  },
  'cnn-español': {
    slug: 'cnn-español',
    name: 'CNN en Español',
    youtubeChannelId: 'UC_lEiu6917IJz03TnntWUaQ',
    flag: 'es'
  }
};
const brasilSources: SourcesMap = {
  'cnn-brasil': {
    slug: 'cnn-brasil',
    name: 'CNN Brasil',
    youtubeChannelId: 'UCvdwhh_fDyWccR42-rReZLw',
    flag: 'br'
  }
};
const usaSources: SourcesMap = {
  'cnn-us': {
    slug: 'cnn-us',
    name: 'CNN US',
    m3u8Url:
      'https://cnn-cnninternational-1-de.samsung.wurl.com/manifest/playlist.m3u8',
    fuente: 'https://us.cnn.com',
    flag: 'us'
  },
  telemundo: {
    slug: 'telemundo',
    name: 'Noticias Telemundo',
    youtubeChannelId: 'UCRwA1NUcUnwsly35ikGhp0A',
    flag: 'us'
  },
  'sky-news': {
    slug: 'sky-news',
    name: 'Sky News',
    youtubeChannelId: 'UCoMdktPbSTixAyNGwb-UYkQ',
    flag: 'us'
  },
  newsmax: {
    slug: 'newsmax',
    name: 'Newsmax',
    youtubeChannelId: 'UCx6h-dWzJ5NpAlja1YsApdg',
    flag: 'us'
  },
  'fox-news-now': {
    slug: 'fox-news-now',
    name: 'NewsNOW from FOX',
    youtubeChannelId: 'UCJg9wBPyKMNA5sRDnvzmkdg',
    flag: 'us'
  },
  abc7: {
    slug: 'abc7',
    name: 'ABC7',
    youtubeChannelId: 'UCVxBA3Cbu3pm8w8gEIoMEog',
    flag: 'us'
  },
  'abc7-swfl': {
    slug: 'abc7-swfl',
    name: 'ABC7 SWFL',
    youtubeChannelId: 'UCq9e_hCv2jvgck8WowW1NXg',
    flag: 'us'
  },
  nbcla: {
    slug: 'nbcla',
    name: 'NBCLA',
    youtubeChannelId: 'UCSWoppsVL0TLxFQ2qP_DLqQ',
    flag: 'us'
  },
  'nbc-news': {
    slug: 'nbc-news',
    name: 'NBC News',
    youtubeChannelId: 'UCeY0bbntWzzVIaj2z3QigXg',
    flag: 'us'
  },
  'record-news': {
    slug: 'record-news',
    name: 'Record News',
    youtubeChannelId: 'UCuiLR4p6wQ3xLEm15pEn1Xw',
    flag: 'us'
  },
  'abc-news': {
    slug: 'abc-news',
    name: 'ABC News',
    m3u8Url:
      ' https://content.uplynk.com/channel/3324f2467c414329b3b0cc5cd987b6be.m3u8',
    fuente: 'https://abcnews.go.com/Live',
    flag: 'us'
  }
};
const franciaSources: SourcesMap = {
  'euronews-esp': {
    slug: 'euronews-esp',
    name: 'euronews (Español)',
    youtubeChannelId: 'UCyoGb3SMlTlB8CLGVH4c8Rw',
    flag: 'fr'
  },
  'euronews-eng': {
    slug: 'euronews-eng',
    name: 'euronews (English)',
    youtubeChannelId: 'UCSrZ3UV4jOidv8ppoVuvW9Q',
    flag: 'fr'
  },
  'euronews-rus': {
    slug: 'euronews-rus',
    name: 'euronews Русский',
    youtubeChannelId: 'UCFzJjgVicCtFxJ5B0P_ei8A',
    flag: 'fr'
  },
  'euronews-hun': {
    slug: 'euronews-hun',
    name: 'euronews (magyarul)',
    youtubeChannelId: 'UC4Ct8gIf9f0n4mdyGsFiZRA',
    flag: 'fr'
  },
  'france-24-esp': {
    slug: 'france-24-esp',
    name: 'FRANCE 24 Español',
    youtubeChannelId: 'UCUdOoVWuWmgo1wByzcsyKDQ',
    flag: 'fr'
  },
  'france-24-eng': {
    slug: 'france-24-eng',
    name: 'FRANCE 24 English',
    youtubeChannelId: 'UCQfwfsi5VrQ8yKZ-UWmAEFg',
    flag: 'fr'
  },
  'france-24-fra': {
    slug: 'france-24-fra',
    name: 'FRANCE 24 French',
    m3u8Url: 'https://static.france24.com/live/F24_FR_HI_HLS/live_tv.m3u8',
    fuente: 'https://www.france24.com/fr/direct',
    flag: 'fr'
  },
  'france-info': {
    slug: 'france-info',
    name: 'franceinfo',
    youtubeChannelId: 'UCO6K_kkdP-lnSCiO3tPx7WA',
    flag: 'fr'
  },
  lci: {
    slug: 'lci',
    name: 'LCI',
    m3u8Url: 'https://lci-hls-live-ssl.tf1.fr/lci/1/hls/live_2328.m3u8',
    fuente: 'https://www.tf1info.fr/direct/',
    flag: 'fr'
  }
};
const rusiaSources: SourcesMap = {
  'RT-español': {
    slug: 'RT-español',
    name: 'RT en Español',
    youtubeChannelId: 'UC2mtXUpAYLYJIZ2deSPhlqw',
    flag: 'ru'
  },
  'RT-vivo': {
    slug: 'RT-vivo',
    name: 'RT en vivo',
    youtubeChannelId: 'UCEIhICHOQOonjE6V0SLdrHQ',
    flag: 'ru'
  },
  'RT-News': {
    slug: 'RT-News',
    name: 'RT News',
    youtubeChannelId: 'UCpwvZwUam-URkxB7g4USKpg',
    flag: 'ru'
  },
  'RT-america': {
    slug: 'RT-america',
    name: 'RT America',
    youtubeChannelId: 'UCczrL-2b-gYK3l4yDld4XlQ',
    flag: 'ru'
  }
};
const chinaSources: SourcesMap = {
  'live-chino': {
    slug: 'live-chino',
    name: '民視直播 FTVN Live 53',
    youtubeChannelId: 'UClIfopQZlkkSpM1VgCFLRJA',
    flag: 'cn'
  },
  'live-chino-2': {
    slug: 'live-chino-2',
    name: '三立LIVE新聞',
    youtubeChannelId: 'UC2TuODJhC03pLgd6MpWP0iw',
    flag: 'cn'
  },
  'live-chino-3': {
    slug: 'live-chino-3',
    name: '三立iNEWS',
    youtubeChannelId: 'UCoNYj9OFHZn3ACmmeRCPwbA',
    flag: 'cn'
  },
  'live-chino-4': {
    slug: 'live-chino-4',
    name: '中視新聞 HD直播頻道',
    youtubeChannelId: 'UCmH4q-YjeazayYCVHHkGAMA',
    flag: 'cn'
  },
  'live-chino-5': {
    slug: 'live-chino-5',
    name: '華視新聞 CH52',
    youtubeChannelId: 'UCDCJyLpbfgeVE9iZiEam-Kg',
    flag: 'cn'
  },
  'live-chino-6': {
    slug: 'live-chino-6',
    name: '中天電視',
    youtubeChannelId: 'UC5l1Yto5oOIgRXlI4p4VKbw',
    flag: 'cn'
  }
};
const variosSources: SourcesMap = {
  dw: {
    slug: 'dw',
    name: 'DW Español',
    youtubeChannelId: 'UCT4Jg8h03dD0iN3Pb5L0PMA'
  },
  'trt-world': {
    slug: 'trt-world',
    name: 'TRT World',
    youtubeChannelId: 'UC7fWeaHhqgM4Ry-RMpM2YYw'
  },
  'al-jazeera': {
    slug: 'al-jazeera',
    name: 'Al Jazeera English',
    youtubeChannelId: 'UCNye-wNBqNL5ZzHSJj3l8Bg'
  },
  'al-jazeera-arabe': {
    slug: 'al-jazeera-arabe',
    name: 'AlJazeera Channel قناة الجزيرة',
    youtubeChannelId: 'UCfiwzLy-8yKzIbsmZTzxDgw'
  },
  cna: {
    slug: 'cna',
    name: 'CNA',
    youtubeChannelId: 'UC83jt4dlz1Gjl58fzQrrKZg'
  },
  'news-nigeria': {
    slug: 'news-nigeria',
    name: 'TVC News Nigeria',
    youtubeChannelId: 'UCgp4A6I8LCWrhUzn-5SbKvA'
  },
  'HK-apple-daily': {
    slug: 'HK-apple-daily',
    name: 'HK Apple Daily',
    youtubeChannelId: 'UCeqUUXaM75wrK5Aalo6UorQ'
  },
  'live-japones': {
    slug: 'live-japones',
    name: 'ANNnewsCH',
    youtubeChannelId: 'UCGCZAYq5Xxojl_tSXcVJhiQ'
  },
  'abc-news-au': {
    slug: 'abc-news-au',
    name: 'ABC News AU',
    m3u8Url:
      ' https://abc-iview-mediapackagestreams-2.akamaized.net/out/v1/6e1cc6d25ec0480ea099a5399d73bc4b/index.m3u8',
    fuente: 'https://www.abc.net.au/news/'
  }
};

export const internacionalSources: SourcesMap = {
  ...argentinaSources,
  ...colombiaSources,
  ...peruSources,
  ...venezuelaSources,
  ...mexicoSources,
  ...hondurasSources,
  ...espanaSources,
  ...brasilSources,
  ...usaSources,
  ...franciaSources,
  ...rusiaSources,
  ...chinaSources,
  ...variosSources
};
