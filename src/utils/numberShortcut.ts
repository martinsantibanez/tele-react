// Maps a saved screen to its number key.
// Screens 1-9 use plain number keys; screens 10-18 use Shift + 1..9.
// Beyond 18 there is no shortcut.

const DIGITS_PER_ROW = 9;

export type NumberShortcut = {
  /** The digit key (1-9) that triggers this entry. */
  digit: number;
  /** Whether Shift must be held. */
  shift: boolean;
};

/** Returns the shortcut for an index, or undefined if none applies. */
export function getNumberShortcut(idx: number): NumberShortcut | undefined {
  if (idx < 0 || idx >= DIGITS_PER_ROW * 2) return undefined;
  return {
    digit: (idx % DIGITS_PER_ROW) + 1,
    shift: idx >= DIGITS_PER_ROW
  };
}

/** Human-readable label for an index, e.g. "1" or "⇧1". */
export function getNumberShortcutLabel(idx: number): string {
  const shortcut = getNumberShortcut(idx);
  if (!shortcut) return String(idx + 1);
  return `${shortcut.shift ? '⇧' : ''}${shortcut.digit}`;
}

/** Every hotkey the number shortcuts answer to, as one `useHotkeys` string. */
export const NUMBER_HOTKEYS = [
  '1,2,3,4,5,6,7,8,9',
  'shift+1,shift+2,shift+3,shift+4,shift+5,shift+6,shift+7,shift+8,shift+9'
].join(',');

/** Resolves a keyboard event to the index it targets, or undefined. */
export function getIndexFromKeyEvent(event: KeyboardEvent): number | undefined {
  const match = event.code.match(/^(?:Digit|Numpad)([1-9])$/);
  if (!match) return undefined;
  const digit = Number(match[1]);
  const base = event.shiftKey ? DIGITS_PER_ROW : 0;
  return base + digit - 1;
}
