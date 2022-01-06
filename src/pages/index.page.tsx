import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import styles from "../styles/Home.module.css";

function HomeElement({
  description,
  title,
  href,
  openInNewTab,
}: {
  title: string;
  description: string;
  href: string;
  openInNewTab?: boolean;
}) {
  return (
    <div className="row mt-5 text-center">
      <Link href={href} passHref>
        <a
          className="col-6 offset-3 text-white border border-white pt-2"
          target={openInNewTab ? "_blank" : ""}
        >
          <h2>{title}</h2>
          <p>{description}</p>
        </a>
      </Link>
    </div>
  );
}

const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>Tele</title>
        <meta name="description" content="Visor de canales de TV chilena" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <div className="container">
          <HomeElement
            href="/layout"
            title="Layout"
            description="Programatically created layouts."
          />

          <HomeElement href="/grid" title="Grid" description="Simple grid" />

          <HomeElement
            href="/promoted"
            title="Monitor"
            description="Watch featured source, selected from Grid or Layout (Open in a new tab)"
          />

          <HomeElement
            href="/list"
            title="List"
            description="Watch a single seource, pick from a list"
          />
        </div>
      </main>
    </div>
  );
};

export default Home;
