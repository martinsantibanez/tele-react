import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { useCustomSources } from '../hooks/useCustomSources';
import { useDisplayConfig } from '../hooks/useDisplayConfig';
import { useFeaturedScreen } from '../hooks/useFeaturedScreen';
import { useSavedGrid } from '../hooks/useSavedGrid';
import { useZappingConfig } from '../hooks/useZappingConfig';
import styles from '../styles/Home.module.css';
import { useSavedSelectedItem } from './list/index.page';

function HomeElement({
  description,
  title,
  href,
  openInNewTab
}: {
  title: string;
  description?: string;
  href: string;
  openInNewTab?: boolean;
}) {
  return (
    <div className="row mt-5 text-center">
      <Link href={href} passHref>
        <a
          className="col-12 col-md-4 offset-md-4 btn btn-outline-light pt-2"
          target={openInNewTab ? '_blank' : ''}
        >
          <h3>{title}</h3>
          {description && <p>{description}</p>}
        </a>
      </Link>
    </div>
  );
}

const Home: NextPage = () => {
  const [, , gridStorage] = useSavedGrid();
  const [, , featuredScreenStorage] = useFeaturedScreen();
  const [, , selectedItemStorage] = useSavedSelectedItem();
  const { customSourcesMeta } = useCustomSources();
  const [, , displayConfigStorage] = useDisplayConfig();
  const { zappingConfigMeta } = useZappingConfig();

  const [clearedState, setClearedState] = useState(false);
  const handleClearLocalStorage = () => {
    if (clearedState) {
      setClearedState(false);
      return;
    }
    gridStorage.removeItem();
    selectedItemStorage.removeItem();
    featuredScreenStorage.removeItem();
    customSourcesMeta.removeItem();
    displayConfigStorage.removeItem();
    zappingConfigMeta.removeItem();
    setClearedState(true);
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Ver Tele</title>
        <meta name="description" content="Visor de canales de TV chilena" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <div className="container text-center text-white pt-3">
          <h1>Ver Tele</h1>

          <HomeElement
            href="/monitor"
            title="Monitor"
            description="Monitor personalizable. Filas o layout."
          />
          <HomeElement
            href="/promoted"
            title="Señal Destacada"
            description="Abrelo en otra ventana, y destaca una señal desde la cuadrícula."
          />

          <HomeElement
            href="/list"
            title="Lista"
            description="Elige solo un canal de la lista."
          />
          <div className="row mt-5 text-center">
            <button
              onClick={handleClearLocalStorage}
              className="btn btn-outline-light col-12 col-md-4 offset-md-4"
            >
              {clearedState ? '✅ Borrado' : 'Borrar datos locales'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
