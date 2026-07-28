'use client';

import { PropsWithChildren } from 'react';
import { TeleProvider } from '../context/TeleContext';
import dynamic from 'next/dynamic';
import {
  useZappingActivationPolling,
  useZappingSession
} from '../hooks/useZappingConfig';
import { useFavourites } from '../hooks/useFavourites';
import { SourceCatalogProvider } from '../hooks/useSourceCatalog';
import { useZappingPresetScreens } from '../hooks/useZappingPresetScreens';

const ThemeProvider = dynamic(
  () => import('../components/theme-provider').then(c => c.ThemeProvider),
  {
    ssr: false
  }
);

// Keeps the Zapping play session alive for the whole app (mounted once). The
// activation poll lives here too so a pending pairing keeps running while the
// user is off linking the code, whatever part of the UI they started it from.
const ZappingSessionManager = () => {
  // A configured account brings its own screens of Zapping channels, so the
  // user sees what they connected instead of the default grid.
  useZappingPresetScreens();
  useZappingActivationPolling();
  useZappingSession();
  return null;
};

// Holding the hook is what carries favourites off the old custom-source
// registry, so it has to run whether or not the picker is ever opened.
const StorageMigration = () => {
  useFavourites();
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
      <SourceCatalogProvider>
        <ZappingSessionManager />
        <StorageMigration />
        <TeleProvider>{children}</TeleProvider>
      </SourceCatalogProvider>
    </ThemeProvider>
  );
};
