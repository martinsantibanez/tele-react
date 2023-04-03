import React from 'react';
import { camarasSources } from './camaras';
import { chileSources } from './chile';
import { datosSources } from './datos';
import { espacioSources } from './espacio';
import { especialesSources } from './especiales';
import { internacionalSources } from './internacional';
import { musicaSources } from './musica';
import { placeHolderSources } from './placeholder';
import { radiosSources } from './radios';
import { regionesSources } from './regiones';
import { relojesSources } from './relojes';
import { tvNacionalSources, tvNacionalYoutubeSources } from './tvNacional';

export enum SourceInputType {
  m3u8 = 'm3u8',
  iframe = 'iframe',
  html = 'html',
  component = 'component'
}

export interface SourceInput {
  codeHtml?: string;
  iframeSrc?: string;
  m3u8Url?: string;
  component?: () => React.ReactElement;
  youtubeChannelId?: string;
  youtubeVideoId?: string;
  youtubeChatVideoId?: string;
  twitterAcount?: string;
  twitchAccount?: string;
  zappingChannel?: number;
}

export interface SourceType extends SourceInput {
  slug: string;
  name?: string;
  flag?: string;
  titleHtml?: string;
  titleIcons?: React.ReactNode[];

  // TODO
  // inputs?: SourceInput[];

  fuente?: string;
}

export type SourcesMap = {
  [sourceId: string]: SourceType;
};

export interface SourceGroup {
  name: string;
  sources: SourcesMap;
}

export const sourcesCategories: SourceGroup[] = [
  {
    name: 'TV Nacional',
    sources: tvNacionalSources
  },
  {
    name: 'TV Nacional YouTube',
    sources: tvNacionalYoutubeSources
  },
  {
    name: 'Regiones',
    sources: regionesSources
  },
  {
    name: 'Radios',
    sources: radiosSources
  },
  {
    name: 'Musica 24/7',
    sources: musicaSources
  },
  {
    name: 'Camaras',
    sources: camarasSources
  },
  {
    name: 'Instituciones Chile',
    sources: chileSources
  },
  {
    name: 'TV Internacional',
    sources: internacionalSources
  },
  {
    name: 'Espacio',
    sources: espacioSources
  },
  {
    name: 'Relojes',
    sources: relojesSources
  },
  {
    name: 'Vacio',
    sources: placeHolderSources
  },
  {
    name: 'Datos',
    sources: datosSources
  }
];

if (
  typeof window !== 'undefined' &&
  window.localStorage.getItem('show_all') === 'true'
) {
  sourcesCategories.push({
    name: 'Especiales',
    sources: especialesSources
  });
}
export function getSource(slug: string) {
  return sourcesCategories
    .flatMap(category => Object.values(category.sources))
    .find(src => src.slug === slug);
}
