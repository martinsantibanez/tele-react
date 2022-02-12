import { FaBroadcastTower } from 'react-icons/fa';
import { SourcesMap } from '.';

const AntennaIcon = <FaBroadcastTower key="antenna" />;

export const especialesSources: SourcesMap = {
  MEDIABANCO_LIMPIA: {
    slug: 'MEDIABANCO_LIMPIA',
    titleIcons: [AntennaIcon],
    titleHtml: 'MEDIABANCO LIMPIA',
    m3u8Url:
      'https://unlimited1-cl-isp.dps.live/mediabanco/mediabanco.smil/playlist.m3u8'
  },
  MEDIABANCO2: {
    slug: 'MEDIABANCO2',
    titleIcons: [AntennaIcon],
    titleHtml: 'MEDIABANCO',
    m3u8Url:
      'https://unlimited1-cl-isp.dps.live/mediabanco2/mediabanco2.smil/playlist.m3u8'
  },
  MEDIABANCO_IFRAME: {
    slug: 'MEDIABANCO_IFRAME',
    titleIcons: [AntennaIcon],
    titleHtml: 'MEDIABANCO LIMPIA [iframe]',
    codeHtml:
      '<div class="embed-responsive embed-responsive-16by9"> <iframe class="embed-responsive-item" src="/Monitores/SeñalMEDIABANCO_IFRAME.html" frameborder="0"></iframe><div class="CAJATituloDePantallaPequeña2"><div class="TextoTitulosMonitor1">ㅤMEDIABANCOㅤ</div></div></div>'
  },
  MEDIABANCO2_IFRAME: {
    slug: 'MEDIABANCO2_IFRAME',
    titleIcons: [AntennaIcon],
    titleHtml: 'MEDIABANCO [iframe]',
    codeHtml:
      '<div class="embed-responsive embed-responsive-16by9"> <iframe class="embed-responsive-item" src="/Monitores/SeñalMEDIABANCO_IFRAME_2.html" frameborder="0"></iframe><div class="CAJATituloDePantallaPequeña2"><div class="TextoTitulosMonitor1">ㅤMEDIABANCOㅤ</div></div></div>'
  }
};
