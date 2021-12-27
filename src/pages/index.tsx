import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import styles from "../styles/Home.module.css";

const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <div className="row">
          <Link href="/layout" passHref>
            <a className="col-5 text-white border border-white pt-2">
              <h2>Layout</h2>
              <p>Programatically created layouts.</p>
            </a>
          </Link>
          <div className="col-2"></div>

          <Link href="/monitor" passHref>
            <a className="col-5 text-white border border-white pt-2">
              <h2>Grid</h2>
              <p>Simple grid</p>
            </a>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Home;
