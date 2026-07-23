// Maps a source index to its keyboard shortcut.
// Sources 1-9 use plain number keys; sources 10-18 use Shift + 1..9.
// Beyond 18 there is no shortcut.

const DIGITS_PER_ROW = 9;

export type SourceShortcut = {
  /** The digit key (1-9) that triggers this source. */
  digit: number;
  /** Whether Shift must be held. */
  shift: boolean;
};

/** Returns the shortcut for a source index, or undefined if none applies. */
export function getSourceShortcut(idx: number): SourceShortcut | undefined {
  if (idx < 0 || idx >= DIGITS_PER_ROW * 2) return undefined;
  return {
    digit: (idx % DIGITS_PER_ROW) + 1,
    shift: idx >= DIGITS_PER_ROW
  };
}

/** Human-readable label for a source index, e.g. "1" or "⇧1". */
export function getSourceShortcutLabel(idx: number): string {
  const shortcut = getSourceShortcut(idx);
  if (!shortcut) return String(idx + 1);
  return `${shortcut.shift ? '⇧' : ''}${shortcut.digit}`;
}

/** Resolves a keyboard event to the source index it targets, or undefined. */
export function getIndexFromKeyEvent(event: KeyboardEvent): number | undefined {
  const match = event.code.match(/^(?:Digit|Numpad)([1-9])$/);
  if (!match) return undefined;
  const digit = Number(match[1]);
  const base = event.shiftKey ? DIGITS_PER_ROW : 0;
  return base + digit - 1;
}
