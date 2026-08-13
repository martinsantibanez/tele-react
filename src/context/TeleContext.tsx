'use client';
import React, { PropsWithChildren, useState } from 'react';

function useValue() {
  const [isEditing, setIsEditing] = useState(true);
  const toggleEditting = () => setIsEditing(e => !e);
  const [editingSourceIdx, setEditingSourceIdx] = useState(0);
  const [swapSourceIdx, setSwapSourceIdx] = useState<number | undefined>();
  /**
   * Sound is the app's, not a screen's: one thing is audible at a time — the
   * selected screen — and this is the switch that says whether it is. Nothing
   * is stored per source, so a saved, shared or promoted screen carries no
   * audio state of its own; it plays wherever it is opened by the same rule.
   */
  const [isMuted, setIsMuted] = useState(false);
  const toggleMute = () => setIsMuted(m => !m);

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
    toggleMute
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
