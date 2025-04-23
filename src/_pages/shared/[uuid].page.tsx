import { kv } from '@vercel/kv';
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useCustomSources } from '../../hooks/useCustomSources';
import { useDisplayConfig } from '../../hooks/useDisplayConfig';
import { useSavedGrid } from '../../hooks/useSavedGrid';
import { useZappingToken } from '../../hooks/useZappingConfig';
import { MainLayout } from '../../layout/MainLayout';
import { ScreenType } from '../monitor/types';

export const getServerSideProps: GetServerSideProps<{
  initialScreen: ScreenType | null;
}> = async context => {
  console.log(JSON.stringify(context.params));
  const uuid = context.params?.uuid;
  if (typeof uuid !== 'string')
    return {
      notFound: true
    };
  const initialScreen = await kv.get<ScreenType>(uuid);
  if (!initialScreen)
    return {
      redirect: '/monitor',
      props: {
        initialScreen: null
      }
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
  const { setZappingToken } = useZappingToken();
  const { setCustomSources } = useCustomSources();
  const router = useRouter();
  useEffect(() => {
    if (!initialScreen) {
      router.push('/monitor');
      return;
    }
    setSelectedSources(initialScreen.sources);
    setDisplayConfig(initialScreen.config);
    if (initialScreen.customSources)
      setCustomSources(initialScreen.customSources);
    router.push('/monitor');
  }, [
    initialScreen,
    router,
    setDisplayConfig,
    setSelectedSources,
    setZappingToken,
    setCustomSources
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
