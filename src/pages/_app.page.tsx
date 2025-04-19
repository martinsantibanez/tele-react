import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TeleProvider } from '../context/TeleContext';
import '../styles/globals.css';
import { ThemeProvider } from '../components/theme-provider';

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    document.documentElement.dataset.bsTheme = 'dark';
  }, []);
  return (
    <html lang="es" suppressHydrationWarning>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <DndProvider backend={HTML5Backend}>
          <TeleProvider>
            <Component {...pageProps} />
          </TeleProvider>
        </DndProvider>
      </ThemeProvider>
    </html>
  );
}

export default MyApp;
