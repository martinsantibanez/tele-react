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

    const fireLongPress = () => {
      clearTimeout(timer);
      timer = undefined;
      longPressRef.current?.();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Enter' || ownsEnter(event.target)) return;
      event.preventDefault();
      if (pressing) {
        // A key only starts repeating once it has been held for the system's
        // long-press time, so the first repeat is a long press already. The
        // TV's WebView does not flag its repeats, which is why this does not
        // wait for `event.repeat`.
        if (timer) fireLongPress();
        return;
      }
      if (event.repeat) return;
      pressing = true;
      timer = setTimeout(fireLongPress, LONG_PRESS_MS);
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

/** The keys a remote sends whose `code` is spelled the same as their `key`. */
const REMOTE_CODES = new Set([
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'Enter',
  'Escape',
  'PageUp',
  'PageDown'
]);

/**
 * The TV's WebView hands the page its remote keys with an empty `code`, and
 * `useHotkeys` matches on the code: without this none of the arrows would
 * reach the app. Each such event is sent on again as a copy with the code
 * filled in. If the app takes the copy, the original is cancelled with it —
 * which also keeps the WebView from moving the focus on its own; if nothing
 * does, the original goes on, so a plain form still answers the D-pad.
 *
 * Returns the function that takes it off again.
 */
export function fillRemoteKeyCodes() {
  const relay = (event: KeyboardEvent) => {
    if (event.code || !REMOTE_CODES.has(event.key)) return;
    const copy = new KeyboardEvent(event.type, {
      key: event.key,
      code: event.key,
      keyCode: event.keyCode,
      which: event.which,
      repeat: event.repeat,
      altKey: event.altKey,
      ctrlKey: event.ctrlKey,
      metaKey: event.metaKey,
      shiftKey: event.shiftKey,
      bubbles: true,
      cancelable: true
    } as KeyboardEventInit);
    event.stopImmediatePropagation();
    const target = event.target instanceof EventTarget ? event.target : window;
    if (!target.dispatchEvent(copy)) event.preventDefault();
  };
  window.addEventListener('keydown', relay, true);
  window.addEventListener('keyup', relay, true);
  return () => {
    window.removeEventListener('keydown', relay, true);
    window.removeEventListener('keyup', relay, true);
  };
}
