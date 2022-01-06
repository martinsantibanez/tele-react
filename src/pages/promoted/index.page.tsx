import type { NextPage } from "next";
import Head from "next/head";
import { Monitor } from "../../components/Monitor/Monitor";
import { useFeaturedSource } from "../../hooks/useFeaturedSource";

const MonitorPage: NextPage = () => {
  const [featuredSource] = useFeaturedSource();

  return (
    <div>
      <Head>
        <title>LIVE</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Monitor size={12} sourceSlug={featuredSource} />
    </div>
  );
};

export default MonitorPage;
