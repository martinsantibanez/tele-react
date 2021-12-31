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
      {featuredSource && <Monitor size={12} source={featuredSource} />}
    </div>
  );
};

export default MonitorPage;
