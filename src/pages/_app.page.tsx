import "bootstrap/dist/css/bootstrap.min.css";
import type { AppProps } from "next/app";
import { TeleProvider } from "../context/TeleContext";
import "../styles/globals.css";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <TeleProvider>
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/bootstrap@4.6.0/dist/css/bootstrap.min.css"
        integrity="sha384-B0vP5xmATw1+K9KRQjQERJvTumQW0nPEzvF6L/Z6nronJ3oUOFUFpCjEUQouq2+l"
        crossOrigin="anonymous"
      />
      <Component {...pageProps} />
    </TeleProvider>
  );
}

export default MyApp;
