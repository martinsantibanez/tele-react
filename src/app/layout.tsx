import { Metadata, Viewport } from 'next';
import '../styles/globals.css';
import { ClientProviders } from './ClientProviders';

export const metadata: Metadata = {
  title: 'Ver Tele',
  description: 'Visor de canales de TV chilena'
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // The app is laid out to the full height of the screen, so it has to reach
  // under the notch and the home indicator; the bars that go there ask for the
  // safe-area insets themselves.
  viewportFit: 'cover',
  themeColor: '#000000'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
