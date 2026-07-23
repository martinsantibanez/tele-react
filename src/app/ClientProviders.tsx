'use client';

import { PropsWithChildren } from 'react';
import { TeleProvider } from '../context/TeleContext';
import dynamic from 'next/dynamic';
import { useZappingSession } from '../hooks/useZappingConfig';

const ThemeProvider = dynamic(
  () => import('../components/theme-provider').then(c => c.ThemeProvider),
  {
    ssr: false
  }
);

// Keeps the Zapping play session alive for the whole app (mounted once).
const ZappingSessionManager = () => {
  useZappingSession();
  return null;
};

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
      <ZappingSessionManager />
      <TeleProvider>{children}</TeleProvider>
    </ThemeProvider>
  );
};
