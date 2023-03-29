import type { AppProps } from 'next/app';
import { TeleProvider } from '../context/TeleContext';
import '../styles/globals.scss';
import { useEffect } from 'react';

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    document.documentElement.dataset.bsTheme = 'dark';
  }, []);
  return (
    <TeleProvider>
      <Component {...pageProps} />
    </TeleProvider>
  );
}

export default MyApp;
