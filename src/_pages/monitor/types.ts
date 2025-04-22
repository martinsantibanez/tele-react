import { ZappingConfig } from '../../hooks/useZappingConfig';
import { SourceType } from '../../sources';

export type SourceNode = {
  sourceSlug?: string;
  uuid?: string;
  muted?: boolean;
};

export type ColType = {
  size?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  rows?: RowType[];
  node?: { idx: number };
};

export type RowType = { cols?: ColType[] };

export type ColValues =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16;
export type RowValues = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type LayoutType = {
  cols?: ColValues;
  rows?: RowValues;
  colStart?: ColValues;
}[];

export enum DisplayMode {
  Layout = 'Layout',
  Grid = 'Grid'
}

export type GridSize = 1 | 2 | 3 | 4;

export type GridType = {
  size: GridSize;
};

export type DisplayConfig = {
  mode: DisplayMode;
  grid: GridType;
  layout: LayoutType;
};

export type ScreenType = {
  config: DisplayConfig;
  sources: SourceNode[];
  zappingConfig?: ZappingConfig;
  customSources?: SourceType[];
};
