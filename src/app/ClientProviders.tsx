'use client';

import { PropsWithChildren } from 'react';
import { TeleProvider } from '../context/TeleContext';
import dynamic from 'next/dynamic';
import { useZappingSourceSync } from '../hooks/useZappingChannels';
import {
  useZappingActivationPolling,
  useZappingSession
} from '../hooks/useZappingConfig';
import { useYoutubeLiveSourceSync } from '../hooks/useYoutubeLiveSubs';
import { useZappingWelcomeScreen } from '../hooks/useZappingWelcomeScreen';

const ThemeProvider = dynamic(
  () => import('../components/theme-provider').then(c => c.ThemeProvider),
  {
    ssr: false
  }
);

// Keeps the Zapping play session alive and the channel catalogue fresh for the
// whole app (mounted once). The activation poll lives here too so a pending
// pairing keeps running while the user is off linking the code, whatever part
// of the UI they started it from.
const ZappingSessionManager = () => {
  // Linking an account swaps the screen over to Zapping channels, so the user
  // sees what they just connected instead of the default grid.
  const applyWelcomeScreen = useZappingWelcomeScreen();
  useZappingActivationPolling(applyWelcomeScreen);
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
