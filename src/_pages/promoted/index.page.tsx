import type { NextPage } from 'next';
import Head from 'next/head';
import { useFeaturedScreen } from '../../hooks/useFeaturedScreen';
import { Screen } from '../../components/Monitor/Screen';

const MonitorPage: NextPage = () => {
  const [screen] = useFeaturedScreen();

  return (
    <div>
      <style global jsx>{`
        html,
        body {
          overflow-y: hidden;
        }
      `}</style>
      <Head>
        <title>LIVE</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Screen screen={screen} />
    </div>
  );
};

export default MonitorPage;
