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
    const top = offsets[activeIndex];
    const bottom = offsets[activeIndex + 1];
    if (top < el.scrollTop) el.scrollTop = top;
    else if (bottom > el.scrollTop + viewportHeight)
      el.scrollTop = bottom - viewportHeight;
  }, [activeIndex, offsets, items.length, viewportHeight]);

  const firstIndex = items.length
    ? Math.max(indexAtOffset(offsets, scrollTop) - overscan, 0)
    : 0;
  const lastIndex = items.length
    ? Math.min(
        indexAtOffset(offsets, scrollTop + viewportHeight) + overscan,
        items.length - 1
      )
    : -1;

  const indices: number[] = [];
  for (let index = firstIndex; index <= lastIndex; index++) indices.push(index);
  if (
    activeIndex !== undefined &&
    activeIndex >= 0 &&
    activeIndex < items.length &&
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
