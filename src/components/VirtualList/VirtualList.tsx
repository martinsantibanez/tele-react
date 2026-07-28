import {
  ReactNode,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from 'react';

type Props<T> = {
  items: T[];
  /**
   * Height of a row, either the one every row shares or, for lists that mix
   * headers into the rows, a per-item measure.
   */
  itemHeight: number | ((item: T, index: number) => number);
  renderItem: (item: T, index: number) => ReactNode;
  /**
   * Row that keyboard navigation is on: it's kept scrolled into view and is
   * always rendered, so callers can hold a ref to it even when it's off-screen.
   */
  activeIndex?: number;
  /** Rows rendered above and below the viewport to absorb fast scrolling. */
  overscan?: number;
  /**
   * Marks the rows that head a section. The last header at or above the top of
   * the viewport is pinned there, until the next one shoulders it out, so the
   * section a row belongs to is always named on screen. A pinned header is
   * rendered in the pinned slot instead of in the list, never in both.
   */
  isStickyHeader?: (item: T, index: number) => boolean;
  getItemKey?: (item: T, index: number) => string;
  className?: string;
};

/** Largest index whose row starts at or before `offset`. */
function indexAtOffset(offsets: number[], offset: number) {
  let low = 0;
  let high = offsets.length - 2;
  while (low < high) {
    const mid = Math.ceil((low + high) / 2);
    if (offsets[mid] <= offset) low = mid;
    else high = mid - 1;
  }
  return low;
}

/**
 * Scroller that only mounts the rows near the viewport, so a catalogue of
 * hundreds of channels costs the same as a screenful of them. Rows are
 * absolutely positioned inside a spacer of the full list height, which keeps
 * the native scrollbar (and touch scrolling) honest.
 */
export function VirtualList<T>({
  items,
  itemHeight,
  renderItem,
  activeIndex,
  overscan = 4,
  getItemKey,
  isStickyHeader,
  className
}: Props<T>) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);

  // Running row tops, one entry longer than `items` so the last one doubles as
  // the total height. Everything below is index arithmetic on this.
  const offsets = useMemo(() => {
    const result = [0];
    items.forEach((item, index) => {
      const height =
        typeof itemHeight === 'function' ? itemHeight(item, index) : itemHeight;
      result.push(result[index] + height);
    });
    return result;
  }, [items, itemHeight]);
  const totalHeight = offsets[items.length];

  const rowHeight = (index: number) => offsets[index + 1] - offsets[index];

  /** Last header at or before `index`, or -1 when no header precedes it. */
  const headerAtOrBefore = (index: number) => {
    if (!isStickyHeader) return -1;
    for (let candidate = index; candidate >= 0; candidate--)
      if (isStickyHeader(items[candidate], candidate)) return candidate;
    return -1;
  };

  // A row scrolled flush with the top of the viewport would end up under the
  // pinned header, so the list stops short of it by the header's height.
  const activeHeader =
    activeIndex !== undefined && activeIndex > 0
      ? headerAtOrBefore(activeIndex - 1)
      : -1;
  const activeHeaderInset = activeHeader >= 0 ? rowHeight(activeHeader) : 0;

  useLayoutEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setViewportHeight(el.clientHeight);
    const observer = new ResizeObserver(([entry]) =>
      setViewportHeight(entry.contentRect.height)
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // The selection can move to a row that isn't mounted, so the scroller
  // follows the index rather than the element.
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || !viewportHeight) return;
    if (activeIndex === undefined || activeIndex < 0) return;
    if (activeIndex >= items.length) return;
    const top = offsets[activeIndex] - activeHeaderInset;
    const bottom = offsets[activeIndex + 1];
    if (top < el.scrollTop) el.scrollTop = Math.max(top, 0);
    else if (bottom > el.scrollTop + viewportHeight)
      el.scrollTop = bottom - viewportHeight;
  }, [
    activeIndex,
    activeHeaderInset,
    offsets,
    items.length,
    viewportHeight
  ]);

  const firstIndex = items.length
    ? Math.max(indexAtOffset(offsets, scrollTop) - overscan, 0)
    : 0;
  const lastIndex = items.length
    ? Math.min(
        indexAtOffset(offsets, scrollTop + viewportHeight) + overscan,
        items.length - 1
      )
    : -1;

  // The header covering the top of the viewport. Its natural place is at or
  // above that top edge, so pinning it never moves it out from under the eye.
  const stickyIndex = items.length
    ? headerAtOrBefore(indexAtOffset(offsets, scrollTop))
    : -1;
  const stickyHeight = stickyIndex >= 0 ? rowHeight(stickyIndex) : 0;
  // Once the next header reaches the pinned one it shoulders it off the top.
  let stickyShift = 0;
  if (isStickyHeader && stickyIndex >= 0)
    for (let index = stickyIndex + 1; index < items.length; index++) {
      if (!isStickyHeader(items[index], index)) continue;
      stickyShift = Math.min(offsets[index] - scrollTop - stickyHeight, 0);
      break;
    }

  // The pinned header is left out here: it is already on screen, in the slot
  // above, and drawing it twice would double it up in the reading order too.
  const indices: number[] = [];
  for (let index = firstIndex; index <= lastIndex; index++)
    if (index !== stickyIndex) indices.push(index);
  if (
    activeIndex !== undefined &&
    activeIndex >= 0 &&
    activeIndex < items.length &&
    activeIndex !== stickyIndex &&
    (activeIndex < firstIndex || activeIndex > lastIndex)
  )
    indices.push(activeIndex);

  return (
    <div
      ref={scrollerRef}
      onScroll={e => setScrollTop(e.currentTarget.scrollTop)}
      className={`overflow-y-auto overscroll-contain touch-pan-y ${
        className ?? ''
      }`}
    >
      {stickyIndex >= 0 && (
        // Zero-height so the rows below keep their offsets, with the header
        // spilling out of it: that leaves the browser to do the sticking.
        <div className="sticky top-0 z-10 h-0">
          <div
            style={{
              height: stickyHeight,
              transform: stickyShift ? `translateY(${stickyShift}px)` : undefined
            }}
          >
            {renderItem(items[stickyIndex], stickyIndex)}
          </div>
        </div>
      )}
      <div className="relative w-full" style={{ height: totalHeight }}>
        {indices.map(index => (
          <div
            key={getItemKey?.(items[index], index) ?? index}
            className="absolute inset-x-0"
            style={{
              top: offsets[index],
              height: offsets[index + 1] - offsets[index]
            }}
          >
            {renderItem(items[index], index)}
          </div>
        ))}
      </div>
    </div>
  );
}
