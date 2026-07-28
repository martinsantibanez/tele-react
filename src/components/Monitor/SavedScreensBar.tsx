'use client';
import { X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import {
  useActiveScreen,
  useActiveScreenIndex,
  useSavedScreens
} from '../../hooks/useSavedScreens';
import {
  findLayoutIndex,
  possibleLayouts
} from '../SelectSource/layoutOptions';
import { ScreenThumbnail } from '../SelectSource/ScreenThumbnail';

const THUMB_WIDTH = 96;
const THUMB_HEIGHT = 54;

export function SavedScreensBar() {
  const [savedScreens, setSavedScreens] = useSavedScreens();
  const [activeIndex, setActiveIndex] = useActiveScreenIndex();
  const [activeScreen] = useActiveScreen();
  const [pendingName, setPendingName] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<number | null>(null);

  const isNaming = pendingName !== null;
  const screenPendingDelete =
    pendingDelete === null ? undefined : savedScreens[pendingDelete];
  const isConfirmingDelete = screenPendingDelete !== undefined;
  // While a prompt is open the keys answer it, not the strip.
  const isPrompting = isNaming || isConfirmingDelete;

  const selectedRef = useRef<HTMLDivElement>(null);
  // Z and X walk past the edge of the strip, so what they land on has to be
  // brought into view.
  useEffect(() => {
    selectedRef.current?.scrollIntoView({
      block: 'nearest',
      inline: 'nearest'
    });
  }, [activeIndex]);

  const suggestedName = () => {
    const layout = possibleLayouts[findLayoutIndex(activeScreen.config)];
    return `${layout?.name ?? 'Pantalla'} ${savedScreens.length + 1}`;
  };

  const startAdd = () => setPendingName('');

  const confirmAdd = () => {
    const name = pendingName?.trim() || suggestedName();
    setSavedScreens(saved => [...saved, { name, screen: activeScreen }]);
    setActiveIndex(savedScreens.length);
    setPendingName(null);
  };

  const select = (index: number) => {
    if (!savedScreens[index]) return;
    setActiveIndex(index);
  };

  // Stops at the ends instead of wrapping, like the sidebar's lists: holding a
  // key down should settle on the last screen, not cycle past it.
  const step = (delta: number) => {
    select(Math.min(Math.max(activeIndex + delta, 0), savedScreens.length - 1));
  };

  // The user is always working on a screen, so the last one can't be dropped.
  const canDelete = savedScreens.length > 1;

  const startDelete = (index = activeIndex) => {
    if (!canDelete || !savedScreens[index]) return;
    setPendingDelete(index);
  };

  const cancelDelete = () => setPendingDelete(null);

  const confirmDelete = () => {
    if (pendingDelete === null) return;
    const index = pendingDelete;
    setSavedScreens(saved => saved.filter((_, idx) => idx !== index));
    // Whatever the user was working on has to stay on air: dropping a screen
    // before it shifts the rest down, dropping the one on air falls back to
    // its neighbour.
    if (index <= activeIndex) setActiveIndex(Math.max(activeIndex - 1, 0));
    setPendingDelete(null);
  };

  useHotkeys(
    'z',
    () => (isPrompting ? undefined : step(-1)),
    { preventDefault: true },
    [isPrompting, activeIndex, savedScreens]
  );
  useHotkeys(
    'x',
    () => (isPrompting ? undefined : step(1)),
    { preventDefault: true },
    [isPrompting, activeIndex, savedScreens]
  );
  useHotkeys(
    's',
    () => (isPrompting ? undefined : startAdd()),
    { preventDefault: true },
    [isPrompting]
  );
  useHotkeys(
    'shift+d',
    () => (isPrompting ? undefined : startDelete()),
    { preventDefault: true },
    [isPrompting, activeIndex, savedScreens]
  );
  useHotkeys(
    'y',
    () => (isConfirmingDelete ? confirmDelete() : undefined),
    { preventDefault: true },
    [isConfirmingDelete, pendingDelete, savedScreens]
  );
  useHotkeys(
    'n',
    () => (isConfirmingDelete ? cancelDelete() : undefined),
    { preventDefault: true },
    [isConfirmingDelete]
  );

  const strip = (
    <div className="w-full min-w-0 overflow-x-auto">
      {/* `w-max` + `mx-auto` centres the screens while they fit and still
          scrolls from the first one once they don't. */}
      <div className="mx-auto flex w-max items-end gap-2">
        {savedScreens.map((saved, index) => {
          const isActive = index === activeIndex;
          return (
            <div
              key={`${saved.name}-${index}`}
              ref={isActive ? selectedRef : undefined}
              onClick={() => select(index)}
              aria-current={isActive}
              // The name under the thumbnail is truncated to the tile's width.
              title={saved.name}
              className={`shrink-0 cursor-pointer rounded-sm p-1 ${
                isActive ? 'bg-gray-800' : ''
              }`}
            >
              <div className="flex flex-col items-center gap-1">
                <div className="relative">
                  <ScreenThumbnail
                    screen={saved.screen}
                    width={THUMB_WIDTH}
                    height={THUMB_HEIGHT}
                    className={isActive ? 'ring-2 ring-white' : undefined}
                  />
                  {canDelete && (
                    <button
                      title="Eliminar"
                      onClick={event => {
                        event.stopPropagation();
                        startDelete(index);
                      }}
                      className="absolute -top-1.5 -right-1.5 rounded-full bg-black/70 p-0.5"
                    >
                      <X size={12} className="text-white" />
                    </button>
                  )}
                </div>
                <div
                  className="max-w-full truncate text-[10px] font-semibold"
                  style={{ width: THUMB_WIDTH }}
                >
                  {saved.name}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const namePrompt = (
    <form
      className="flex items-center justify-center gap-2"
      onSubmit={event => {
        event.preventDefault();
        confirmAdd();
      }}
    >
      <Input
        // The prompt only exists while naming, so mounting is the right moment
        // to take the caret.
        autoFocus
        value={pendingName ?? ''}
        onChange={event => setPendingName(event.target.value)}
        onKeyDown={event => {
          if (event.key !== 'Escape') return;
          event.preventDefault();
          setPendingName(null);
        }}
        placeholder="Nombre de la pantalla"
        className="h-7 max-w-xs"
      />
      <Button type="submit" variant="default" className="h-7">
        Crear
      </Button>
      <Button
        type="button"
        variant="ghost"
        className="h-7"
        onClick={() => setPendingName(null)}
      >
        Cancelar
      </Button>
      <span className="text-[9px] leading-none text-gray-400">ESC cancela</span>
    </form>
  );

  const deletePrompt = screenPendingDelete && (
    <div className="flex items-center justify-center gap-2">
      <span className="text-sm">
        ¿Eliminar{' '}
        <span className="font-semibold">{screenPendingDelete.name}</span>?
      </span>
      <Button
        type="button"
        variant="destructive"
        className="h-7"
        onClick={confirmDelete}
      >
        Sí (Y)
      </Button>
      <Button
        type="button"
        variant="ghost"
        className="h-7"
        onClick={cancelDelete}
      >
        No (N)
      </Button>
    </div>
  );

  const hint = (
    <div className="text-center text-[9px] leading-none text-gray-400">
      Z ◀ X ▶ cambiar · S nueva pantalla
      {canDelete && <> · ⇧D eliminar</>}
    </div>
  );

  return (
    <div className="flex h-full min-h-0 w-full flex-col justify-center gap-1 px-3 py-2">
      {strip}
      {isNaming ? namePrompt : isConfirmingDelete ? deletePrompt : hint}
    </div>
  );
}
