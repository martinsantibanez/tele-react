import { SourcesMap } from '.';

export const datosSources: SourcesMap = {
  EARLY_EST_DETEC: {
    slug: 'EARLY_EST_DETEC',
    titleHtml:
      '<img style="height: 20px; width:auto:" src="imagenes/Logo_ALOMAX.svg"></img>ﾠDETECTOR SISMOS',
    iframeSrc:
      'http://alomax.free.fr/projects/early-est/warning_image_only_alert.html'
  },
  EARLY_EST_SIS: {
    slug: 'EARLY_EST_SIS',
    titleHtml:
      '<img style="height: 20px; width:auto:" src="imagenes/Logo_ALOMAX.svg"></img>ﾠULTIMOS SISMOS',
    iframeSrc: 'http://alomax.free.fr/projects/early-est/hypolist.hgz'
  },
  'corona-pagina': {
    slug: 'corona-pagina',
    name: '🦠 COVID-19 Dashboard',
    iframeSrc:
      'https://gisanddata.maps.arcgis.com/apps/opsdashboard/index.html#/bda7594740fd40299423467b48e9ecf6',
    fuente:
      'https://gisanddata.maps.arcgis.com/apps/opsdashboard/index.html#/bda7594740fd40299423467b48e9ecf6'
  },
  'corona-live': {
    slug: 'corona-live',
    name: '🦠 COVID-19 Live',
    youtubeVideoId: 'NMre6IAAAiU',
    fuente: 'https://www.youtube.com/channel/UCDGiCfCZIV5phsoGiPwIcyQ'
  },
  'corona-pag-chile': {
    slug: 'corona-pag-chile',
    name: '🦠 COVID-19 Chile',
    iframeSrc: 'https://bing.com/covid/local/chile',
    fuente: 'https://bing.com/covid/local/chile'
  }
};
