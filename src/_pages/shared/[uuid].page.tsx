import { kv } from '@vercel/kv';
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useAddSavedScreen } from '../../hooks/useSavedScreens';
import { MainLayout } from '../../layout/MainLayout';
import { ScreenType } from '../../types/Monitor';

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
  const addScreen = useAddSavedScreen();
  const router = useRouter();
  useEffect(() => {
    if (!initialScreen) {
      router.push('/monitor');
      return;
    }
    // The nodes carry their own sources, so the whole screen arrives with them
    // — nothing has to be merged into a registry first. It lands as a screen of
    // its own: a shared link is something to look at beside your own screens,
    // not something that replaces the one you were working on.
    addScreen('Compartida', initialScreen);
    router.push('/monitor');
  }, [initialScreen, router, addScreen]);
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
