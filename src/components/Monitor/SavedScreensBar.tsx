'use client';
import { X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { useDisplayConfig } from '../../hooks/useDisplayConfig';
import { useSavedGrid } from '../../hooks/useSavedGrid';
import { SavedScreen, useSavedScreens } from '../../hooks/useSavedScreens';
import {
  findLayoutIndex,
  possibleLayouts
} from '../SelectSource/layoutOptions';
import { ScreenThumbnail } from '../SelectSource/ScreenThumbnail';

const THUMB_WIDTH = 96;
const THUMB_HEIGHT = 54;

/**
 * The screens the user has stored, laid out under the monitor: a whole setup
 * (layout + which source sits in each slot) can be brought back with one key.
 *
 * It lives outside the sidebar so switching setups doesn't mean opening edit
 * mode first, which is why its keys are bound globally: Z/X walk the strip,
 * S stores the screen on air and Shift+D drops the selected one. Shift+D
 * rather than D because D already removes a screen from the grid.
 */
export function SavedScreensBar() {
  const [savedScreens, setSavedScreens] = useSavedScreens();
  const [selectedSources, setSelectedSources] = useSavedGrid();
  const [displayConfig, setDisplayConfig] = useDisplayConfig();
  const [selectedIndex, setSelectedIndex] = useState(-1);
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
  }, [selectedIndex]);

  const suggestedName = () => {
    const layout = possibleLayouts[findLayoutIndex(displayConfig)];
    return `${layout?.name ?? 'Pantalla'} ${savedScreens.length + 1}`;
  };

  // The field opens empty — the suggested name is only the fallback for when
  // the user saves without typing one.
  const startSave = () => setPendingName('');

  const confirmSave = () => {
    const name = pendingName?.trim() || suggestedName();
    setSavedScreens(saved => [
      ...saved,
      { name, screen: { config: displayConfig, sources: selectedSources } }
    ]);
    setSelectedIndex(savedScreens.length);
    setPendingName(null);
  };

  const restore = (saved: SavedScreen) => {
    setDisplayConfig(saved.screen.config);
    setSelectedSources(saved.screen.sources);
  };

  const select = (index: number) => {
    const saved = savedScreens[index];
    if (!saved) return;
    setSelectedIndex(index);
    restore(saved);
  };

  // Stops at the ends instead of wrapping, like the sidebar's lists: holding a
  // key down should settle on the last screen, not cycle past it.
  const step = (delta: number) => {
    if (!savedScreens.length) return;
    select(
      Math.min(Math.max(selectedIndex + delta, 0), savedScreens.length - 1)
    );
  };

  const startDelete = (index = selectedIndex) => {
    if (!savedScreens[index]) return;
    setPendingDelete(index);
  };

  const cancelDelete = () => setPendingDelete(null);

  const confirmDelete = () => {
    if (pendingDelete === null) return;
    const index = pendingDelete;
    const remaining = savedScreens.length - 1;
    setSavedScreens(saved => saved.filter((_, idx) => idx !== index));
    // Keep the caret inside the strip after the list shrinks, and let it go
    // when there is nothing left to point at.
    setSelectedIndex(current => {
      if (!remaining) return -1;
      return current >= index ? Math.max(current - 1, 0) : current;
    });
    setPendingDelete(null);
  };

  useHotkeys(
    'z',
    () => (isPrompting ? undefined : step(-1)),
    { preventDefault: true },
    [isPrompting, selectedIndex, savedScreens]
  );
  useHotkeys(
    'x',
    () => (isPrompting ? undefined : step(1)),
    { preventDefault: true },
    [isPrompting, selectedIndex, savedScreens]
  );
  useHotkeys(
    's',
    () => (isPrompting ? undefined : startSave()),
    { preventDefault: true },
    [isPrompting, displayConfig, savedScreens]
  );
  useHotkeys(
    'shift+d',
    () => (isPrompting ? undefined : startDelete()),
    { preventDefault: true },
    [isPrompting, selectedIndex, savedScreens]
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
          const isSelected = index === selectedIndex;
          return (
            <div
              key={`${saved.name}-${index}`}
              ref={isSelected ? selectedRef : undefined}
              onClick={() => select(index)}
              aria-current={isSelected}
              // The name under the thumbnail is truncated to the tile's width.
              title={saved.name}
              className={`shrink-0 cursor-pointer rounded-sm p-1 ${
                isSelected ? 'bg-gray-800' : ''
              }`}
            >
              <div className="flex flex-col items-center gap-1">
                <div className="relative">
                  <ScreenThumbnail
                    screen={saved.screen}
                    width={THUMB_WIDTH}
                    height={THUMB_HEIGHT}
                    className={isSelected ? 'ring-2 ring-white' : undefined}
                  />
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
        confirmSave();
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
        Guardar
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
      {savedScreens.length ? (
        <>Z ◀ X ▶ cambiar · S guardar · ⇧D eliminar</>
      ) : (
        <>Sin pantallas guardadas · S guarda la actual</>
      )}
    </div>
  );

  return (
    <div className="flex h-full min-h-0 w-full flex-col justify-center gap-1 px-3 py-2">
      {!!savedScreens.length && strip}
      {isNaming ? namePrompt : isConfirmingDelete ? deletePrompt : hint}
    </div>
  );
}
