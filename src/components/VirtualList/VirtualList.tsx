import { ReactNode, useEffect, useLayoutEffect, useRef, useState } from 'react';

type Props<T> = {
  items: T[];
  /** Every row is this tall, which is what keeps the maths cheap. */
  itemHeight: number;
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
    const top = activeIndex * itemHeight;
    const bottom = top + itemHeight;
    if (top < el.scrollTop) el.scrollTop = top;
    else if (bottom > el.scrollTop + viewportHeight)
      el.scrollTop = bottom - viewportHeight;
  }, [activeIndex, itemHeight, viewportHeight]);

  const firstIndex = Math.max(Math.floor(scrollTop / itemHeight) - overscan, 0);
  const lastIndex = Math.min(
    firstIndex + Math.ceil(viewportHeight / itemHeight) + overscan * 2,
    items.length - 1
  );

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
      <div
        className="relative w-full"
        style={{ height: items.length * itemHeight }}
      >
        {indices.map(index => (
          <div
            key={getItemKey?.(items[index], index) ?? index}
            className="absolute inset-x-0"
            style={{ top: index * itemHeight, height: itemHeight }}
          >
            {renderItem(items[index], index)}
          </div>
        ))}
      </div>
    </div>
  );
}
