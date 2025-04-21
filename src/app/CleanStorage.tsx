'use client';
import React, { useState } from 'react';
import { useCleanLocalStorage } from '../app/page';

type Props = {};
export const Home = ({}: Props) => {
  const [clearedState, setClearedState] = useState(false);
  const cleanLocalStorage = useCleanLocalStorage();
  const handleClearLocalStorage = () => {
    if (clearedState) {
      setClearedState(false);
      return;
    }
    cleanLocalStorage();
    setClearedState(true);
  };

  return (
    <button
      onClick={handleClearLocalStorage}
      className="btn btn-outline-light col-12 col-md-4 offset-md-4"
    >
      {clearedState ? '✅ Borrado' : 'Borrar datos locales'}
    </button>
  );
};
