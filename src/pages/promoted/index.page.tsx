import type { NextPage } from 'next';
import Head from 'next/head';
import { useFeaturedScreen } from '../../hooks/useFeaturedSource';
import { Screen } from '../monitor/Screen';

const MonitorPage: NextPage = () => {
  const [screen] = useFeaturedScreen();

  return (
    <div>
      <Head>
        <title>LIVE</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Screen screen={screen} />
    </div>
  );
};

export default MonitorPage;
