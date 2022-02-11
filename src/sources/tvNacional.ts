import { SourcesMap } from ".";

export const tvNacionalYoutubeSources: SourcesMap = {
  "24HTVN_YT": {
    slug: "24HTVN_YT",
    name: "Canal 24 horas",
    titleHtml:
      '<img style="height: 15px; width:auto:" src="imagenes/Logo_YT.svg"></img>ﾠ<img style="height: 20px; width:auto:" src="imagenes/Logo_24HORAS.svg"></img>',
    youtubeChannelId: "UCTXNz3gjAypWp3EhlIATEJQ",
  },

  T13_YT: {
    slug: "T13_YT",
    titleHtml:
      '<img style="height: 15px; width:auto:" src="imagenes/Logo_YT.svg"></img>ﾠ<img style="height: 20px; width:auto:" src="imagenes/Logo_T13.svg"></img>',
    name: "T13 MOVIL",
    youtubeChannelId: "UCsRnhjcUCR78Q3Ud6OXCTNg",
  },

  // ocasionales:
  TVN_YT: {
    slug: "TVN_YT",
    titleHtml:
      '<img style="height: 15px; width:auto:" src="imagenes/Logo_YT.svg"></img>ﾠ<img style="height: 20px; width:auto:" src="imagenes/Logo_TVN.svg"></img>',
    name: "TVN",
    youtubeChannelId: "UCaVaCaiG6qRzDiJDuEGKOhQ",
  },
  MEGANOTICIAS_YT: {
    slug: "MEGANOTICIAS_YT",
    titleHtml:
      '<img style="height: 15px; width:auto:" src="imagenes/Logo_YT.svg"></img>ﾠ<img style="height: 20px; width:auto:" src="imagenes/Logo_MEGANOTICIAS.svg"></img>',
    youtubeChannelId: "UCkccyEbqhhM3uKOI6Shm",
    fuente: "https://www.youtube.com/channel/UCkccyEbqhhM3uKOI6Shm-4Q",
  },
  CHV_NOTICIAS_YT: {
    slug: "CHV_NOTICIAS_YT",
    titleHtml:
      '<img style="height: 15px; width:auto:" src="imagenes/Logo_YT.svg"></img>ﾠ<img style="height: 20px; width:auto:" src="imagenes/Logo_CHV_NOTICIAS.svg"></img>',
    codeHtml:
      '<div class="embed-responsive embed-responsive-16by9"> <iframe class="embed-responsive-item" src="https://www.youtube.com/embed/live_stream?channel=UCRsUoZYC1ULUspipMRnMhwg&autoplay=true&mute=1" frameborder="0"></iframe><div class="CAJATituloDePantallaPequeña2"><div class="TextoTitulosMonitor1">ㅤCHV NOTICIASㅤ</div></div></div>',
  },
  "CANAL 13_YT": {
    slug: "CANAL 13_YT",
    name: "Canal 13",
    titleHtml:
      '<img style="height: 15px; width:auto:" src="imagenes/Logo_YT.svg"></img>ﾠ<img style="height: 20px; width:auto:" src="imagenes/Logo_Canal13.svg"></img>',
    youtubeChannelId: "UCd4D3LfXC_9MY2zSv_3gMgw",
  },
  CHV_YT: {
    slug: "CHV_YT",
    titleHtml:
      '<img style="height: 15px; width:auto:" src="imagenes/Logo_YT.svg"></img>ﾠ<img style="height: 20px; width:auto:" src="imagenes/Logo_CHV.svg"></img>',
    youtubeChannelId: "UC8EdTmyUaFIfZvVttJ9lgIA",
    name: "CHV",
  },
  MEGA_YT: {
    slug: "MEGA_YT",
    titleHtml:
      '<img style="height: 15px; width:auto:" src="imagenes/Logo_YT.svg"></img>ﾠ<img style="height: 20px; width:auto:" src="imagenes/Logo_MEGA.svg"></img>',
    youtubeChannelId: "UCEpId-jtRABuZyX6D2z6FZQ",
  },
};

export const tvNacionalSources: SourcesMap = {
  "24HTVN": {
    slug: "24HTVN",
    name: "24 Horas m3u",
    titleHtml:
      '<img style="height: 20px; width:auto:" src="imagenes/Logo_24PLAY.svg"></img>',
    m3u8Url:
      "https://mdstrm.com/live-stream-playlist/57d1a22064f5d85712b20dab.m3u8",
    fuente: "https://www.24horas.cl/envivo/",
  },
  LARED: {
    slug: "LARED",
    titleHtml:
      '<img style="height: 20px; width:auto:" src="imagenes/Logo_LA_RED.svg"></img>',
    name: "LA RED",
    m3u8Url:
      "https://unlimited1-cl-isp.dps.live/lared/lared.smil/playlist.m3u8",
  },
  MEGA: {
    slug: "MEGA",
    titleHtml:
      '<img style="height: 20px; width:auto:" src="imagenes/Logo_MEGA.svg"></img>',
    name: "Mega",
    m3u8Url: "https://unlimited1-cl-isp.dps.live/mega/mega.smil/playlist.m3u8",
    // m3u8Url: "https://unlimited2-cl-isp.dps.live/mega/mega.smil/playlist.m3u8",
    fuente: "https://www.mega.cl/",
  },
  CHV_WEB_IFRAME: {
    slug: "CHV_WEB_IFRAME",
    titleHtml:
      '<img style="height: 20px; width:auto:" src="imagenes/Logo_CHV.svg"></img>ﾠ<img style="height: 15px; width:auto:" src="imagenes/Icono_WebIframe.svg"></img>',
    codeHtml:
      '<div class="embed-responsive embed-responsive-16by9"> <iframe class="embed-responsive-item" src="/Senal/WEB/SeñalCHV_IFRAME.html" frameborder="0"></iframe><div class="CAJATituloDePantallaPequeña2"><div class="TextoTitulosMonitor1">ㅤCHVㅤ</div></div></div>',
  },
  CANAL13_WEB_IFRAME: {
    slug: "CANAL13_WEB_IFRAME",
    titleHtml:
      '<img style="height: 20px; width:auto:" src="imagenes/Logo_Canal13.svg"></img>ﾠ<img style="height: 15px; width:auto:" src="imagenes/Icono_WebIframe.svg"></img>',
    codeHtml:
      '<div class="embed-responsive embed-responsive-16by9"> <iframe class="embed-responsive-item" src="/Senal/WEB/SeñalCANAL13_IFRAME.html" frameborder="0"></iframe><div class="CAJATituloDePantallaPequeña2"><div class="TextoTitulosMonitor1">ㅤCANAL 13ㅤ</div></div></div>',
  },
  Señal_Interna_24HTVN_5: {
    slug: "Señal_Interna_24HTVN_5",
    titleHtml:
      '<img style="height: 20px; width:auto:" src="imagenes/Logo_24HTVN.svg"></img>ﾠSEÑAL 5',
    codeHtml:
      '<div class="embed-responsive embed-responsive-16by9"> <iframe class="embed-responsive-item" src="/Monitores/SeñalInterna24H_5.html" frameborder="0"></iframe><div class="CAJATituloDePantallaPequeña2"><div class="TextoTitulosMonitor1">ㅤ24HORAS 5ㅤ</div></div></div>',
  },

  TVMAS: {
    slug: "TVMAS",
    titleHtml:
      '<img style="height: 20px; width:auto:" src="imagenes/Logo_TVMAS.svg"></img>',
    codeHtml:
      '<div class="embed-responsive embed-responsive-16by9"> <iframe class="embed-responsive-item" src="/Monitores/SeñalTVMAS.html" frameborder="0"></iframe><div class="CAJATituloDePantallaPequeña2"><div class="TextoTitulosMonitor1">ㅤTV MASㅤ</div></div></div>',
  },
  UCVTV: {
    slug: "UCVTV",
    titleHtml:
      '<img style="height: 20px; width:auto:" src="imagenes/Logo_UCVTV.svg"></img>',
    codeHtml:
      '<div class="embed-responsive embed-responsive-16by9"> <iframe class="embed-responsive-item" src="/Monitores/Señal_UCVTV.html" frameborder="0"></iframe><div class="CAJATituloDePantallaPequeña2"><div class="TextoTitulosMonitor1">ㅤUCVㅤ</div></div></div>',
  },
  CNN_CHILE: {
    slug: "CNN_CHILE",
    titleHtml:
      '<img style="height: 20px; width:auto:" src="imagenes/Logo_CNNCHILE2.svg"></img>',
    youtubeChannelId: "UCpOAcjJNAp0Y0fhznRrXIJQ",
  },
  MEGANOTICIAS: {
    slug: "MEGANOTICIAS",
    titleHtml:
      '<img style="height: 20px; width:auto:" src="imagenes/Logo_MEGANOTICIAS.svg"></img>',
    codeHtml:
      '<div class="embed-responsive embed-responsive-16by9"> <iframe class="embed-responsive-item" src="/Monitores/SeñalMEGANOTICIAS.html" frameborder="0"></iframe><a href="SeñalMEGANOTICIAS.html" class="FondoTitulosMonitor1"><div class="TextoTitulosMonitor1 waves-effect waves-gris">ㅤMEGANOTICIASㅤ</div></a></div>',
    iframeSrc: "https://www.youtube.com/embed/8SOZCjrnVxQ?autoplay=true&mute=1",
  },
  T13_ENVIVO: {
    slug: "T13_ENVIVO",
    titleHtml:
      '<img style="height: 20px; width:auto:" src="imagenes/Logo_T13_ENVIVO.svg"></img>ﾠ<img style="height: 15px; width:auto:" src="imagenes/Icono_WebIframe.svg"></img>',
    codeHtml:
      '<div class="embed-responsive embed-responsive-16by9"> <iframe class="embed-responsive-item" src="/Monitores/SeñalT13_ENVIVO.html" frameborder="0"></iframe><a href="SeñalT13MOVIL.html" class="FondoTitulosMonitor1"><div class="TextoTitulosMonitor1 waves-effect waves-gris">ㅤT13ㅤ</div></a></div>',
  },
  TVN_WEB_IFRAME: {
    slug: "TVN_WEB_IFRAME",
    titleHtml:
      '<img style="height: 20px; width:auto:" src="imagenes/Logo_TVN.svg"></img>ﾠ<img style="height: 15px; width:auto:" src="imagenes/Icono_WebIframe.svg"></img>',
    codeHtml:
      '<div class="embed-responsive embed-responsive-16by9"> <iframe class="embed-responsive-item" src="/Senal/WEB/SeñalTVN_IFRAME.html" frameborder="0"></iframe><div class="CAJATituloDePantallaPequeña2"><div class="TextoTitulosMonitor1">ㅤTVNㅤ</div></div></div>',
  },
  WAPP_TV: {
    slug: "WAPP_TV",
    titleHtml:
      '<img style="height: 20px; width:auto:" src="imagenes/LogoTV_WappTV.svg"></img>',
    m3u8Url:
      "https://mdstrm.com/live-stream-playlist-v/6046495ddf98b007fa2fe807.m3u8",
    name: "WAPP TVㅤ",
  },
  NTV: {
    slug: "NTV",
    titleHtml:
      '<img style="height: 20px; width:auto:" src="imagenes/Logo_NTV.svg"></img>',
    m3u8Url:
      "https://mdstrm.com/live-stream-playlist/5aaabe9e2c56420918184c6d.m3u8",
    name: "NTVㅤ",
  },
  "13E": {
    slug: "13E",
    titleHtml:
      '<img style="height: 20px; width:auto:" src="imagenes/Logo_Canal13E.svg"></img>ﾠE',
    m3u8Url: "https://unlimited1-cl-isp.dps.live/13e/13e.smil/playlist.m3u8",
    name: "CANAL 13Eㅤ",
  },
  "canal-13-2": {
    slug: "canal-13-2",
    titleHtml: "Canal 13 2",
    iframeSrc: "https://13313131.tnvas.repl.co/",
    fuente: "https://www.13.cl/en-vivo",
  },
  "chv-2": {
    slug: "chv-2",
    titleHtml: "CHV 2",
    iframeSrc: "https://chvvvvvvvv.temporalservel.repl.co/",
    fuente: "https://www.chilevision.cl/senal-online",
  },
  "la-red-4": {
    slug: "la-red-4",
    titleHtml: "La Red 4",
    m3u8Url:
      "https://unlimited2-cl-isp.dps.live/lared/lared.smil/playlist.m3u8",
    fuente: "https://www.lared.cl/senal-online",
  },
  "stgo-tv": {
    slug: "stgo-tv",
    titleHtml: "Stgo TV",
    iframeSrc: "https://stv.janus.cl/front/embed.html",
    fuente: "https://www.santiagotelevision.cl/",
  },
};

export const tvNacionalDosSources: SourcesMap = {
  puranoticia: {
    slug: "puranoticia",
    titleHtml: "Puranoticia TV",
    m3u8Url: "https://pnt.janusmedia.tv/hls/pnt.m3u8",
    fuente: "https://puranoticia.pnt.cl/",
  },
  "holvoet-tv": {
    slug: "holvoet-tv",
    titleHtml: "Holvoet TV",
    iframeSrc: "https://rudo.video/live/holvoettv",
    fuente: "https://holvoet.cl/en-vivo/",
  },
  "holvoet-tv-m3u": {
    slug: "holvoet-tv-m3u",
    titleHtml: "Holvoet TV 2",
    m3u8Url:
      "https://unlimited1-cl-isp.dps.live/holvoettv/holvoettv.smil/playlist.m3u8",
    fuente: "https://holvoet.cl/en-vivo/",
  },
  "antofagasta-tv-m3u": {
    slug: "antofagasta-tv-m3u",
    titleHtml: "Antofagasta TV",
    m3u8Url:
      "https://unlimited6-cl.dps.live/atv/atv.smil/atv/livestream2/playlist.m3u8",
    fuente: "https://www.antofagasta.tv/",
  },
  "antofagasta-tv-m3u-2": {
    slug: "antofagasta-tv-m3u-2",
    titleHtml: "Antofagasta TV 2",
    m3u8Url: "https://unlimited1-cl-isp.dps.live/atv/atv.smil/playlist.m3u8",
    fuente: "https://www.antofagasta.tv/",
  },
  "canal-9": {
    slug: "canal-9",
    titleHtml: "Canal 9",
    iframeSrc: "https://rudo.video/live/c9?volume=0&mute=1",
    fuente: "https://www.canal9.cl/en-vivo/",
  },
  "canal-9-m3u": {
    slug: "canal-9-m3u",
    titleHtml: "Canal 9 2",
    m3u8Url:
      "https://unlimited6-cl.dps.live/c9/c9.smil/c9/livestream1/chunks.m3u8",
    fuente: "https://www.canal9.cl/en-vivo/",
  },
  tvu: {
    slug: "tvu",
    titleHtml: "TVU",
    iframeSrc: "https://rudo.video/live/tvu?volume=0&mute=1",
    fuente: "https://www.tvu.cl/",
  },
  "tvu-m3u": {
    slug: "tvu-m3u",
    titleHtml: "TVU 2",
    m3u8Url: "https://unlimited6-cl.dps.live/tvu/tvu.smil/playlist.m3u8",
    fuente: "https://www.tvu.cl/",
  },
  "canal-21": {
    slug: "canal-21",
    titleHtml: "Canal 21",
    iframeSrc:
      "https://live.grupoz.cl/8b383d0a9cef5560a1bfbbeaf6ad4a38?sound=0",
    fuente: "https://www.canal21tv.cl/wp/en-vivo/",
  },
  "canal-21-m3u": {
    slug: "canal-21-m3u",
    titleHtml: "Canal 21 2",
    m3u8Url: "https://tls.cdnz.cl/canal21tv/live/playlist.m3u8",
    fuente: "https://www.canal21tv.cl/wp/en-vivo/",
  },
  nublevision: {
    slug: "nublevision",
    titleHtml: "Ñublevision",
    m3u8Url:
      "https://cdn.oneplaychile.cl:1936/regionales/nublevision.stream/playlist.m3u8",
    fuente: "https://nublevision.cl/",
  },
  "estaciontv-m3u": {
    slug: "estaciontv-m3u",
    titleHtml: "Estacióntv",
    m3u8Url:
      "https://unlimited6-cl.dps.live/estaciontv/estaciontv.smil/playlist.m3u8",
    fuente: "https://www.estaciontv.cl/site/",
  },
  "estaciontv-m3u-2": {
    slug: "estaciontv-m3u-2",
    titleHtml: "Estacióntv 2",
    m3u8Url:
      "https://pantera1-100gb-cl-movistar.dps.live/estaciontv/estaciontv.smil/playlist.m3u8",
    fuente: "https://www.estaciontv.cl/site/",
  },
  "pinguino-tv": {
    slug: "pinguino-tv",
    titleHtml: "Pingüino TV",
    iframeSrc: "https://elpinguino.com/reproductor/",
    fuente: "https://elpinguino.com/reproductor/",
  },
  "pinguino-tv-m3u": {
    slug: "pinguino-tv-m3u",
    titleHtml: "Pingüino TV 2",
    m3u8Url: "https://streaming.elpinguino.com:5391/live/EP.smil/playlist.m3u8",
    fuente: "https://elpinguino.com/reproductor/",
  },
  "itv-patagonia": {
    slug: "itv-patagonia",
    titleHtml: "ITV Patagonia",
    m3u8Url: "https://rudo.video/live/itv?volume=0&mute=1",
    fuente: "https://www.itvpatagonia.com/",
  },
  "itv-patagonia-m3u": {
    slug: "itv-patagonia-m3u",
    titleHtml: "ITV Patagonia 2",
    m3u8Url: "https://unlimited1-cl-isp.dps.live/itv/itv.smil/playlist.m3u8",
    fuente: "https://www.itvpatagonia.com/",
  },
  ucv: {
    slug: "ucv",
    titleHtml: "UCV TV",
    iframeSrc: "https://rudo.video/live/ucvtv2?volume=0&mute=1",
    fuente: "https://pucvmultimedios.cl/senal-online-tv.php",
  },
  uatv: {
    slug: "uatv",
    titleHtml: "UATV",
    iframeSrc: "https://rudo.video/live/uatv?volume=0&mute=1",
    fuente: "https://uatv.cl/uatv-en-vivo/",
  },
  vtv: {
    slug: "vtv",
    titleHtml: "VTV",
    iframeSrc: "https://rudo.video/live/vtv?volume=0&mute=1",
    fuente: "http://canalvtv.cl/vtv/",
  },
  "canal-33": {
    slug: "canal-33",
    titleHtml: "Canal 33",
    iframeSrc:
      "https://streaminghd.cl/player.video/index.php?s=eduardo555/eduardo555",
    fuente: "http://www.canal33.cl/online.php",
  },
  "contivision-m3u": {
    slug: "contivision-m3u",
    titleHtml: "Contivision",
    m3u8Url:
      "https://unlimited2-cl.dps.live/contivision/contivision.smil/playlist.m3u8",
    fuente: "http://w.contivision.cl/cvn/envivo.php",
  },
  "tv-salud-m3u": {
    slug: "tv-salud-m3u",
    titleHtml: "TV Salud",
    m3u8Url:
      "https://srv3.zcast.com.br/mastermedia/mastermedia/tvsalud.cl.m3u8",
    fuente: "https://tvsalud.cl/",
  },

  // no funcionan:
  TVN: {
    slug: "TVN",
    titleHtml: "TVN",
    m3u8Url: "http://unlimited1-cl-isp.dps.live/tvn/tvn.smil/playlist.m3u8",
  },
  "TV CHILE": {
    slug: "TV CHILE",
    titleHtml: "TV CHILE",
    m3u8Url:
      "https://mdstrm.com/live-stream-playlist-v/533adcc949386ce765657d7c.m3u8",
  },
  "24H 1": {
    slug: "24H 1",
    titleHtml: "24H 1",
    m3u8Url:
      "https://mdstrm.com/live-stream-playlist-v/5346f5f2c1e6f5810b5b9df0.m3u8",
  },
  "24H 2": {
    slug: "24H 2",
    titleHtml: "24H 2",
    m3u8Url:
      "https://mdstrm.com/live-stream-playlist-v/5346f657c1e6f5810b5b9df3.m3u8",
  },
  "24H 4": {
    slug: "24H 4",
    titleHtml: "24H 4",
    m3u8Url:
      "https://mdstrm.com/live-stream-playlist-v/555c9a91eb4886825b07ee7b.m3u8",
  },
  Señal_Interna_24HTVN_1: {
    slug: "Señal_Interna_24HTVN_1",
    titleHtml:
      '<img style="height: 20px; width:auto:" src="imagenes/Logo_24HTVN.svg"></img>ﾠSEÑAL 1',
    codeHtml:
      '<div class="embed-responsive embed-responsive-16by9"> <iframe class="embed-responsive-item" src="/Monitores/SeñalInterna24H_1.html" frameborder="0"></iframe><div class="CAJATituloDePantallaPequeña2"><div class="TextoTitulosMonitor1">ㅤ24HORAS 1ㅤ</div></div></div>',
  },
  Señal_Interna_24HTVN_2: {
    slug: "Señal_Interna_24HTVN_2",
    titleHtml:
      '<img style="height: 20px; width:auto:" src="imagenes/Logo_24HTVN.svg"></img>ﾠSEÑAL 2',
    codeHtml:
      '<div class="embed-responsive embed-responsive-16by9"> <iframe class="embed-responsive-item" src="/Monitores/SeñalInterna24H_2.html" frameborder="0"></iframe><div class="CAJATituloDePantallaPequeña2"><div class="TextoTitulosMonitor1">ㅤ24HORAS 2ㅤ</div></div></div>',
  },
  Señal_Interna_24HTVN_4: {
    slug: "Señal_Interna_24HTVN_4",
    titleHtml:
      '<img style="height: 20px; width:auto:" src="imagenes/Logo_24HTVN.svg"></img>ﾠSEÑAL 4',
    codeHtml:
      '<div class="embed-responsive embed-responsive-16by9"> <iframe class="embed-responsive-item" src="/Monitores/SeñalInterna24H_4.html" frameborder="0"></iframe><div class="CAJATituloDePantallaPequeña2"><div class="TextoTitulosMonitor1">ㅤ24HORAS 4ㅤ</div></div></div>',
  },
  DocumentacionTVN: {
    slug: "DocumentacionTVN",
    name: "DOCUMENTACION TVN",
    titleHtml:
      '<img style="height: 20px; width:auto:" src="imagenes/Logo_24HTVN.svg"></img>ﾠ<img style="height: 15px; width:auto:" src="imagenes/Logo_TVN.svg"></img> DOC TVN',
    youtubeChannelId: "UCeKSSTjG4r-Qvcpjnwgo0VQ",
  },
  Señal_Interna_CNNCHILE_1: {
    slug: "Señal_Interna_CNNCHILE_1",
    titleHtml:
      '<img style="height: 20px; width:auto:" src="imagenes/Logo_CNNCHILE2.svg"></img>ﾠSEÑAL 1',
    codeHtml:
      '<div class="embed-responsive embed-responsive-16by9"> <iframe class="embed-responsive-item" src="/Monitores/SeñalInternaCNNCHILE_1.html" frameborder="0"></iframe><div class="CAJATituloDePantallaPequeña2"><div class="TextoTitulosMonitor1">ㅤCNNCHILE 1ㅤ</div></div></div>',
  },
};
