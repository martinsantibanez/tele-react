import { SourcesMap } from '.';

export const radiosSources: SourcesMap = {
  BIOBIO_CHILE_1: {
    slug: 'BIOBIO_CHILE_1',
    titleHtml:
      '<img style="height: 20px; width:auto:" src="imagenes/Logo_BIOBIOCHILE.svg"></img>ﾠSEÑAL 1',
    m3u8Url:
      'https://unlimited1-cl-isp.dps.live/bbclccp/bbclccp.smil/playlist.m3u8'
  },
  BIOBIOTV: {
    slug: 'BIOBIOTV',
    titleHtml:
      '<img style="height: 20px; width:auto:" src="imagenes/Logo_BIOBIOCHILE.svg"></img>ﾠBIOBIO TV',
    codeHtml:
      '<div class="embed-responsive embed-responsive-16by9"> <iframe class="embed-responsive-item" src="/Monitores/SeñalRADIO_BIOBIOTV.html" frameborder="0"></iframe><div class="CAJATituloDePantallaPequeña2"><div class="TextoTitulosMonitor1">ㅤBIOBIO TVㅤ</div></div></div>'
  },
  ADNRADIO: {
    slug: 'ADNRADIO',
    titleHtml:
      '<img style="height: 20px; width:auto:" src="imagenes/Logo_ADNRADIO.svg"></img>ﾠ',
    name: 'ADN RADIO',
    m3u8Url: 'https://unlimited1-cl-isp.dps.live/adntv/adntv.smil/playlist.m3u8'
  },
  COOPERATIVA: {
    slug: 'COOPERATIVA',
    titleHtml:
      '<img style="height: 20px; width:auto:" src="imagenes/Logo_Radio_Cooperativa.svg"></img>ﾠ',
    name: 'COOPERATIVA',
    m3u8Url:
      'https://unlimited1-cl-isp.dps.live/coopetv/coopetv.smil/playlist.m3u8'
  },
  T13RADIO: {
    slug: 'T13RADIO',
    titleHtml:
      '<img style="height: 20px; width:auto:" src="imagenes/Tele13RADIO.svg"></img>',
    codeHtml:
      '<div class="embed-responsive embed-responsive-16by9"> <iframe class="embed-responsive-item" src="/Monitores/SeñalRADIO_T13.html" frameborder="0"></iframe><div class="CAJATituloDePantallaPequeña2"><div class="TextoTitulosMonitor1">ㅤT13 RADIOㅤ</div></div></div>'
  },
  INFINITA: {
    slug: 'INFINITA',
    titleHtml: 'RADIO INFINITA',
    codeHtml:
      '<div class="embed-responsive embed-responsive-16by9"> <iframe class="embed-responsive-item" src="/Monitores/SeñalRADIO_INFINITA.html" frameborder="0"></iframe><div class="CAJATituloDePantallaPequeña2"><div class="TextoTitulosMonitor1">ㅤRADIO INFINITAㅤ</div></div></div>'
  },
  LA_CLAVE: {
    slug: 'LA_CLAVE',
    titleHtml: 'RADIO LA CLAVE',
    m3u8Url:
      'https://unlimited1-cl-isp.dps.live/laclavetv/laclavetv.smil/playlist.m3u8'
  },
  TIEMPO: {
    slug: 'TIEMPO',
    titleHtml: 'RADIO TIEMPO',
    codeHtml:
      '<div class="embed-responsive embed-responsive-16by9"> <iframe class="embed-responsive-item" src="/Monitores/SeñalRADIO_TIEMPO.html" frameborder="0"></iframe><div class="CAJATituloDePantallaPequeña2"><div class="TextoTitulosMonitor1">ㅤRADIO TIEMPOㅤ</div></div></div>'
  },
  PUDAHUEL: {
    slug: 'PUDAHUEL',
    titleHtml: 'RADIO PUDAHUEL',
    codeHtml:
      '<div class="embed-responsive embed-responsive-16by9"> <iframe class="embed-responsive-item" src="/Monitores/SeñalRADIO_PUDAHUEL.html" frameborder="0"></iframe><div class="CAJATituloDePantallaPequeña2"><div class="TextoTitulosMonitor1">ㅤRADIO PUDAHUELㅤ</div></div></div>'
  },
  SeñalRADIO_DUNA: {
    slug: 'SeñalRADIO_DUNA',
    titleHtml: 'RADIO DUNA',
    codeHtml:
      '<div class="embed-responsive embed-responsive-16by9"> <iframe class="embed-responsive-item" src="/Monitores/SeñalRADIO_DUNA.html" frameborder="0"></iframe><div class="CAJATituloDePantallaPequeña2"><div class="TextoTitulosMonitor1">ㅤRADIO DUNAㅤ</div></div></div>'
  },
  SeñalRADIO_AGRICULTURA: {
    slug: 'SeñalRADIO_AGRICULTURA',
    titleHtml: 'RADIO AGRICULTURA',
    codeHtml:
      '<div class="embed-responsive embed-responsive-16by9"> <iframe class="embed-responsive-item" src="/Monitores/SeñalRADIO_AGRICULTURA.html" frameborder="0"></iframe><div class="CAJATituloDePantallaPequeña2"><div class="TextoTitulosMonitor1">ㅤRADIO AGRICULTURAㅤ</div></div></div>'
  },
  cooperativa: {
    slug: 'cooperativa',
    titleHtml: '📻 Cooperativa',
    iframeSrc: 'https://rudo.video/live/coopetv?volume=0&mute=1',
    fuente: 'http://programas.cooperativa.cl/showalairelibre/'
  },
  bbtv: {
    slug: 'bbtv',
    titleHtml: '📻 Biobio TV',
    iframeSrc: 'https://rudo.video/live/bbtv?volume=0&mute=1',
    fuente: 'https://www.biobiochile.cl/biobiotv/'
  },
  'bbtv-2': {
    slug: 'bbtv-2',
    titleHtml: '📻 Biobio TV 2',
    m3u8Url: 'https://unlimited1-cl-isp.dps.live/bbtv/bbtv.smil/playlist.m3u8',
    fuente: 'https://www.biobiochile.cl/biobiotv/'
  },
  adn: {
    slug: 'adn',
    titleHtml: '📻 ADN',
    iframeSrc: 'https://rudo.video/live/adntv?volume=0&mute=1',
    fuente: 'http://tv.adnradio.cl/'
  },
  'adn-2': {
    slug: 'adn-2',
    titleHtml: '📻 ADN 2',
    iframeSrc:
      'https://www.youtube-nocookie.com/embed/live_stream?channel=UCczkrFICr0xEgDsk51zZojA&autoplay=1&mute=1&modestbranding=1&showinfo=0',
    fuente: 'https://www.youtube.com/channel/UCczkrFICr0xEgDsk51zZojA'
  },
  'adn-3': {
    slug: 'adn-3',
    titleHtml: '📻 ADN 3',
    m3u8Url: 'https://unlimited1-us.dps.live/adntv/adntv.smil/playlist.m3u8',
    fuente: 'http://tv.adnradio.cl/'
  },
  'adn-4': {
    slug: 'adn-4',
    titleHtml: '📻 ADN 4',
    m3u8Url: 'https://unlimited6-cl.dps.live/adntv/adntv.smil/playlist.m3u8',
    fuente: 'http://tv.adnradio.cl/'
  },
  'adn-5': {
    slug: 'adn-5',
    titleHtml: '📻 ADN 5',
    m3u8Url:
      'https://unlimited2-cl-isp.dps.live/adntv/adntv.smil/playlist.m3u8',
    fuente: 'http://tv.adnradio.cl/'
  },
  duna: {
    slug: 'duna',
    titleHtml: '📻 Duna',
    iframeSrc: 'https://rudo.video/live/dunatv?volume=0&mute=1',
    fuente: 'https://www.duna.cl/tv/'
  },
  infinita: {
    slug: 'infinita',
    titleHtml: '📻 Infinita',
    iframeSrc: 'https://rudo.video/live/infinitatv?volume=0&mute=1',
    fuente: 'http://www.infinita.cl/home/'
  },
  universo: {
    slug: 'universo',
    titleHtml: '📻 Universo',
    iframeSrc: 'https://rudo.video/live/universotv?volume=0&mute=1',
    fuente: 'https://www.universo.cl/'
  },
  'radio-ae': {
    slug: 'radio-ae',
    titleHtml: '📻 AE (DUOC)',
    iframeSrc:
      'https://live.grupoz.cl/3991add90400a25a1580f290246f90eb?sound=0',
    fuente: 'https://www.aeradio.cl/'
  },
  'carolina-tv': {
    slug: 'carolina-tv',
    titleHtml: '📻 Carolina TV',
    iframeSrc: 'https://rudo.video/live/carolinatv?volume=0&mute=1',
    fuente: 'https://www.carolina.cl/tv/'
  },
  'carolina-tv-m3u': {
    slug: 'carolina-tv-m3u',
    titleHtml: '📻 Carolina TV 2',
    m3u8Url:
      'https://unlimited6-cl.dps.live/carolinatv/carolinatv.smil/carolinatv/livestream2/chunks.m3u8',
    fuente: 'https://www.carolina.cl/tv/'
  },
  'fm-tiempo': {
    slug: 'fm-tiempo',
    titleHtml: '📻 FM Tiempo',
    iframeSrc: 'https://rudo.video/live/fmtiempotv?volume=0&mute=1',
    fuente: 'https://www.fmtiempo.cl/'
  },
  'fm-tiempo-m3u': {
    slug: 'fm-tiempo-m3u',
    titleHtml: '📻 FM Tiempo 2',
    m3u8Url:
      'https://unlimited10-cl.dps.live/fmtiempotv/fmtiempotv.smil/playlist.m3u8',
    fuente: 'https://www.fmtiempo.cl/'
  },
  'alegria-tv-m3u': {
    slug: 'alegria-tv-m3u',
    titleHtml: '📻 Alegría TV',
    m3u8Url: 'https://593b04c4c5670.streamlock.net:443/8192/8192/playlist.m3u8',
    fuente: 'https://www.alegriafm.cl/'
  },
  'romantica-tv': {
    slug: 'romantica-tv',
    titleHtml: '📻 Romántica TV',
    iframeSrc: 'https://rudo.video/live/romanticatv?volume=0&mute=1',
    fuente: 'https://www.romantica.cl/romantica-tv/'
  },
  'romantica-tv-m3u': {
    slug: 'romantica-tv-m3u',
    titleHtml: '📻 Romántica TV 2',
    m3u8Url:
      'https://unlimited2-cl-isp.dps.live/romanticatv/romanticatv.smil/playlist.m3u8',
    fuente: 'https://www.romantica.cl/romantica-tv/'
  },
  'radio-genial': {
    slug: 'radio-genial',
    titleHtml: '📻 Radio Genial 100.5 FM',
    m3u8Url: 'https://v2.tustreaming.cl/genialtv/index.m3u8',
    fuente: 'https://radiogenial.cl/'
  },
  'mi-radio-es-mas': {
    slug: 'mi-radio-es-mas',
    titleHtml: '📻 Mi Radio es Más',
    iframeSrc:
      'https://www.youtube-nocookie.com/embed/live_stream?channel=UCflUbt1g29kPG-H9SV5QIyw&autoplay=1&mute=1&modestbranding=1&showinfo=0',
    fuente: 'https://www.youtube.com/channel/UCflUbt1g29kPG-H9SV5QIyw'
  },
  'radio-la-clave': {
    slug: 'radio-la-clave',
    titleHtml: '📻 Radio La Clave',
    iframeSrc: 'https://rudo.video/live/laclavetv?volume=0&mute=1',
    fuente: 'https://radiolaclave.cl/'
  },
  'radio-folclor-chile': {
    slug: 'radio-folclor-chile',
    titleHtml: '📻 Radio Folclor de Chile',
    iframeSrc:
      'https://www.youtube-nocookie.com/embed/live_stream?channel=UC0Hl8kJe8Xwv8g63Q4qefQg&autoplay=1&mute=1&modestbranding=1&showinfo=0',
    fuente: 'https://www.youtube.com/channel/UC0Hl8kJe8Xwv8g63Q4qefQg'
  },
  'radio-maria-chile': {
    slug: 'radio-maria-chile',
    titleHtml: '📻 Radio María Chile',
    iframeSrc:
      'https://www.youtube-nocookie.com/embed/live_stream?channel=UClMwb2kCYemWyDIZ2dYttKA&autoplay=1&mute=1&modestbranding=1&showinfo=0',
    fuente: 'https://www.youtube.com/channel/UClMwb2kCYemWyDIZ2dYttKA'
  },
  sembrador: {
    slug: 'sembrador',
    titleHtml: '📻 El Sembrador',
    m3u8Url:
      'https://5eff35271151c.streamlock.net:1936/8064/8064/playlist.m3u8',
    fuente: 'https://www.radioelsembrador.cl/tv/'
  },
  'radio-nuble': {
    slug: 'radio-nuble',
    titleHtml: '📻 Radio Ñuble',
    m3u8Url: 'https://live.tvcontrolcp.com:1936/Rnuble/Rnuble/playlist.m3u8',
    fuente: 'http://radionuble.cl/linea/'
  },
  RLN: {
    slug: 'RLN',
    titleIcons: [<img src="imagenes/Logo_RLN.svg" key="logo" />],
    m3u8Url: 'https://v2.tustreaming.cl/rln/tracks-v1a1/mono.m3u8',
    name: 'RADIO LAS NIEVES'
  },
  GENIAL: {
    slug: 'GENIAL',
    titleHtml: 'RADIO GENIAL',
    iframeSrc: '/Monitores/SeñalRADIO_GENIAL.html',
    name: 'RADIO GENIAL'
  },
  CANAL_SUR_PATAGONIA: {
    slug: 'CANAL_SUR_PATAGONIA',
    titleHtml: 'CANAL SUR PATAGONIA',
    m3u8Url:
      'https://v2.tustreaming.cl:19360/canalsurpatagoniatv/canalsurpatagoniatv.m3u8',
    name: 'RADIO CANAL SUR PATAGONIA'
  },
  MILENARIA: {
    slug: 'MILENARIA',
    titleHtml: 'RADIO MILENARIA',
    codeHtml:
      '<div class="embed-responsive embed-responsive-16by9"> <iframe class="embed-responsive-item" src="/Monitores/SeñalRADIO_MILENARIA.html" frameborder="0"></iframe><div class="CAJATituloDePantallaPequeña2"><div class="TextoTitulosMonitor1">ㅤRADIO MILENARIAㅤ</div></div></div>'
  }
};
