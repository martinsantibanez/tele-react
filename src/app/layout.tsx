import { Metadata } from 'next';
import '../styles/globals.css';
import { ClientProviders } from './ClientProviders';

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
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
