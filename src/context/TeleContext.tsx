import React, { PropsWithChildren, useEffect, useState } from 'react';

type TeleCtxType = {
  isEditing: any;
  toggleEditting: any;
  editingSourceIdx: any;
  setEditingSourceIdx: any;
  editingSourceUuid: any;
  setEditingSourceUuid: any;
};

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
  const [isEditing, setIsEditing] = useState(false);
  const toggleEditting = () => setIsEditing(e => !e);
  const [editingSourceIdx, setEditingSourceIdx] = useState<
    number | undefined
  >();

  const [editingSourceUuid, setEditingSourceUuid] = useState<
    string | undefined
  >();

  useEffect(() => {
    if (!isEditing) {
      setEditingSourceIdx(undefined);
      setEditingSourceUuid(undefined);
    }
  }, [isEditing]);

  return (
    <TeleCtx.Provider
      value={{
        isEditing,
        toggleEditting,
        editingSourceIdx,
        setEditingSourceIdx,
        editingSourceUuid,
        setEditingSourceUuid
      }}
    >
      {children}
    </TeleCtx.Provider>
  );
}
