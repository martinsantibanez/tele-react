import React from "react";
import { camarasSources } from "./camaras";
import { especialesSources } from "./especiales";
import { otrasSources } from "./otras";
import { radiosSources } from "./radios";
import { aysenSources, regionesSources } from "./regiones";
import { relojesSources } from "./relojes";
import { tvNacionalSources, tvNacionalYoutubeSources } from "./tvNacional";
import { tvNacionalDosSources } from "./tvNacionalDos";
import { twitchSources } from "./twitch";

export enum SourceType {
  m3u8 = "m3u8",
  iframe = "iframe",
  html = "html",
  component = "component",
}

export interface Source {
  slug: string;
  name?: string;
  titleHtml: string;
  titleIcons?: React.ReactNode[];
  listTitle?: string;
  codeHtml?: string;
  iframeSrc?: string;
  m3u8Url?: string;
  component?: React.ReactElement;
  youtubeId?: string;

  fuente?: string;
}

export type SourcesMap = {
  [sourceId: string]: Source;
};

export interface SourceGroup {
  name: string;
  sources: SourcesMap;
}

export const sourcesCategories: SourceGroup[] = [
  {
    name: "TV Nacional",
    sources: tvNacionalSources,
  },
  {
    name: "TV Nacional YT",
    sources: tvNacionalYoutubeSources,
  },
  {
    name: "TV Nacional - 2",
    sources: tvNacionalDosSources,
  },
  {
    name: "Especiales",
    sources: especialesSources,
  },
  {
    name: "Radios",
    sources: radiosSources,
  },
  {
    name: "Camaras",
    sources: camarasSources,
  },
  {
    name: "Twitch",
    sources: twitchSources,
  },
  {
    name: "Uncategorized",
    sources: otrasSources,
  },
  {
    name: "Regiones",
    sources: regionesSources,
  },
  {
    name: "Regiones | Aysen",
    sources: aysenSources,
  },
  {
    name: "Relojes",
    sources: relojesSources,
  },
];

export function getSource(slug: string) {
  return sourcesCategories
    .flatMap((category) => Object.values(category.sources))
    .find((src) => src.slug === slug);
}
