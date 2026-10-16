/** A tile's place on the wall, in percent of it. */
export type TileRect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

/** How much of the wall's height the parked tiles share. */
const PARKED_STRIP = 18;
/** The wall and the pictures on it are both 16:9. */
const ASPECT = 16 / 9;

/** The column count that gives each of `count` pictures the most room. */
const bestColumns = (count: number, height: number) => {
  let best = 1;
  let bestWidth = 0;
  for (let cols = 1; cols <= count; cols++) {
    const rows = Math.ceil(count / cols);
    const tileWidth = (100 * ASPECT) / cols;
    const tileHeight = height / rows;
    const pictureWidth = Math.min(tileWidth, tileHeight * ASPECT);
    if (pictureWidth > bestWidth) {
      best = cols;
      bestWidth = pictureWidth;
    }
  }
  return best;
};

/**
 * Where each tile goes once some are parked (see `useDecodeSlot`): the ones
 * playing share the wall, the parked ones line up small along the bottom.
 * Nothing parked, nothing to change: undefined, and the wall keeps its own
 * layout.
 */
export const parkedWallRects = (
  screens: number[],
  parked: ReadonlySet<number>
): Map<number, TileRect> | undefined => {
  const parkedScreens = screens.filter(idx => parked.has(idx));
  if (!parkedScreens.length) return undefined;
  const live = screens.filter(idx => !parked.has(idx));
  const mainHeight = live.length ? 100 - PARKED_STRIP : 0;
  const rects = new Map<number, TileRect>();

  const cols = bestColumns(live.length, mainHeight);
  const rows = Math.ceil(live.length / cols);
  // A last row left short is centred, rather than leaving a hole at its end.
  const lastRowStart = (rows - 1) * cols;
  const lastRowOffset = ((cols - (live.length - lastRowStart)) * 50) / cols;
  live.forEach((idx, n) => {
    rects.set(idx, {
      left: ((n % cols) * 100) / cols + (n >= lastRowStart ? lastRowOffset : 0),
      top: (Math.floor(n / cols) * mainHeight) / rows,
      width: 100 / cols,
      height: mainHeight / rows
    });
  });
  parkedScreens.forEach((idx, n) => {
    rects.set(idx, {
      left: (n * 100) / parkedScreens.length,
      top: mainHeight,
      width: 100 / parkedScreens.length,
      height: 100 - mainHeight
    });
  });
  return rects;
};

export const rectStyle = (rect: TileRect) =>
  ({
    position: 'absolute',
    left: `${rect.left}%`,
    top: `${rect.top}%`,
    width: `${rect.width}%`,
    height: `${rect.height}%`
  }) as const;
