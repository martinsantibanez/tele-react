'use client';
import { Plus, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import {
  useActiveScreenIndex,
  useNewSavedScreen,
  useSavedScreens
} from '../../hooks/useSavedScreens';
import { useIsTv } from '../../hooks/useIsTv';
import { useIsMobile } from '../../hooks/useViewport';
import { ScreenThumbnail } from '../SelectSource/ScreenThumbnail';

const THUMB_WIDTH = 96;
const THUMB_HEIGHT = 54;

// A phone gives the strip the height it can spare, which is less.
const MOBILE_THUMB_WIDTH = 72;
const MOBILE_THUMB_HEIGHT = 40;

/** What a screen is called where it needs a name and was never given one. */
export const screenLabel = (name: string, index: number) =>
  name || `Pantalla ${index + 1}`;

export function SavedScreensBar() {
  const isMobile = useIsMobile();
  const isTv = useIsTv();
  const thumbWidth = isMobile ? MOBILE_THUMB_WIDTH : THUMB_WIDTH;
  const thumbHeight = isMobile ? MOBILE_THUMB_HEIGHT : THUMB_HEIGHT;
  const [savedScreens, setSavedScreens] = useSavedScreens();
  const [activeIndex, setActiveIndex] = useActiveScreenIndex();
  const newSavedScreen = useNewSavedScreen();
  // Only renaming asks for a name: new screens start without one.
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

  const startRename = () =>
    setPendingName(savedScreens[activeIndex]?.name ?? '');

  const confirmName = () => {
    if (pendingName === null) return;
    // An empty box clears the name, which leaves the thumbnail to speak for
    // the screen like any new one.
    const typed = pendingName.trim();
    setSavedScreens(saved =>
      saved.map((entry, index) =>
        index === activeIndex ? { ...entry, name: typed } : entry
      )
    );
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
    () => (isPrompting ? undefined : newSavedScreen()),
    { preventDefault: true },
    [isPrompting, newSavedScreen]
  );
  useHotkeys(
    'r',
    () => (isPrompting ? undefined : startRename()),
    { preventDefault: true },
    [isPrompting, activeIndex, savedScreens]
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
      <div className="mx-auto flex w-max items-start gap-2">
        {savedScreens.map((saved, index) => {
          const isActive = index === activeIndex;
          return (
            <div
              key={`${saved.name}-${index}`}
              ref={isActive ? selectedRef : undefined}
              onClick={() => select(index)}
              aria-current={isActive}
              // The name under the thumbnail is truncated to the tile's width.
              title={screenLabel(saved.name, index)}
              className={`shrink-0 cursor-pointer rounded-sm p-1 ${
                isActive ? 'bg-gray-800' : ''
              }`}
            >
              <div className="flex flex-col items-center gap-1">
                <div className="relative">
                  <ScreenThumbnail
                    screen={saved.screen}
                    width={thumbWidth}
                    height={thumbHeight}
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
                {saved.name && (
                  <div
                    className="max-w-full truncate text-[10px] font-semibold"
                    style={{ width: thumbWidth }}
                  >
                    {saved.name}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <button
          type="button"
          onClick={newSavedScreen}
          aria-label="Nueva pantalla"
          title="Nueva pantalla"
          className="mt-1 flex shrink-0 items-center justify-center rounded-sm bg-black text-gray-500 hover:text-gray-300"
          style={{ width: thumbWidth, height: thumbHeight }}
        >
          <Plus size={isMobile ? 18 : 22} />
        </button>
      </div>
    </div>
  );

  const namePrompt = (
    <form
      className="flex flex-wrap items-center justify-center gap-2"
      onSubmit={event => {
        event.preventDefault();
        confirmName();
      }}
    >
      <Input
        autoFocus
        onFocus={event => event.target.select()}
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
        Renombrar
      </Button>
      <Button
        type="button"
        variant="ghost"
        className="h-7"
        onClick={() => setPendingName(null)}
      >
        Cancelar
      </Button>
      {!isMobile && (
        <span className="text-[9px] leading-none text-gray-400">
          ESC cancela
        </span>
      )}
    </form>
  );

  const deletePrompt = screenPendingDelete && (
    <div className="flex items-center justify-center gap-2">
      <span className="text-sm">
        ¿Eliminar{' '}
        <span className="font-semibold">
          {screenLabel(screenPendingDelete.name, pendingDelete ?? 0)}
        </span>
        ?
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
      Z ◀ X ▶ cambiar · S nueva pantalla · R renombrar
      {canDelete && <> · ⇧D eliminar</>}
    </div>
  );

  return (
    <div className="flex h-full min-h-0 w-full flex-col justify-center gap-1 px-3 py-2">
      {strip}
      {/* The hint is a list of keys, which a phone doesn't have; its prompts
          still come up, since they are how the strip is answered. */}
      {isNaming
        ? namePrompt
        : isConfirmingDelete
          ? deletePrompt
          : !isMobile && !isTv && hint}
    </div>
  );
}
