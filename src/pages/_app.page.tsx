import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TeleProvider } from '../context/TeleContext';
import '../styles/globals.scss';

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    document.documentElement.dataset.bsTheme = 'dark';
  }, []);
  return (
    <DndProvider backend={HTML5Backend}>
      <TeleProvider>
        <Component {...pageProps} />
      </TeleProvider>
    </DndProvider>
  );
}

export default MyApp;
