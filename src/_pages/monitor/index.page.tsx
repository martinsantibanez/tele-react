import type { NextPage } from 'next';
import Head from 'next/head';
import { Monitor } from '../../components/Monitor/Monitor';
import { MainLayout } from '../../layout/MainLayout';

const MonitorPage: NextPage = () => {
  return (
    <MainLayout>
      <Head>
        <title>Ver Tele</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Monitor />
    </MainLayout>
  );
};

export default MonitorPage;
