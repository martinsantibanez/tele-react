export type SourceNode = {
  sourceSlug?: string;
  uuid?: string;
};

export type ColType = {
  size?: number;
  rows?: RowType[];
  node?: { idx: number };
};

export type RowType = { cols?: ColType[] };

export type LayoutType = ColType;

export enum DisplayMode {
  Layout = 'Layout',
  Grid = 'Grid'
}

export type GridType = {
  size: number;
};

export type DisplayConfig = {
  mode: DisplayMode;
  grid: GridType;
  layout: LayoutType;
};
