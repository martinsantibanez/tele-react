export type SourceNode = {
  sourceSlug: string;
  uuid?: string;
};

export type Col = {
  size?: number;
  rows?: Row[];
  node?: SourceNode;
};

export type Row = { cols?: Col[] };

export type Layout = Col;
