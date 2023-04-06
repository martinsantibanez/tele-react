import { Redis } from '@upstash/redis';
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useDisplayConfig } from '../../hooks/useDisplayConfig';
import { useSavedGrid } from '../../hooks/useSavedGrid';
import { MainLayout } from '../../layout/MainLayout';
import { ScreenType } from '../monitor/types';
import { useZappingConfig } from '../../hooks/useZappingConfig';

export const getServerSideProps: GetServerSideProps<{
  initialScreen: ScreenType;
}> = async context => {
  console.log(JSON.stringify(context.params));
  const redis = Redis.fromEnv();
  const uuid = context.params?.uuid;
  if (typeof uuid !== 'string')
    return {
      notFound: true
    };
  const initialScreen = await redis.get<ScreenType>(uuid);
  if (!initialScreen)
    return {
      notFound: true
    };

  return {
    props: {
      initialScreen: initialScreen
    }
  };
};

const MonitorPage = ({
  initialScreen
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  console.log({ initialScreen });
  const [, setSelectedSources] = useSavedGrid();
  const [, setDisplayConfig] = useDisplayConfig();
  const { setZappingConfig } = useZappingConfig();
  const router = useRouter();
  useEffect(() => {
    setSelectedSources(initialScreen.sources);
    setDisplayConfig(initialScreen.config);
    if (initialScreen.zappingConfig)
      setZappingConfig(initialScreen.zappingConfig);
    router.push('/monitor');
  }, [
    initialScreen.config,
    initialScreen.sources,
    initialScreen.zappingConfig,
    router,
    setDisplayConfig,
    setSelectedSources,
    setZappingConfig
  ]);
  return (
    <MainLayout>
      <Head>
        <title>Ver Tele</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="row">Redirecting...</div>
    </MainLayout>
  );
};

export default MonitorPage;
