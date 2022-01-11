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
};
