'use client';
import React, { PropsWithChildren, useState } from 'react';

function useValue() {
  const [isEditing, setIsEditing] = useState(true);
  const toggleEditting = () => setIsEditing(e => !e);
  const [editingSourceIdx, setEditingSourceIdx] = useState<
    number | undefined
  >();
  const [swapSourceIdx, setSwapSourceIdx] = useState<number | undefined>();

  return {
    isEditing,
    toggleEditting,
    editingSourceIdx,
    setEditingSourceIdx,
    swapSourceIdx,
    setSwapSourceIdx
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
