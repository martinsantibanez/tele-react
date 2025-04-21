import type { AppProps } from 'next/app';
import { ThemeProvider } from '../components/theme-provider';
import { TeleProvider } from '../context/TeleContext';
import '../styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <html lang="es" suppressHydrationWarning>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <TeleProvider>
          <Component {...pageProps} />
        </TeleProvider>
      </ThemeProvider>
    </html>
  );
}

export default MyApp;
