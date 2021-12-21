import {
  aysenSources,
  camarasSources,
  especialesSources,
  otrasSources,
  radiosSources,
  regionesSources,
  relojesSources,
  tvNacionalSources,
} from "./all";

export interface Source {
  slug: string;
  titleHtml: string;
  codeHtml: string;
}

export type SourcesMap = {
  [sourceId: string]: Source;
};
export interface SourceGroup {
  name: string;
  sources: SourcesMap;
}

export const sources: SourceGroup[] = [
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
