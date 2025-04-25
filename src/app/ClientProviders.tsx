'use client';

import { PropsWithChildren } from 'react';
import { TeleProvider } from '../context/TeleContext';
import dynamic from 'next/dynamic';

const ThemeProvider = dynamic(
  () => import('../components/theme-provider').then(c => c.ThemeProvider),
  {
    ssr: false
  }
);

export const ClientProviders = ({
  children
}: PropsWithChildren<Record<string, unknown>>) => {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <TeleProvider>{children}</TeleProvider>
    </ThemeProvider>
  );
};
