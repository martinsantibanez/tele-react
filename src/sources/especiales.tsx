import { SourcesMap } from ".";
import { FaBroadcastTower, FaYoutube } from "react-icons/fa";

const AntennaIcon = <FaBroadcastTower key="antenna" />;

export const especialesSources: SourcesMap = {
  PRESIDENCIA: {
    slug: "PRESIDENCIA",
    titleHtml:
      '<img style="height: 20px; width:auto:" src="imagenes/Logo_GOB.svg"></img>ﾠPRESIDENCIA',
    m3u8Url:
      "https://mdstrm.com/live-stream-playlist-v/5dc17f8944795108a2a52a49.m3u8",
  },
  MEDIABANCO_LIMPIA: {
    slug: "MEDIABANCO_LIMPIA",
    titleIcons: [AntennaIcon],
    titleHtml: "MEDIABANCO LIMPIA",
    m3u8Url:
      "https://unlimited1-cl-isp.dps.live/mediabanco/mediabanco.smil/playlist.m3u8",
    // codeHtml:
    //   '<div class="embed-responsive embed-responsive-16by9"> <iframe class="embed-responsive-item" src="/Monitores/SeñalMEDIABANCO.html" frameborder="0"></iframe><div class="CAJATituloDePantallaPequeña2"><div class="TextoTitulosMonitor1">ㅤMEDIABANCOㅤ</div></div></div>',
  },
  MEDIABANCO2: {
    slug: "MEDIABANCO2",
    titleIcons: [AntennaIcon],
    titleHtml: "MEDIABANCO",
    m3u8Url:
      "https://unlimited1-cl-isp.dps.live/mediabanco2/mediabanco2.smil/playlist.m3u8",
  },
  MEDIABANCO_IFRAME: {
    slug: "MEDIABANCO_IFRAME",
    titleIcons: [AntennaIcon],
    titleHtml:
      'ﾠMEDIABANCO LIMPIAﾠ<img style="height: 15px; width:auto:" src="imagenes/Icono_WebIframe.svg"></img>',
    codeHtml:
      '<div class="embed-responsive embed-responsive-16by9"> <iframe class="embed-responsive-item" src="/Monitores/SeñalMEDIABANCO_IFRAME.html" frameborder="0"></iframe><div class="CAJATituloDePantallaPequeña2"><div class="TextoTitulosMonitor1">ㅤMEDIABANCOㅤ</div></div></div>',
  },
  MEDIABANCO2_IFRAME: {
    slug: "MEDIABANCO2_IFRAME",
    titleIcons: [AntennaIcon],
    titleHtml:
      'ﾠMEDIABANCOﾠ<img style="height: 15px; width:auto:" src="imagenes/Icono_WebIframe.svg"></img>',
    codeHtml:
      '<div class="embed-responsive embed-responsive-16by9"> <iframe class="embed-responsive-item" src="/Monitores/SeñalMEDIABANCO_IFRAME_2.html" frameborder="0"></iframe><div class="CAJATituloDePantallaPequeña2"><div class="TextoTitulosMonitor1">ㅤMEDIABANCOㅤ</div></div></div>',
  },
};
