'use client';
import { Plus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import {
  useActiveScreenIndex,
  useNewSavedScreen,
  useSavedScreens
} from '../../hooks/useSavedScreens';
import { screenLabel } from '../Monitor/SavedScreensBar';
import { ScreenThumbnail } from './ScreenThumbnail';

const THUMB_WIDTH = 240;
const THUMB_HEIGHT = 135;

/**
 * The saved screens as the picker's own tab: up and down switch screens on the
 * spot, and past the last one sits the button that starts a new one. Naming
 * and deleting them stay in the strip under the monitor.
 */
export function SavedScreensList() {
  const [savedScreens] = useSavedScreens();
  const [activeIndex, setActiveIndex] = useActiveScreenIndex();
  const newSavedScreen = useNewSavedScreen();

  // Where the arrows are: a screen, or the new-screen button one past the
  // last. Landing on a screen puts it on air; landing on the button only
  // points at it, so arrowing past the end never creates anything.
  const addIndex = savedScreens.length;
  const [caret, setCaret] = useState(activeIndex);
  // Switching from outside the tab (Channel Up/Down, the strip) moves the
  // caret with it, and so does a new screen going on air.
  useEffect(() => setCaret(activeIndex), [activeIndex]);
  const onAdd = caret === addIndex;

  const move = (delta: number) => {
    const target = Math.min(Math.max(caret + delta, 0), addIndex);
    setCaret(target);
    if (target < addIndex) setActiveIndex(target);
  };
  useHotkeys('up', () => move(-1), { preventDefault: true }, [move]);
  useHotkeys('down', () => move(1), { preventDefault: true }, [move]);

  const itemRefs = useRef<(HTMLElement | null)[]>([]);
  useEffect(() => {
    itemRefs.current[caret]?.scrollIntoView({ block: 'nearest' });
  }, [caret]);

  // The button holds the focus while the caret is on it, so OK presses it
  // natively; anywhere else OK is the picker's, and closes it.
  const addRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (onAdd) addRef.current?.focus({ preventScroll: true });
    else if (document.activeElement === addRef.current) addRef.current?.blur();
  }, [onAdd]);

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col items-center gap-3 overflow-y-auto py-1">
      {savedScreens.map((saved, index) => {
        const isActive = index === activeIndex;
        return (
          <div
            key={`${saved.name}-${index}`}
            ref={el => {
              itemRefs.current[index] = el;
            }}
            onClick={() => {
              setCaret(index);
              setActiveIndex(index);
            }}
            aria-current={isActive}
            title={screenLabel(saved.name, index)}
            className={`relative shrink-0 cursor-pointer rounded-sm p-1 ${
              isActive ? 'bg-gray-800' : ''
            }`}
          >
            <ScreenThumbnail
              screen={saved.screen}
              width={THUMB_WIDTH}
              height={THUMB_HEIGHT}
              className={isActive ? 'ring-2 ring-white' : undefined}
            />
            {saved.name && (
              <div className="pointer-events-none absolute bottom-2 left-2 max-w-[80%] truncate rounded bg-black/70 px-1.5 text-[11px] font-semibold">
                {saved.name}
              </div>
            )}
          </div>
        );
      })}
      <button
        ref={el => {
          addRef.current = el;
          itemRefs.current[addIndex] = el;
        }}
        type="button"
        onClick={newSavedScreen}
        aria-label="Nueva pantalla"
        title="Nueva pantalla"
        className={`flex shrink-0 items-center justify-center gap-2 rounded-sm bg-black text-sm text-gray-400 outline-none hover:text-gray-200 ${
          onAdd ? 'text-white ring-2 ring-white' : ''
        }`}
        style={{ width: THUMB_WIDTH, height: THUMB_HEIGHT / 2 }}
      >
        <Plus size={20} aria-hidden />
        Nueva pantalla
      </button>
    </div>
  );
}
