import { Metadata } from 'next';
import Link from 'next/link';
import { PropsWithChildren } from 'react';

// Public privacy policy, linked from the setup wizard and the YouTube connect
// UI. Google's OAuth verification requires it on the app's own domain and
// reachable from the home page. Bilingual because the app is in Spanish but
// the reviewers read English.

export const metadata: Metadata = {
  title: 'Política de privacidad · Ver Tele',
  description: 'Cómo Ver Tele trata tus datos / How Ver Tele handles your data'
};

const UPDATED_ES = '25 de octubre de 2026';
const UPDATED_EN = 'October 25, 2026';
const CONTACT_EMAIL = 'liturgia-lamento.7q@icloud.com';
const SOURCE_URL = 'https://github.com/martinsantibanez/tele-react';

const GOOGLE_PRIVACY = 'https://policies.google.com/privacy';
const YOUTUBE_TOS = 'https://www.youtube.com/t/terms';
const GOOGLE_PERMISSIONS = 'https://myaccount.google.com/permissions';
const USER_DATA_POLICY =
  'https://developers.google.com/terms/api-services-user-data-policy';

const A = ({ href, children }: PropsWithChildren<{ href: string }>) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="underline underline-offset-2"
  >
    {children}
  </a>
);

const H2 = ({ children }: PropsWithChildren) => (
  <h2 className="mt-8 text-xl font-semibold text-foreground">{children}</h2>
);

const Mail = () => <A href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</A>;

function Spanish() {
  return (
    <section id="es" lang="es">
      <h1 className="text-3xl font-semibold text-foreground">
        Política de privacidad
      </h1>
      <p className="mt-2 text-sm">Última actualización: {UPDATED_ES}</p>

      <p className="mt-6">
        Ver Tele es un visor de canales de TV en vivo, de uso personal y sin
        fines comerciales. Esta política explica qué datos usa la aplicación,
        para qué y dónde quedan. No tenemos cuentas de usuario ni base de datos:
        todo lo que se guarda queda en tu propio navegador.
      </p>

      <H2>Datos de Google (YouTube)</H2>
      <p className="mt-3">
        Si eliges «Conectar con YouTube», pedimos un único permiso de solo
        lectura, <code>youtube.readonly</code>. Con él leemos:
      </p>
      <ul className="mt-3 list-disc space-y-1 pl-6">
        <li>la lista de canales a los que estás suscrito (nombre e imagen);</li>
        <li>los videos más recientes de esos canales;</li>
        <li>
          los datos públicos de esos videos (título, miniatura, si están en
          vivo y cuántos espectadores tienen).
        </li>
      </ul>
      <p className="mt-3">
        Lo usamos solo para mostrarte cuáles de tus canales suscritos están
        transmitiendo en vivo y poder reproducirlos. No leemos tu correo,
        historial, comentarios ni ningún otro dato de tu cuenta, y nunca
        publicamos, modificamos ni borramos nada en YouTube.
      </p>

      <H2>Dónde se guardan</H2>
      <ul className="mt-3 list-disc space-y-1 pl-6">
        <li>
          El token de actualización que entrega Google se cifra (AES-GCM) y se
          guarda en una cookie <code>httpOnly</code> de tu navegador. Nuestro
          servidor lo descifra solo para pedirle a Google tokens de acceso de
          corta duración; no lo almacena en ningún otro lugar.
        </li>
        <li>
          El token de acceso de corta duración y la lista de suscripciones y
          canales en vivo se guardan en el almacenamiento local (
          <code>localStorage</code>) de tu navegador, como caché.
        </li>
        <li>
          No guardamos datos de YouTube en servidores, no los registramos y
          ninguna persona los revisa.
        </li>
      </ul>

      <H2>Con quién se comparten</H2>
      <p className="mt-3">
        Con nadie. No vendemos, transferimos ni compartimos datos de Google con
        terceros, y no los usamos para publicidad, perfiles ni para entrenar
        modelos de inteligencia artificial. Las únicas solicitudes que hacemos
        con ellos son a las API de Google, para obtener la información descrita
        arriba.
      </p>
      <p className="mt-3">
        El uso que hace Ver Tele de la información recibida de las API de
        Google, y su transferencia a cualquier otra aplicación, se ajusta a la{' '}
        <A href={USER_DATA_POLICY}>
          Política de datos de usuario de los servicios de API de Google
        </A>
        , incluidos los requisitos de Uso limitado.
      </p>

      <H2>Servicios de API de YouTube</H2>
      <p className="mt-3">
        Ver Tele usa los Servicios de API de YouTube. Al conectar tu cuenta
        aceptas las <A href={YOUTUBE_TOS}>Condiciones del servicio de YouTube</A>
        , y tus datos también están sujetos a la{' '}
        <A href={GOOGLE_PRIVACY}>Política de privacidad de Google</A>.
      </p>

      <H2>Cómo desconectarte y borrar tus datos</H2>
      <ul className="mt-3 list-disc space-y-1 pl-6">
        <li>
          Usa «Desconectar» en la configuración de YouTube de la app: revoca el
          permiso ante Google y borra la cookie.
        </li>
        <li>
          También puedes revocar el acceso en cualquier momento desde{' '}
          <A href={GOOGLE_PERMISSIONS}>la configuración de tu cuenta de Google</A>
          .
        </li>
        <li>
          Borrar los datos del sitio en tu navegador elimina todo lo que Ver
          Tele haya guardado.
        </li>
      </ul>

      <H2>Otros servicios</H2>
      <p className="mt-3">
        Si conectas Zapping, Spotify o Twitch, la sesión de cada uno se guarda
        del mismo modo, solo en tu navegador, y se usa solo para mostrar y
        reproducir tu contenido de ese servicio. Los reproductores incrustados
        (YouTube, Twitch, canales de TV) son de sus propios dueños y se rigen
        por sus políticas. El sitio está alojado en Vercel, que puede registrar
        datos técnicos de las solicitudes (como la dirección IP) para operar el
        servicio.
      </p>

      <H2>Menores</H2>
      <p className="mt-3">
        Ver Tele no está dirigida a menores de 13 años ni recopila
        intencionalmente sus datos.
      </p>

      <H2>Cambios y contacto</H2>
      <p className="mt-3">
        Si esta política cambia, actualizaremos la fecha de arriba. Para
        preguntas o solicitudes escribe a <Mail />. El código de la aplicación
        es público en <A href={SOURCE_URL}>GitHub</A>.
      </p>
    </section>
  );
}

function English() {
  return (
    <section id="en" lang="en">
      <h1 className="text-3xl font-semibold text-foreground">Privacy Policy</h1>
      <p className="mt-2 text-sm">Last updated: {UPDATED_EN}</p>

      <p className="mt-6">
        Ver Tele is a personal, non-commercial live TV viewer. This policy
        explains what data the app uses, why, and where it is kept. There are
        no user accounts and no database: everything that is stored stays in
        your own browser.
      </p>

      <H2>Google user data (YouTube)</H2>
      <p className="mt-3">
        If you choose “Connect with YouTube”, we request a single read-only
        scope, <code>youtube.readonly</code>. With it we read:
      </p>
      <ul className="mt-3 list-disc space-y-1 pl-6">
        <li>the list of channels you are subscribed to (name and picture);</li>
        <li>the most recent uploads of those channels;</li>
        <li>
          the public details of those videos (title, thumbnail, whether they
          are live and how many viewers they have).
        </li>
      </ul>
      <p className="mt-3">
        We use this only to show you which of your subscribed channels are
        streaming live right now and to play them. We do not read your email,
        watch history, comments or any other account data, and we never post,
        change or delete anything on YouTube.
      </p>

      <H2>Where it is stored</H2>
      <ul className="mt-3 list-disc space-y-1 pl-6">
        <li>
          The refresh token Google issues is encrypted (AES-GCM) and stored in
          an <code>httpOnly</code> cookie in your browser. Our server decrypts
          it only to ask Google for short-lived access tokens; it is not stored
          anywhere else.
        </li>
        <li>
          The short-lived access token and the list of subscriptions and live
          channels are cached in your browser’s <code>localStorage</code>.
        </li>
        <li>
          We do not store YouTube data on any server, do not log it, and no
          human reads it.
        </li>
      </ul>

      <H2>Sharing</H2>
      <p className="mt-3">
        None. We do not sell, transfer or share Google user data with third
        parties, and we do not use it for advertising, profiling or training AI
        models. The only requests made with it go to Google’s own APIs, to
        fetch the information described above.
      </p>
      <p className="mt-3">
        Ver Tele’s use and transfer to any other app of information received
        from Google APIs will adhere to the{' '}
        <A href={USER_DATA_POLICY}>Google API Services User Data Policy</A>,
        including the Limited Use requirements.
      </p>

      <H2>YouTube API Services</H2>
      <p className="mt-3">
        Ver Tele uses YouTube API Services. By connecting your account you
        agree to be bound by the{' '}
        <A href={YOUTUBE_TOS}>YouTube Terms of Service</A>, and your data is
        also subject to the <A href={GOOGLE_PRIVACY}>Google Privacy Policy</A>.
      </p>

      <H2>Disconnecting and deleting your data</H2>
      <ul className="mt-3 list-disc space-y-1 pl-6">
        <li>
          Use “Desconectar” (Disconnect) in the app’s YouTube settings: it
          revokes the grant with Google and deletes the cookie.
        </li>
        <li>
          You can also revoke access at any time from your{' '}
          <A href={GOOGLE_PERMISSIONS}>Google Account settings</A>.
        </li>
        <li>
          Clearing this site’s data in your browser removes everything Ver Tele
          has stored.
        </li>
      </ul>

      <H2>Other services</H2>
      <p className="mt-3">
        If you connect Zapping, Spotify or Twitch, each session is stored the
        same way, only in your browser, and used only to show and play your
        content from that service. Embedded players (YouTube, Twitch, TV
        channels) belong to their owners and follow their own policies. The
        site is hosted on Vercel, which may log technical request data (such as
        IP addresses) to operate the service.
      </p>

      <H2>Children</H2>
      <p className="mt-3">
        Ver Tele is not directed at children under 13 and does not knowingly
        collect their data.
      </p>

      <H2>Changes and contact</H2>
      <p className="mt-3">
        If this policy changes, we will update the date above. For questions or
        requests, email <Mail />. The app’s source code is public on{' '}
        <A href={SOURCE_URL}>GitHub</A>.
      </p>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <main className="min-h-[100dvh] bg-background px-4 py-10 text-muted-foreground">
      <div className="mx-auto max-w-2xl leading-relaxed">
        <nav className="mb-8 flex items-center justify-between text-sm">
          <Link href="/" className="underline underline-offset-2">
            ← Ver Tele
          </Link>
          <span className="flex gap-3">
            <a href="/about" className="underline underline-offset-2">
              Acerca de
            </a>
            <a href="#es" className="underline underline-offset-2">
              Español
            </a>
            <a href="#en" className="underline underline-offset-2">
              English
            </a>
          </span>
        </nav>
        <Spanish />
        <hr className="my-12 border-border" />
        <English />
      </div>
    </main>
  );
}
