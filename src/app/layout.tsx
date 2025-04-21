import { Metadata } from 'next';
import '../styles/globals.css';
import { RootProviders } from './RootProviders';
import dynamic from 'next/dynamic';

export const metadata: Metadata = {
  title: 'Ver Tele',
  description: 'Visor de canales de TV chilena'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <RootProviders>{children}</RootProviders>
      </body>
    </html>
  );
}
