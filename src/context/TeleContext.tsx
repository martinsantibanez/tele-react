'use client';
import React, { PropsWithChildren, useState } from 'react';
import useLocalStorageState from 'use-local-storage-state';

/**
 * How the grid treats its live-only tiles: `all` draws them all, the ones off
 * air as placeholders, so they can be picked and changed; `live` draws the
 * ones on air; `hide` draws none of them, on air or not.
 */
export type LiveOnlyView = 'all' | 'live' | 'hide';

export const nextLiveOnlyView = (view: LiveOnlyView): LiveOnlyView =>
  view === 'all' ? 'live' : view === 'live' ? 'hide' : 'all';

function useValue() {
  const [isEditing, setIsEditing] = useState(true);
  const toggleEditting = () => setIsEditing(e => !e);
  const [editingSourceIdx, setEditingSourceIdx] = useState(0);
  const [swapSourceIdx, setSwapSourceIdx] = useState<number | undefined>();
  /**
   * Sound is the app's, not a screen's: one thing is audible at a time — the
   * selected screen — and this is the switch that says whether it is. Nothing
   * is stored per source, so a saved screen carries no
   * audio state of its own; it plays wherever it is opened by the same rule.
   */
  const [isMuted, setIsMuted] = useState(false);
  const toggleMute = () => setIsMuted(m => !m);
  /**
   * Which live-only tiles the grid draws. Kept across visits, so hiding them
   * stays put; `all` is only for the picker, and closing it goes back to
   * `live` (see the Monitor).
   */
  const [liveOnlyView, setLiveOnlyView] = useLocalStorageState<LiveOnlyView>(
    'liveOnlyView',
    { defaultValue: 'live' }
  );

  return {
    isEditing,
    setIsEditing,
    toggleEditting,
    editingSourceIdx,
    setEditingSourceIdx,
    swapSourceIdx,
    setSwapSourceIdx,
    isMuted,
    setIsMuted,
    toggleMute,
    liveOnlyView,
    setLiveOnlyView
  };
}

type TeleCtxType = ReturnType<typeof useValue>;

export const TeleCtx = React.createContext<TeleCtxType | undefined>(undefined);

export const useTeleContext = () => {
  const context = React.useContext(TeleCtx);
  if (context === undefined)
    throw new Error('useTele must be used within a TeleProvider');
  return context;
};

export function TeleProvider({
  children
}: PropsWithChildren<Record<string, unknown>>) {
  const value = useValue();
  return <TeleCtx.Provider value={value}>{children}</TeleCtx.Provider>;
}
