'use client';
import Image from 'next/image';
import { useEffect } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useTeleContext } from '../../context/TeleContext';
import { useDisplayConfig } from '../../hooks/useDisplayConfig';
import {
  getIndexFromKeyEvent,
  NUMBER_HOTKEYS
} from '../../utils/numberShortcut';
import { RowSlider, sliderRow } from '../RowSlider/RowSlider';
import {
  findLayoutIndex,
  possibleLayouts,
  PossibleLayout
} from './layoutOptions';
import { useSavedScreensRow } from './SavedScreensRow';

/**
 * The layout config: the arrangements to pick from and the screens the user has
 * saved. It lives under the monitor rather than in the sidebar, and both rows
 * answer the keyboard at once — the saved screens outlive the session, so they
 * own the number keys, while A and D walk the arrangements.
 */
export function LayoutsPanel() {
  const [displayConfig, setDisplayConfig] = useDisplayConfig();
  const { setIsPromptOpen } = useTeleContext();
  const {
    row: savedScreensRow,
    selectByIndex,
    startSave,
    namePrompt,
    isNaming,
    startDelete,
    confirmDelete,
    cancelDelete,
    deletePrompt,
    isConfirmingDelete
  } = useSavedScreensRow();

  // While a prompt is up it owns the keyboard, here and in the monitor.
  const hasPrompt = isNaming || isConfirmingDelete;
  useEffect(() => {
    setIsPromptOpen(hasPrompt);
    return () => setIsPromptOpen(false);
  }, [hasPrompt, setIsPromptOpen]);

  const selectLayout = (index: number) =>
    setDisplayConfig(possibleLayouts[index].config);

  const moveLayout = (delta: number) => {
    if (hasPrompt) return;
    const current = findLayoutIndex(displayConfig);
    // Nothing matching means the monitor is on an arrangement this row does not
    // list (the dynamic YouTube one), so the walk starts at the beginning.
    if (current === -1) return selectLayout(0);
    const next = Math.min(
      Math.max(current + delta, 0),
      possibleLayouts.length - 1
    );
    if (next !== current) selectLayout(next);
  };

  useHotkeys('a', () => moveLayout(-1), { preventDefault: true }, [
    displayConfig,
    hasPrompt
  ]);
  useHotkeys('d', () => moveLayout(1), { preventDefault: true }, [
    displayConfig,
    hasPrompt
  ]);
  useHotkeys(
    NUMBER_HOTKEYS,
    event => {
      if (hasPrompt) return;
      const index = getIndexFromKeyEvent(event);
      if (index === undefined) return;
      selectByIndex(index);
    },
    { preventDefault: true },
    [hasPrompt, selectByIndex]
  );
  useHotkeys(
    'mod+s',
    () => {
      if (hasPrompt) return;
      startSave();
    },
    { preventDefault: true },
    [hasPrompt, startSave]
  );
  // Plain Delete removes a screen from the monitor, so wiping a stored one —
  // which no longer has a row of its own to be "in" — asks for Shift.
  useHotkeys(
    'shift+delete,shift+backspace',
    () => {
      if (hasPrompt) return;
      startDelete();
    },
    { preventDefault: true },
    [hasPrompt, startDelete]
  );
  useHotkeys(
    'y',
    () => (isConfirmingDelete ? confirmDelete() : undefined),
    { preventDefault: true },
    [isConfirmingDelete, confirmDelete]
  );
  useHotkeys(
    'n',
    () => (isConfirmingDelete ? cancelDelete() : undefined),
    { preventDefault: true },
    [isConfirmingDelete, cancelDelete]
  );

  const rows = [
    savedScreensRow,
    sliderRow<PossibleLayout>({
      key: 'layouts',
      items: possibleLayouts,
      selectedIndex: findLayoutIndex(displayConfig),
      onSelect: index => selectLayout(index),
      getItemKey: layout => layout.imgName,
      renderItem: (layout, { isSelected }) => (
        <div
          className={`cursor-pointer p-1 ${isSelected ? 'bg-gray-800' : ''}`}
        >
          <div className="flex flex-col items-center gap-1">
            <Image
              alt={layout.name}
              src={`/img/layout/${layout.imgName}`}
              width={96}
              height={54}
              className={
                isSelected ? 'ring-2 ring-white rounded-sm' : undefined
              }
            />
            <div className="max-w-full truncate text-[10px] font-semibold">
              {layout.name}
            </div>
          </div>
        </div>
      )
    })
  ];

  return (
    <div className="flex w-full flex-col gap-1">
      {namePrompt}
      {deletePrompt}
      <RowSlider rows={rows} />
      <div className="shrink-0 text-center text-[9px] leading-none text-gray-400">
        1-9 pantallas guardadas · A D layouts · CTRL+S guarda · ⇧SUPR elimina la
        guardada
      </div>
    </div>
  );
}
