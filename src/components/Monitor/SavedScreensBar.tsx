'use client';
import { Plus, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { useDisplayConfig } from '../../hooks/useDisplayConfig';
import {
  useActiveScreenIndex,
  useNewSavedScreen,
  useSavedScreens
} from '../../hooks/useSavedScreens';
import { useIsTv } from '../../hooks/useIsTv';
import { useIsMobile } from '../../hooks/useViewport';
import { DisplayMode } from '../../types/Monitor';
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
  const [displayConfig] = useDisplayConfig();
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
  // A remote has no pointer for the tile's X, nor letters for ⇧D.
  const canDelete = savedScreens.length > 1 && !isTv;

  // The key that lands on each of the active screen's neighbours, written
  // under it. On the zapping display the remote's channel keys zap instead
  // (see the Monitor), so there is nothing to write there.
  const stepKeys: [string, string] | undefined = isMobile
    ? undefined
    : isTv
      ? displayConfig.mode === DisplayMode.Zapping
        ? undefined
        : ['CH −', 'CH +']
      : ['Z', 'X'];
  const stepKeyFor = (index: number) =>
    index === activeIndex - 1
      ? stepKeys?.[0]
      : index === activeIndex + 1
        ? stepKeys?.[1]
        : undefined;

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
          const stepKey = stepKeyFor(index);
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
                      title={isMobile ? 'Eliminar' : 'Eliminar (⇧D)'}
                      onClick={event => {
                        event.stopPropagation();
                        startDelete(index);
                      }}
                      className="absolute -top-1.5 -right-1.5 rounded-full bg-black/70 p-0.5"
                    >
                      <X size={12} className="text-white" />
                    </button>
                  )}
                  {/* ⇧D drops the screen on air, so its key rides on that
                      tile's X. */}
                  {canDelete && isActive && !isMobile && (
                    <span className="pointer-events-none absolute -top-1 right-3.5 rounded bg-black/70 px-0.5 text-[9px] leading-none text-gray-300">
                      ⇧D
                    </span>
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
                {stepKey && (
                  <div
                    className={`leading-none font-bold text-gray-300 ${
                      isTv ? 'text-xs' : 'text-[10px]'
                    }`}
                  >
                    {stepKey}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {/* On a TV new screens come from the picker's screens tab, which the
            remote can reach; this one only takes a click. */}
        {!isTv && (
          <button
            type="button"
            onClick={newSavedScreen}
            aria-label="Nueva pantalla"
            title={isMobile ? 'Nueva pantalla' : 'Nueva pantalla (S)'}
            className="mt-1 flex shrink-0 flex-col items-center justify-center gap-1 rounded-sm bg-black text-gray-500 hover:text-gray-300"
            style={{ width: thumbWidth, height: thumbHeight }}
          >
            <Plus size={isMobile ? 18 : 22} />
            {!isMobile && (
              <span className="text-[10px] leading-none font-bold">S</span>
            )}
          </button>
        )}
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

  return (
    <div className="flex h-full min-h-0 w-full flex-col justify-center gap-1 px-3 py-2">
      {strip}
      {/* Each key is written on what it works (Z and X under the
          neighbours, S on the new-screen tile, ⇧D by the X); R and the rest
          are in the F1 help. */}
      {isNaming ? namePrompt : isConfirmingDelete && deletePrompt}
    </div>
  );
}
