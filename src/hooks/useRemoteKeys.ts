'use client';
import { useEffect, useRef } from 'react';

/** How long OK has to be held before it counts as a long press. */
export const LONG_PRESS_MS = 600;

/**
 * Elements that already answer Enter on their own: a press there belongs to
 * them, not to the screen behind.
 */
const ownsEnter = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable ||
    !!target.closest('input, textarea, select, button, a[href], iframe'));

/**
 * Enter as a remote's OK button: a tap and a hold are two different actions.
 * Listened to by hand rather than through `useHotkeys`, because telling the
 * two apart takes the key's release — and a held key repeats its keydown,
 * which must not fire either action again.
 */
export function useOkKey({
  onPress,
  onLongPress,
  enabled = true
}: {
  onPress: () => void;
  onLongPress?: () => void;
  enabled?: boolean;
}) {
  // Read through refs so the listeners stay put while the handlers change on
  // every render.
  const pressRef = useRef(onPress);
  pressRef.current = onPress;
  const longPressRef = useRef(onLongPress);
  longPressRef.current = onLongPress;

  useEffect(() => {
    if (!enabled) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    // Whether this press started here, so a release whose press went to a
    // button (or happened before the screen mounted) is left alone.
    let pressing = false;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Enter' || ownsEnter(event.target)) return;
      event.preventDefault();
      if (event.repeat || pressing) return;
      pressing = true;
      timer = setTimeout(() => {
        timer = undefined;
        longPressRef.current?.();
      }, LONG_PRESS_MS);
    };

    const onKeyUp = (event: KeyboardEvent) => {
      if (event.key !== 'Enter' || !pressing) return;
      pressing = false;
      // The timer already ran: this release ends a long press.
      if (!timer) return;
      clearTimeout(timer);
      timer = undefined;
      pressRef.current();
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [enabled]);
}

/**
 * Keys matched by their `key` name, for the ones `useHotkeys` has no name for —
 * a remote's ChannelUp and ChannelDown.
 */
export function useKeyNames(
  handlers: Record<string, () => void>,
  enabled = true
) {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    if (!enabled) return;
    const onKeyDown = (event: KeyboardEvent) => {
      const handler = handlersRef.current[event.key];
      if (!handler) return;
      const target = event.target;
      // PageUp and PageDown still scroll a text box.
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          !!target.closest('input, textarea, select'))
      )
        return;
      event.preventDefault();
      handler();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [enabled]);
}

/**
 * The tile an arrow lands on from `fromIdx`, judged by where the tiles sit on
 * the page rather than by their order: a layout's big screen has neighbours
 * on two sides that are nowhere near it in the list.
 */
export function neighbourScreen(
  container: HTMLElement,
  fromIdx: number,
  direction: 'up' | 'down' | 'left' | 'right'
): number | undefined {
  const rects = new Map<number, DOMRect>();
  // The reel marks its on-air player too, inside the tile; the tile comes
  // first in document order, and it is the one that sits in the layout.
  container.querySelectorAll<HTMLElement>('[data-screen-idx]').forEach(el => {
    const idx = Number(el.dataset.screenIdx);
    if (!Number.isNaN(idx) && !rects.has(idx))
      rects.set(idx, el.getBoundingClientRect());
  });
  const from = rects.get(fromIdx);
  if (!from) return undefined;

  const horizontal = direction === 'left' || direction === 'right';
  const sign = direction === 'right' || direction === 'down' ? 1 : -1;
  // Each rect as a span along the direction pressed and one across it.
  const along = (rect: DOMRect) =>
    horizontal ? [rect.left, rect.right] : [rect.top, rect.bottom];
  const across = (rect: DOMRect) =>
    horizontal ? [rect.top, rect.bottom] : [rect.left, rect.right];
  // Sub-pixel layout leaves neighbours a hair apart or a hair overlapping.
  const SLACK = 2;

  const [fromAlongStart, fromAlongEnd] = along(from);
  const [fromStart, fromEnd] = across(from);
  const fromAcross = (fromStart + fromEnd) / 2;
  let best: { idx: number; score: number } | undefined;

  rects.forEach((rect, idx) => {
    if (idx === fromIdx) return;
    const [alongStart, alongEnd] = along(rect);
    // Only tiles wholly past the edge being moved across.
    const distance =
      sign > 0 ? alongStart - fromAlongEnd : fromAlongStart - alongEnd;
    if (distance < -SLACK) return;
    const [start, end] = across(rect);
    // Tiles sharing a row (or a column) with this one always come first; a
    // tile that only touches it at a corner is not in its row.
    const overlap = Math.min(end, fromEnd) - Math.max(start, fromStart);
    const offset = Math.abs((start + end) / 2 - fromAcross);
    const score =
      (overlap > SLACK ? 0 : 1e6) + Math.max(distance, 0) + offset * 0.1;
    if (!best || score < best.score) best = { idx, score };
  });

  return best?.idx;
}
