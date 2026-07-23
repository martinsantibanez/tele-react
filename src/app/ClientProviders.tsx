'use client';

import { PropsWithChildren } from 'react';
import { TeleProvider } from '../context/TeleContext';
import dynamic from 'next/dynamic';
import { useZappingSourceSync } from '../hooks/useZappingChannels';
import { useZappingSession } from '../hooks/useZappingConfig';
import { useYoutubeLiveSourceSync } from '../hooks/useYoutubeLiveSubs';

const ThemeProvider = dynamic(
  () => import('../components/theme-provider').then(c => c.ThemeProvider),
  {
    ssr: false
  }
);

// Keeps the Zapping play session alive and the channel catalogue fresh for the
// whole app (mounted once).
const ZappingSessionManager = () => {
  useZappingSession();
  useZappingSourceSync();
  return null;
};

// Keeps saved YouTube-live sources re-pointed at each channel's current stream
// (mounted once).
const YoutubeLiveManager = () => {
  useYoutubeLiveSourceSync();
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
      <YoutubeLiveManager />
      <TeleProvider>{children}</TeleProvider>
    </ThemeProvider>
  );
};
