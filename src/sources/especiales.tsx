import { FaBroadcastTower } from 'react-icons/fa';
import { SourcesMap } from '.';
import { ZappingSource } from '../components/Monitor/ZappingSource/ZappingSource';

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
    iframeSrc: 'https://rudo.video/live/mediabanco'
  },
  MEDIABANCO2_IFRAME: {
    slug: 'MEDIABANCO2_IFRAME',
    titleIcons: [AntennaIcon],
    titleHtml: 'MEDIABANCO [iframe]',
    iframeSrc: 'https://rudo.video/live/mediabanco2'
  }
};
