export type SourceNode = {
  sourceSlug?: string;
  uuid?: string;
};

export type ColType = {
  size?: number;
  rows?: RowType[];
  node?: SourceNode;
};

export type RowType = { cols?: ColType[] };

export type LayoutType = ColType;
