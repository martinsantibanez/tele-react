import React from "react";
import { camarasSources } from "./camaras";
import { especialesSources } from "./especiales";
import { otrasSources } from "./otras";
import { radiosSources } from "./radios";
import { aysenSources, regionesSources } from "./regiones";
import { relojesSources } from "./relojes";
import { tvNacionalSources } from "./tvNacional";
import { twitchSources } from "./twitch";

export interface Source {
  slug: string;
  titleHtml: string;
  codeHtml?: string;
  component?: React.ReactNode;
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
