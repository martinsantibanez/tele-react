import { SourceType } from '../sources';

export type SourceNode = {
  sourceSlug?: string;
  /**
   * The source itself, for everything outside the built-in table: the TV feed,
   * Zapping, YouTube lives, Twitch. Kept on the node so a screen carries its
   * channels wherever it goes — saved, shared, promoted. It is a snapshot, not
   * the last word: the live catalogues still win by slug when they hold the
   * same channel, so a stale stream url re-points itself. See
   * `useResolveSource`.
   */
  source?: SourceType;
  uuid?: string;
  muted?: boolean;
  activeSignal?: string;
};

export type ColType = {
  size?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  rows?: RowType[];
  node?: { idx: number };
};

export type RowType = { cols?: ColType[] };

export type ColValues =
  1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16;
export type RowValues = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type LayoutType = {
  cols?: ColValues;
  rows?: RowValues;
  colStart?: ColValues;
}[];

export enum DisplayMode {
  Layout = 'Layout',
  Grid = 'Grid',
  // Auto-tiles every currently-live YouTube subscription; the tiles are derived
  // from the live channels, not from the saved grid, and the count follows how
  // many channels are live right now.
  Youtube = 'Youtube',
  // One channel on air, with the one before and the one after it named above
  // and below. What is being walked is a whole catalogue — the picker's active
  // tab — rather than the screen's own sources, of which it keeps exactly one:
  // whatever is playing. See `ChannelReel`.
  Zapping = 'Zapping'
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
};
