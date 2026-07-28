import React from 'react';
import { camarasSources } from './camaras';
import { chileSources } from './chile';
import { datosSources } from './datos';
import { espacioSources } from './espacio';
import { especialesSources } from './especiales';
import { internacionalSources } from './internacional';
import { musicaSources } from './musica';
import { placeHolderSources } from './placeholder';
import { pruebasSources } from './pruebas';
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
  component?: () => React.ReactElement<any>;
  youtubeChannelId?: string;
  youtubeVideoId?: string;
  youtubeChatVideoId?: string;
  twitterAcount?: string;
  twitchAccount?: string;
  zappingChannel?: string;
}

export type SignalType = 'iframe' | 'm3u8' | 'youtube' | 'twitch' | 'youtubeChannel';

export interface SourceType extends SourceInput {
  slug: string;
  name?: string;
  flag?: string;
  titleHtml?: string;
  titleIcons?: React.ReactNode[];
  imageUrl?: string;
  /**
   * The channel's own mark, for the badge each tile shows. Only needed when
   * `imageUrl` is something else — YouTube lives put the video thumbnail there,
   * and a still of the stream is not a logo.
   */
  logoUrl?: string;
  favourite?: boolean;

  inputs?: SourceInput[];

  fuente?: string;
}

const signalTypeField: Record<SignalType, keyof SourceInput> = {
  iframe: 'iframeSrc',
  m3u8: 'm3u8Url',
  youtube: 'youtubeVideoId',
  youtubeChannel: 'youtubeChannelId',
  twitch: 'twitchAccount'
};

export interface Signal {
  type: SignalType;
  /** Position among the source's inputs of this type; 0 is the primary. */
  index: number;
  /** Stable id, so a grid node can point at this signal across reloads. */
  key: string;
  input: SourceInput;
}

/** The primary of each type keeps the bare type as its key. */
export function signalKey(type: SignalType, index: number) {
  return index ? `${type}:${index}` : type;
}

export function getAvailableSignals(source: SourceType): Signal[] {
  const inputs: SourceInput[] = [source, ...(source.inputs ?? [])];
  return (Object.keys(signalTypeField) as SignalType[]).flatMap(type =>
    inputs
      .filter(input => !!input[signalTypeField[type]])
      .map((input, index) => ({
        type,
        index,
        key: signalKey(type, index),
        input
      }))
  );
}

export function findSignal(source: SourceType, key: string) {
  return getAvailableSignals(source).find(signal => signal.key === key);
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
  },
  {
    name: 'Especiales',
    sources: especialesSources
  },
  {
    name: 'Pruebas',
    sources: pruebasSources
  }
];

export function getSource(slug: string) {
  return sourcesCategories
    .flatMap(category => Object.values(category.sources))
    .find(src => src.slug === slug);
}
