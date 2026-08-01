import { ColValues, LayoutType, RowValues } from '../../types/Monitor';

// The board every layout is drawn on, the same one `Layout` renders into.
export const GRID_COLS = 12;
export const GRID_ROWS = 9;
export const GRID_CELLS = GRID_COLS * GRID_ROWS;

export type PlacedTile = {
  idx: number;
  col: number;
  row: number;
  cols: number;
  rows: number;
};

export type Placement = {
  tiles: PlacedTile[];
  /** How many rows the tiles actually take, implicit ones included. */
  rowsUsed: number;
  /** Cells covered inside the 12x9 board. */
  filled: number;
  /** Cells of the board nothing covers — the holes the picture shows through. */
  empty: number;
  /** Tiles that spilled past row 9, where the monitor has nothing to show. */
  overflowing: number[];
};

/**
 * Where the tiles land. `Layout` gives every tile a span and no position, so
 * the browser packs them itself; this repeats that packing (CSS grid's sparse
 * auto-placement, row first) so the editor can say what the layout covers and
 * what it leaves behind before anything is rendered.
 */
export function placeLayout(layout: LayoutType): Placement {
  const occupied: boolean[][] = [];
  const rowAt = (row: number) => {
    while (occupied.length <= row) occupied.push(new Array(GRID_COLS).fill(false));
    return occupied[row];
  };
  const fits = (row: number, col: number, cols: number, rows: number) => {
    for (let r = row; r < row + rows; r++) {
      const cells = rowAt(r);
      for (let c = col; c < col + cols; c++) if (cells[c]) return false;
    }
    return true;
  };

  const tiles: PlacedTile[] = [];
  const overflowing: number[] = [];
  let cursorRow = 0;
  let cursorCol = 0;

  layout.forEach((tile, idx) => {
    const cols = Math.min(Math.max(tile.cols ?? 1, 1), GRID_COLS);
    const rows = Math.max(tile.rows ?? 1, 1);

    // Walk forward — never back, that is what makes the packing sparse — until
    // the tile finds a run of free cells wide enough for it.
    for (;;) {
      if (cursorCol + cols > GRID_COLS) {
        cursorRow += 1;
        cursorCol = 0;
        continue;
      }
      if (fits(cursorRow, cursorCol, cols, rows)) break;
      cursorCol += 1;
    }

    for (let r = cursorRow; r < cursorRow + rows; r++) {
      const cells = rowAt(r);
      for (let c = cursorCol; c < cursorCol + cols; c++) cells[c] = true;
    }

    tiles.push({ idx, col: cursorCol, row: cursorRow, cols, rows });
    if (cursorRow + rows > GRID_ROWS) overflowing.push(idx);
    cursorCol += cols;
  });

  let filled = 0;
  for (let r = 0; r < Math.min(occupied.length, GRID_ROWS); r++)
    for (let c = 0; c < GRID_COLS; c++) if (occupied[r][c]) filled += 1;

  const rowsUsed = tiles.reduce((max, tile) => Math.max(max, tile.row + tile.rows), 0);

  return {
    tiles,
    rowsUsed,
    filled,
    empty: GRID_CELLS - filled,
    overflowing
  };
}

/** A layout is sound when it tiles the board exactly: no holes, no spill. */
export function isComplete(placement: Placement) {
  return placement.empty === 0 && placement.overflowing.length === 0;
}

export const clampCols = (value: number) =>
  Math.min(Math.max(Math.round(value), 1), GRID_COLS) as ColValues;

export const clampRows = (value: number) =>
  Math.min(Math.max(Math.round(value), 1), GRID_ROWS) as RowValues;

/** The layout as it would be written into `predefinedLayouts.ts`. */
export function toSourceSnippet(name: string, layout: LayoutType) {
  const camel = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+(.)?/g, (_, chr: string | undefined) =>
      chr ? chr.toUpperCase() : ''
    );
  const identifier = `${camel || 'custom'}Layout`;
  const tiles = layout
    .map(tile => `  {\n    cols: ${tile.cols},\n    rows: ${tile.rows}\n  }`)
    .join(',\n');
  return `export const ${identifier}: LayoutType = [\n${tiles}\n];\n`;
}
