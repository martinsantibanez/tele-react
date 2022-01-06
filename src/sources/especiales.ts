import { SourcesMap } from ".";

export const especialesSources: SourcesMap = {
  PRESIDENCIA: {
    slug: "PRESIDENCIA",
    titleHtml:
      '<img style="height: 20px; width:auto:" src="imagenes/Logo_GOB.svg"></img>ﾠPRESIDENCIA',
    m3u8Url:
      "https://mdstrm.com/live-stream-playlist-v/5dc17f8944795108a2a52a49.m3u8",
  },
  MEDIABANCO_IFRAME: {
    slug: "MEDIABANCO_IFRAME",
    titleHtml:
      '<img style="height: 20px; width:auto:" src="imagenes/Icono_Antena2.svg"></img>ﾠMEDIABANCO LIMPIAﾠ<img style="height: 15px; width:auto:" src="imagenes/Icono_WebIframe.svg"></img>',
    codeHtml:
      '<div class="embed-responsive embed-responsive-16by9"> <iframe class="embed-responsive-item" src="/Monitores/SeñalMEDIABANCO_IFRAME.html" frameborder="0"></iframe><div class="CAJATituloDePantallaPequeña2"><div class="TextoTitulosMonitor1">ㅤMEDIABANCOㅤ</div></div></div>',
  },
  MEDIABANCO2_IFRAME: {
    slug: "MEDIABANCO2_IFRAME",
    titleHtml:
      '<img style="height: 20px; width:auto:" src="imagenes/Icono_Antena2.svg"></img>ﾠMEDIABANCOﾠ<img style="height: 15px; width:auto:" src="imagenes/Icono_WebIframe.svg"></img>',
    codeHtml:
      '<div class="embed-responsive embed-responsive-16by9"> <iframe class="embed-responsive-item" src="/Monitores/SeñalMEDIABANCO_IFRAME_2.html" frameborder="0"></iframe><div class="CAJATituloDePantallaPequeña2"><div class="TextoTitulosMonitor1">ㅤMEDIABANCOㅤ</div></div></div>',
  },
  MEDIABANCO: {
    slug: "MEDIABANCO",
    titleHtml:
      '<img style="height: 20px; width:auto:" src="imagenes/Icono_Antena2.svg"></img>ﾠMEDIABANCO LIMPIA',
    codeHtml:
      '<div class="embed-responsive embed-responsive-16by9"> <iframe class="embed-responsive-item" src="/Monitores/SeñalMEDIABANCO.html" frameborder="0"></iframe><div class="CAJATituloDePantallaPequeña2"><div class="TextoTitulosMonitor1">ㅤMEDIABANCOㅤ</div></div></div>',
  },
  MEDIABANCO2: {
    slug: "MEDIABANCO2",
    titleHtml:
      '<img style="height: 20px; width:auto:" src="imagenes/Icono_Antena2.svg"></img>ﾠMEDIABANCO',
    codeHtml:
      '<div class="embed-responsive embed-responsive-16by9"> <iframe class="embed-responsive-item" src="/Monitores/SeñalMEDIABANCO2.html" frameborder="0"></iframe><div class="CAJATituloDePantallaPequeña2"><div class="TextoTitulosMonitor1">ㅤMEDIABANCOㅤ</div></div></div>',
  },
  MEDIABANCO_YT: {
    slug: "MEDIABANCO_YT",
    titleHtml:
      '<img style="height: 15px; width:auto:" src="imagenes/Logo_YT.svg"></img>ﾠ<img style="height: 20px; width:auto:" src="imagenes/Icono_Antena2.svg">ﾠMEDIABANCOﾠ<img style="height: 15px; width:auto:" src="imagenes/Icono_SeñalOcasional.svg"></img>',
    codeHtml:
      '<div class="embed-responsive embed-responsive-16by9"> <iframe class="embed-responsive-item" src="/Monitores/Señal_MEDIABANCO_YT.html" frameborder="0" allowfullscreen></iframe><div class="CAJATituloDePantallaPequeña2"><div class="TextoTitulosMonitor1">ㅤMEDIABANCOㅤ</div></div></div>',
  },
  AGENCIA_UNO: {
    slug: "AGENCIA_UNO",
    titleHtml:
      '<img style="height: 20px; width:auto:" src="imagenes/Icono_Antena2.svg">ﾠAGENCIA UNO TV',
    codeHtml:
      '<div class="embed-responsive embed-responsive-16by9"> <iframe class="embed-responsive-item" src="/Monitores/Señal_AGENCIAUNOTV_2.html" frameborder="0" allowfullscreen></iframe><div class="CAJATituloDePantallaPequeña2"><div class="TextoTitulosMonitor1">ㅤAGENCIA UNOㅤ</div></div></div>',
  },
};
