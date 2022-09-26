import { ChakraProvider } from '@chakra-ui/react';
import type { AppProps } from 'next/app';
import { TeleProvider } from '../context/TeleContext';
import '../styles/globals.scss';
import { theme } from '../styles/theme';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={theme}>
      <TeleProvider>
        <Component {...pageProps} />
      </TeleProvider>
    </ChakraProvider>
  );
}

export default MyApp;
