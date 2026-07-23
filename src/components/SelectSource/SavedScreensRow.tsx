import Image from 'next/image';
import { X } from 'lucide-react';
import { ReactNode, useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { useDisplayConfig } from '../../hooks/useDisplayConfig';
import { useSavedGrid } from '../../hooks/useSavedGrid';
import { SavedScreen, useSavedScreens } from '../../hooks/useSavedScreens';
import { ErasedSliderRow, sliderRow } from '../RowSlider/RowSlider';
import { findLayoutIndex, possibleLayouts } from './layoutOptions';

/**
 * Second row of the layouts category: the screens the user has stored, so a
 * whole setup (layout + which source sits in each slot) can be brought back.
 */
export function useSavedScreensRow(): {
  row: ErasedSliderRow;
  /** Opens the name prompt; the save itself happens on submit. */
  startSave: () => void;
  /** Render this next to the rows: it is the name prompt, or null when closed. */
  namePrompt: ReactNode;
  isNaming: boolean;
  /** Opens the delete confirmation for the selected screen. */
  startDelete: () => void;
  confirmDelete: () => void;
  cancelDelete: () => void;
  /** The delete confirmation, or null when nothing is pending. */
  deletePrompt: ReactNode;
  isConfirmingDelete: boolean;
} {
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

  const suggestedName = () => {
    const layout = possibleLayouts[findLayoutIndex(displayConfig)];
    return `${layout?.name ?? 'Pantalla'} ${savedScreens.length + 1}`;
  };

  const startSave = () => setPendingName(suggestedName());

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

  const startDelete = (index = selectedIndex) => {
    if (!savedScreens[index]) return;
    setPendingDelete(index);
  };

  const cancelDelete = () => setPendingDelete(null);

  const confirmDelete = () => {
    if (pendingDelete === null) return;
    const index = pendingDelete;
    setSavedScreens(saved => saved.filter((_, idx) => idx !== index));
    // Keep the caret inside the row after the list shrinks.
    setSelectedIndex(current =>
      current >= index ? Math.max(current - 1, 0) : current
    );
    setPendingDelete(null);
  };

  const row = sliderRow<SavedScreen>({
    key: 'saved',
    items: savedScreens,
    selectedIndex,
    onSelect: (index, saved) => {
      setSelectedIndex(index);
      restore(saved);
    },
    getItemKey: (saved, index) => `${saved.name}-${index}`,
    emptyState: (
      <div className="text-sm text-gray-400">
        Sin pantallas guardadas — pulsa{' '}
        <span className="font-semibold text-gray-200">S</span> para guardar la
        actual
      </div>
    ),
    renderItem: (saved, { index, isSelected }) => {
      const layout = possibleLayouts[findLayoutIndex(saved.screen.config)];
      return (
        <div
          className={`cursor-pointer p-3 ${isSelected ? 'bg-gray-800' : ''}`}
        >
          <div className="flex flex-col items-center gap-2">
            <div className="relative">
              {layout ? (
                <Image
                  alt={saved.name}
                  src={`/img/layout/${layout.imgName}`}
                  width="160"
                  height="90"
                  className={
                    isSelected ? 'ring-2 ring-white rounded-sm' : undefined
                  }
                />
              ) : (
                <div
                  className={`h-[90px] w-[160px] rounded-sm bg-gray-700 ${
                    isSelected ? 'ring-2 ring-white' : ''
                  }`}
                />
              )}
              <button
                title="Eliminar"
                onClick={event => {
                  event.stopPropagation();
                  startDelete(index);
                }}
                className="absolute -top-1.5 -right-1.5 rounded-full bg-black/70 p-0.5"
              >
                <X size={14} className="text-white" />
              </button>
            </div>
            <div className="text-sm font-semibold">{saved.name}</div>
          </div>
        </div>
      );
    }
  });

  const namePrompt = isNaming ? (
    <form
      className="flex items-center gap-2 px-3"
      onSubmit={event => {
        event.preventDefault();
        confirmSave();
      }}
    >
      <Input
        // The prompt only exists while naming, so mounting is the right moment
        // to take the caret.
        autoFocus
        value={pendingName}
        onChange={event => setPendingName(event.target.value)}
        onKeyDown={event => {
          if (event.key !== 'Escape') return;
          event.preventDefault();
          setPendingName(null);
        }}
        placeholder="Nombre de la pantalla"
        className="max-w-xs"
      />
      <Button type="submit" variant="default">
        Guardar
      </Button>
      <Button
        type="button"
        variant="ghost"
        onClick={() => setPendingName(null)}
      >
        Cancelar
      </Button>
      <span className="text-[9px] leading-none text-gray-400">ESC cancela</span>
    </form>
  ) : null;

  const deletePrompt = screenPendingDelete ? (
    <div className="flex items-center gap-2 px-3">
      <span className="text-sm">
        ¿Eliminar{' '}
        <span className="font-semibold">{screenPendingDelete.name}</span>?
      </span>
      <Button type="button" variant="destructive" onClick={confirmDelete}>
        Sí (Y)
      </Button>
      <Button type="button" variant="ghost" onClick={cancelDelete}>
        No (N)
      </Button>
    </div>
  ) : null;

  return {
    row,
    startSave,
    namePrompt,
    isNaming,
    startDelete,
    confirmDelete,
    cancelDelete,
    deletePrompt,
    isConfirmingDelete
  };
}
