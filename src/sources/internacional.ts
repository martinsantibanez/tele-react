import { SourcesMap } from ".";

const argentinaSources: SourcesMap = {
  tn: {
    slug: "tn",
    listTitle: "Todonoticias",
    youtubeChannelId: "UCj6PcyLvpnIRT_2W_mwa9Aw",
    flag: "ar",
  },
  c5n: {
    slug: "c5n",
    listTitle: "C5N",
    youtubeChannelId: "UCFgk2Q2mVO1BklRQhSv6p0w",
    flag: "ar",
  },
  "america-tv": {
    slug: "america-tv",
    listTitle: "América TV",
    youtubeChannelId: "UC6NVDkuzY2exMOVFw4i9oHw",
    flag: "ar",
  },
  "net-tv": {
    slug: "net-tv",
    listTitle: "Net TV",
    iframeSrc: "https://rudo.video/live/nettv?volume=0&mute=1",
    fuente: "https://www.canalnet.tv/page/senal-en-vivo",
    flag: "ar",
  },
  "tv-publica-arg": {
    slug: "tv-publica-arg",
    listTitle: "Televisión Pública",
    youtubeChannelId: "UCs231K71Bnu5295_x0MB5Pg",
    flag: "ar",
  },
  "cronica-tv": {
    slug: "cronica-tv",
    listTitle: "Crónica TV",
    youtubeChannelId: "UCT7KFGv6s2a-rh2Jq8ZdM1g",
    flag: "ar",
  },
  "el-siete-tv": {
    slug: "el-siete-tv",
    listTitle: "El Siete TV",
    youtubeChannelId: "UC64ZNqX0FQHabP8iIkmnR3A",
    flag: "ar",
  },
  a24: {
    slug: "a24",
    listTitle: "A24",
    youtubeChannelId: "UCR9120YBAqMfntqgRTKmkjQ",
    flag: "ar",
  },
  "la-nacion": {
    slug: "la-nacion",
    listTitle: "LA NACION",
    youtubeChannelId: "UCba3hpU7EFBSk817y9qZkiA",
    flag: "ar",
  },
  "ip-digital": {
    slug: "ip-digital",
    listTitle: "Información Periodistica",
    m3u8Url:
      "https://d1nmqgphjn0y4.cloudfront.net/live/ip/live.isml/5ee6e167-1167-4a85-9d8d-e08a3f55cff3.m3u8",
    fuente: "https://ip.digital/vivo",
    flag: "ar",
  },
  "ip-digital-2": {
    slug: "ip-digital-2",
    listTitle: "IP Noticias",
    youtubeChannelId: "UC1bBjOZieJWHbsFA0LwjjJA",
    flag: "ar",
  },
};

const colombiaSources: SourcesMap = {
  "el-tiempo": {
    slug: "el-tiempo",
    listTitle: "EL TIEMPO",
    youtubeChannelId: "UCe5-b0fCK3eQCpwS6MT0aNw",
    flag: "co",
  },
  "noti-caracol": {
    slug: "noti-caracol",
    listTitle: "Noticias Caracol",
    youtubeChannelId: "UC2Xq2PK-got3Rtz9ZJ32hLQ",
    flag: "co",
  },
  "red-mas-noticias": {
    slug: "red-mas-noticias",
    listTitle: "RED MÁS Noticias",
    youtubeChannelId: "UCpcvsK0UAI3MIHsjjj3CgMg",
    flag: "co",
  },
};

const peruSources: SourcesMap = {
  "tv-peru": {
    slug: "tv-peru",
    listTitle: "TVPerú Noticias",
    youtubeChannelId: "UCkZCoc42IipR1ucqJmIehsA",
    flag: "pe",
  },
  "nacional-tv": {
    slug: "nacional-tv",
    listTitle: "Nacional TV",
    m3u8Url:
      "https://stmv.panel.grupolimalive.com/nacionaltv/nacionaltv/playlist.m3u8",
    fuente: "https://ntvperu.pe/senal-en-vivo/",
    flag: "pe",
  },
  "panamericana-tv": {
    slug: "panamericana-tv",
    listTitle: "Panamericana TV",
    iframeSrc:
      "https://geo.dailymotion.com/player/x5poh.html?video=x774s7s&autoplay=true&volume=0",
    fuente: "https://panamericana.pe/tvenvivo",
    flag: "pe",
  },
  "onda-digital-tv": {
    slug: "onda-digital-tv",
    listTitle: "Onda Digital TV",
    m3u8Url: "https://ed1ov.live.opencaster.com/CwCfFGFdtebB/index.m3u8",
    fuente: "https://ondadigitaltv.com",
    flag: "pe",
  },
  uci: {
    slug: "uci",
    listTitle: "UCI",
    m3u8Url: "https://mediastreamm.com:3449/live/mlecaroslive.m3u8",
    fuente: "https://uci.pe/envivo",
    flag: "pe",
  },
  "uci-2": {
    slug: "uci-2",
    listTitle: "UCI 2",
    youtubeChannelId: "UCdl1ygFwPa6lUdNYPLjoAGg",
    flag: "pe",
  },
  "cable-vision-peru": {
    slug: "cable-vision-peru",
    listTitle: "Cable Visión Perú",
    m3u8Url:
      "https://5ee0faac3bbae.streamlock.net/visionnoticias/visionnoticias/playlist.m3u8",
    fuente: "https://www.cablevisionperu.pe/?page_id=1938",
    flag: "pe",
  },
  atv: {
    slug: "atv",
    listTitle: "ATV",
    m3u8Url:
      "https://d2tr4gdfol9ja.cloudfront.net/atv/smil:atv.smil/playlist.m3u8",
    fuente: "https://www.atv.pe/envivo-atv",
    flag: "pe",
  },
  "atv-mas": {
    slug: "atv-mas",
    listTitle: "ATV Más",
    m3u8Url:
      "https://d2tr4gdfol9ja.cloudfront.net/atv/smil:atv-mas.smil/playlist.m3u8",
    fuente: "https://www.atv.pe/envivo-atvmas",
    flag: "pe",
  },
  "la-republica": {
    slug: "la-republica",
    listTitle: "La República",
    youtubeChannelId: "UC-B7Xv56uNRDkj0vC3QW8Cg",
    flag: "pe",
  },
  willax: {
    slug: "willax",
    listTitle: "Willax",
    iframeSrc:
      "https://geo.dailymotion.com/player/x5poh.html?video=x7x4dgx&autoplay=true&volume=0",
    fuente: "https://willax.tv/en-vivo/",
    flag: "pe",
  },
  "latina-noticias": {
    slug: "latina-noticias",
    listTitle: "Latina Noticias",
    youtubeChannelId: "UCpSJ5fGhmAME9Kx2D3ZvN3Q",
    flag: "pe",
  },
  "ovacion-tv": {
    slug: "ovacion-tv",
    listTitle: "📻 Ovación TV",
    m3u8Url:
      "https://5c3fb01839654.streamlock.net:1963/iptvovacion1/liveovacion1tv/playlist.m3u8",
    fuente: "https://ovacion.pe/radio",
    flag: "pe",
  },
  "pbo-radio": {
    slug: "pbo-radio",
    listTitle: "📻 PBO",
    youtubeChannelId: "UCgR0st4ZLABi-LQcWNu3wnQ",
    flag: "pe",
  },
  "santa-rosa": {
    slug: "santa-rosa",
    listTitle: "📻 Radio Santa Rosa",
    youtubeChannelId: "UCIGV0oiNkdK2-tnf10DNp2A",
    flag: "pe",
  },
  "san-borja": {
    slug: "san-borja",
    listTitle: "📻 Radio San Borja Tv",
    m3u8Url:
      "https://5c3fb01839654.streamlock.net:1963/iptvsanborja/livesanborjatv/playlist.m3u8",
    fuente: "https://radiosanborjatv.com/",
    flag: "pe",
  },
  "radio-onda-digital": {
    slug: "radio-onda-digital",
    listTitle: "📻 Radio Onda Digital",
    m3u8Url: "https://tv.ondadigital.pe:1936/ondatv2/ondatv2/playlist.m3u8",
    fuente: "https://www.ondadigital.pe/",
    flag: "pe",
  },
  "radio-tropical": {
    slug: "radio-tropical",
    listTitle: "📻 Radio Tropical",
    m3u8Url:
      "https://5ee0faac3bbae.streamlock.net/raditropical/raditropical/playlist.m3u8",
    fuente: "https://radiotropical.pe/",
    flag: "pe",
  },
  "radio-uno": {
    slug: "radio-uno",
    listTitle: "📻 Radio Uno",
    youtubeChannelId: "UCK0lpuL9PQb3I5CDcu7Y7bA",
    flag: "pe",
  },
};

const venezuelaSources: SourcesMap = {
  globovision: {
    slug: "globovision",
    listTitle: "Globovisión En Vivo",
    youtubeChannelId: "UCfJtBtmhnIyfUB6RqXeImMw",
    flag: "ve",
  },
  vpitv: {
    slug: "vpitv",
    listTitle: "VPItv",
    youtubeChannelId: "UCVFiIRuxJ2GmJLUkHmlmj4w",
    flag: "ve",
  },
  "telesur-tv": {
    slug: "telesur-tv",
    listTitle: "teleSUR tv",
    youtubeChannelId: "UCbHFKMtqLYkIBRiPHJwxu_w",
    flag: "ve",
  },
};
const mexicoSources: SourcesMap = {
  MILENIO: {
    slug: "MILENIO",
    listTitle: "MILENIO",
    youtubeChannelId: "UCFxHplbcoJK9m70c4VyTIxg",
    flag: "mx",
  },
};
const hondurasSources: SourcesMap = {
  "hch-vivo": {
    slug: "hch-vivo",
    listTitle: "HCH En Vivo",
    youtubeChannelId: "UCIs6fmAXOI1K2jgkoBdWveg",
    flag: "ho",
  },
};
const espanaSources: SourcesMap = {
  rtve: {
    slug: "rtve",
    listTitle: "RTVE Noticias",
    youtubeChannelId: "UC7QZIf0dta-XPXsp9Hv4dTw",
    flag: "es",
  },
  "cnn-español": {
    slug: "cnn-español",
    listTitle: "CNN en Español",
    youtubeChannelId: "UC_lEiu6917IJz03TnntWUaQ",
    flag: "es",
  },
};
const brasilSources: SourcesMap = {
  "cnn-brasil": {
    slug: "cnn-brasil",
    listTitle: "CNN Brasil",
    youtubeChannelId: "UCvdwhh_fDyWccR42-rReZLw",
    flag: "br",
  },
};
const usaSources: SourcesMap = {
  "cnn-us": {
    slug: "cnn-us",
    listTitle: "CNN US",
    m3u8Url:
      "https://cnn-cnninternational-1-de.samsung.wurl.com/manifest/playlist.m3u8",
    fuente: "https://us.cnn.com",
    flag: "us",
  },
  telemundo: {
    slug: "telemundo",
    listTitle: "Noticias Telemundo",
    youtubeChannelId: "UCRwA1NUcUnwsly35ikGhp0A",
    flag: "us",
  },
  "sky-news": {
    slug: "sky-news",
    listTitle: "Sky News",
    youtubeChannelId: "UCoMdktPbSTixAyNGwb-UYkQ",
    flag: "us",
  },
  newsmax: {
    slug: "newsmax",
    listTitle: "Newsmax",
    youtubeChannelId: "UCx6h-dWzJ5NpAlja1YsApdg",
    flag: "us",
  },
  "fox-news-now": {
    slug: "fox-news-now",
    listTitle: "NewsNOW from FOX",
    youtubeChannelId: "UCJg9wBPyKMNA5sRDnvzmkdg",
    flag: "us",
  },
  abc7: {
    slug: "abc7",
    listTitle: "ABC7",
    youtubeChannelId: "UCVxBA3Cbu3pm8w8gEIoMEog",
    flag: "us",
  },
  "abc7-swfl": {
    slug: "abc7-swfl",
    listTitle: "ABC7 SWFL",
    youtubeChannelId: "UCq9e_hCv2jvgck8WowW1NXg",
    flag: "us",
  },
  nbcla: {
    slug: "nbcla",
    listTitle: "NBCLA",
    youtubeChannelId: "UCSWoppsVL0TLxFQ2qP_DLqQ",
    flag: "us",
  },
  "nbc-news": {
    slug: "nbc-news",
    listTitle: "NBC News",
    youtubeChannelId: "UCeY0bbntWzzVIaj2z3QigXg",
    flag: "us",
  },
  "record-news": {
    slug: "record-news",
    listTitle: "Record News",
    youtubeChannelId: "UCuiLR4p6wQ3xLEm15pEn1Xw",
    flag: "us",
  },
  "abc-news": {
    slug: "abc-news",
    listTitle: "ABC News",
    m3u8Url:
      " https://content.uplynk.com/channel/3324f2467c414329b3b0cc5cd987b6be.m3u8",
    fuente: "https://abcnews.go.com/Live",
    flag: "us",
  },
};
const franciaSources: SourcesMap = {
  "euronews-esp": {
    slug: "euronews-esp",
    listTitle: "euronews (Español)",
    youtubeChannelId: "UCyoGb3SMlTlB8CLGVH4c8Rw",
    flag: "fr",
  },
  "euronews-eng": {
    slug: "euronews-eng",
    listTitle: "euronews (English)",
    youtubeChannelId: "UCSrZ3UV4jOidv8ppoVuvW9Q",
    flag: "fr",
  },
  "euronews-rus": {
    slug: "euronews-rus",
    listTitle: "euronews Русский",
    youtubeChannelId: "UCFzJjgVicCtFxJ5B0P_ei8A",
    flag: "fr",
  },
  "euronews-hun": {
    slug: "euronews-hun",
    listTitle: "euronews (magyarul)",
    youtubeChannelId: "UC4Ct8gIf9f0n4mdyGsFiZRA",
    flag: "fr",
  },
  "france-24-esp": {
    slug: "france-24-esp",
    listTitle: "FRANCE 24 Español",
    youtubeChannelId: "UCUdOoVWuWmgo1wByzcsyKDQ",
    flag: "fr",
  },
  "france-24-eng": {
    slug: "france-24-eng",
    listTitle: "FRANCE 24 English",
    youtubeChannelId: "UCQfwfsi5VrQ8yKZ-UWmAEFg",
    flag: "fr",
  },
  "france-24-fra": {
    slug: "france-24-fra",
    listTitle: "FRANCE 24 French",
    m3u8Url: "https://static.france24.com/live/F24_FR_HI_HLS/live_tv.m3u8",
    fuente: "https://www.france24.com/fr/direct",
    flag: "fr",
  },
  "france-info": {
    slug: "france-info",
    listTitle: "franceinfo",
    youtubeChannelId: "UCO6K_kkdP-lnSCiO3tPx7WA",
    flag: "fr",
  },
  lci: {
    slug: "lci",
    listTitle: "LCI",
    m3u8Url: "https://lci-hls-live-ssl.tf1.fr/lci/1/hls/live_2328.m3u8",
    fuente: "https://www.tf1info.fr/direct/",
    flag: "fr",
  },
};
const rusiaSources: SourcesMap = {
  "RT-español": {
    slug: "RT-español",
    listTitle: "RT en Español",
    youtubeChannelId: "UC2mtXUpAYLYJIZ2deSPhlqw",
    flag: "ru",
  },
  "RT-vivo": {
    slug: "RT-vivo",
    listTitle: "RT en vivo",
    youtubeChannelId: "UCEIhICHOQOonjE6V0SLdrHQ",
    flag: "ru",
  },
  "RT-News": {
    slug: "RT-News",
    listTitle: "RT News",
    youtubeChannelId: "UCpwvZwUam-URkxB7g4USKpg",
    flag: "ru",
  },
  "RT-america": {
    slug: "RT-america",
    listTitle: "RT America",
    youtubeChannelId: "UCczrL-2b-gYK3l4yDld4XlQ",
    flag: "ru",
  },
};
const chinaSources: SourcesMap = {
  "live-chino": {
    slug: "live-chino",
    listTitle: "民視直播 FTVN Live 53",
    youtubeChannelId: "UClIfopQZlkkSpM1VgCFLRJA",
    flag: "cn",
  },
  "live-chino-2": {
    slug: "live-chino-2",
    listTitle: "三立LIVE新聞",
    youtubeChannelId: "UC2TuODJhC03pLgd6MpWP0iw",
    flag: "cn",
  },
  "live-chino-3": {
    slug: "live-chino-3",
    listTitle: "三立iNEWS",
    youtubeChannelId: "UCoNYj9OFHZn3ACmmeRCPwbA",
    flag: "cn",
  },
  "live-chino-4": {
    slug: "live-chino-4",
    listTitle: "中視新聞 HD直播頻道",
    youtubeChannelId: "UCmH4q-YjeazayYCVHHkGAMA",
    flag: "cn",
  },
  "live-chino-5": {
    slug: "live-chino-5",
    listTitle: "華視新聞 CH52",
    youtubeChannelId: "UCDCJyLpbfgeVE9iZiEam-Kg",
    flag: "cn",
  },
  "live-chino-6": {
    slug: "live-chino-6",
    listTitle: "中天電視",
    youtubeChannelId: "UC5l1Yto5oOIgRXlI4p4VKbw",
    flag: "cn",
  },
};
const variosSources: SourcesMap = {
  dw: {
    slug: "dw",
    listTitle: "DW Español",
    youtubeChannelId: "UCT4Jg8h03dD0iN3Pb5L0PMA",
  },
  "trt-world": {
    slug: "trt-world",
    listTitle: "TRT World",
    youtubeChannelId: "UC7fWeaHhqgM4Ry-RMpM2YYw",
  },
  "al-jazeera": {
    slug: "al-jazeera",
    listTitle: "Al Jazeera English",
    youtubeChannelId: "UCNye-wNBqNL5ZzHSJj3l8Bg",
  },
  "al-jazeera-arabe": {
    slug: "al-jazeera-arabe",
    listTitle: "AlJazeera Channel قناة الجزيرة",
    youtubeChannelId: "UCfiwzLy-8yKzIbsmZTzxDgw",
  },
  cna: {
    slug: "cna",
    listTitle: "CNA",
    youtubeChannelId: "UC83jt4dlz1Gjl58fzQrrKZg",
  },
  "news-nigeria": {
    slug: "news-nigeria",
    listTitle: "TVC News Nigeria",
    youtubeChannelId: "UCgp4A6I8LCWrhUzn-5SbKvA",
  },
  "HK-apple-daily": {
    slug: "HK-apple-daily",
    listTitle: "HK Apple Daily",
    youtubeChannelId: "UCeqUUXaM75wrK5Aalo6UorQ",
  },
  "live-japones": {
    slug: "live-japones",
    listTitle: "ANNnewsCH",
    youtubeChannelId: "UCGCZAYq5Xxojl_tSXcVJhiQ",
  },
  "abc-news-au": {
    slug: "abc-news-au",
    listTitle: "ABC News AU",
    m3u8Url:
      " https://abc-iview-mediapackagestreams-2.akamaized.net/out/v1/6e1cc6d25ec0480ea099a5399d73bc4b/index.m3u8",
    fuente: "https://www.abc.net.au/news/",
  },
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
  ...variosSources,
};
