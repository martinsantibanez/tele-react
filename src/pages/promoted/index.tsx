import type { NextPage } from "next";
import Head from "next/head";
import { useMemo } from "react";
import { Monitor } from "../../components/Monitor/Monitor";
import { useFeaturedSource } from "../../hooks/useFeaturedSource";
import { getSource } from "../../sources";

const MonitorPage: NextPage = () => {
  const [featuredSource] = useFeaturedSource();
  const source = useMemo(
    () => (featuredSource ? getSource(featuredSource) : null),
    [featuredSource]
  );

  return (
    <div>
      <Head>
        <title>LIVE</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {source && <Monitor size={12} source={source} />}
    </div>
  );
};

export default MonitorPage;
