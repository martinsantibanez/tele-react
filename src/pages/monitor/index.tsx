import type { NextPage } from "next";
import Head from "next/head";
import { ChangeEventHandler, CSSProperties, useState } from "react";
import { Monitor } from "../../components/Monitor/Monitor";
import { Source } from "../../sources";
import { especialesSources, tvNacionalSources } from "../../sources/all";

const bigPlayer: CSSProperties = {
  width: "50%",
  float: "left",
};

const bottomContainer: CSSProperties = {
  width: "100%",
  height: "33.333333333%",
  float: "left",
  position: "relative",
};
const smallPlayer: CSSProperties = {
  width: "33.3333333333%",
  float: "left",
};

const buttons: CSSProperties = {
  position: "absolute",
  bottom: "0.5em",
  width: "100%",
  height: "20px",
  lineHeight: "20px",
  textAlign: "center",
};
const reloadStyle: CSSProperties = {
  position: "absolute",
  bottom: "0.3em",
  right: "0.3em",
  width: "auto",
  height: "25px",
  lineHeight: "25px",
  textAlign: "left",
};

const MonitorPage: NextPage = () => {
  const launchFullScreen = () => {
    const element: any = document.documentElement;
    if (element.requestFullScreen) {
      element.requestFullScreen();
    } else if (element.mozRequestFullScreen) {
      element.mozRequestFullScreen();
    } else if (element.webkitRequestFullScreen) {
      element.webkitRequestFullScreen();
    }

    if (element.requestFullScreen) {
      element.requestFullScreen();
    }
  };
  // Lanza en pantalla completa en navegadores que lo soporten
  const cancelFullScreen = () => {
    if ((document as any).cancelFullScreen) {
      (document as any).cancelFullScreen();
    } else if ((document as any).mozCancelFullScreen) {
      (document as any).mozCancelFullScreen();
    } else if ((document as any).webkitCancelFullScreen) {
      (document as any).webkitCancelFullScreen();
    }
  };
  const [size, setSize] = useState(6);

  const handleSizeChange: ChangeEventHandler<HTMLSelectElement> = (event) => {
    console.log(event.target.value);
    setSize(Number(event.target.value));
  };

  const [selectedSources, setSelectedSources] = useState<Source[]>([
    tvNacionalSources["24HTVN"],
    tvNacionalSources.T13_YT,
    tvNacionalSources.CHV_WEB_IFRAME,
    especialesSources.MEDIABANCO_IFRAME,
  ]);

  return (
    <div>
      <Head>
        <title>Monitor</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="row no-gutters row-canales" id="los-canales">
        {selectedSources.map((source, idx) => (
          <Monitor size={size} source={source} key={`${source.slug}_${idx}`} />
        ))}
      </div>

      <div className="Botones" style={buttons}>
        <div className="SeleccionarStreamsPorFila waves-effect waves-light">
          <select
            title="Streams por fila"
            className="StreamsPorFila"
            id="Stream_por_fila"
            onChange={handleSizeChange}
          >
            <option value="4">STREAMS</option>
            <option value="12">1 STREAM</option>
            <option value="6">2 STREAMS</option>
            <option value="4">3 STREAMS</option>
          </select>
        </div>

        <a onClick={() => launchFullScreen()}>
          <span
            // type="button"
            className="Boton_PantallaCompleta waves-effect waves-light"
          >
            ﾠ
            {/* <img
              style={{ height: "15px", width: "auto" }}
              src="imagenes/PantallaCompleta_1.svg"
            ></img> */}
            ﾠ
          </span>
        </a>

        <a href="HomeAINM.html">
          <span className="TEXTO_BotonIrAHome waves-effect waves-light">
            ㅤIR A HOMEㅤ
          </span>
        </a>

        <a onClick={() => cancelFullScreen()}>
          <span
            // type="button"
            className="Boton_PantallaCompleta waves-effect waves-light"
          >
            ﾠ
            {/* <img
              style={{ height: "15px", width: "auto" }}
              src="imagenes/PantallaCompleta_2.svg"
            ></img> */}
            ﾠ
          </span>
        </a>
      </div>
      <div style={reloadStyle}>
        <a href="javascript:location.reload()">
          <span
            // type="button"
            className="BotonRecargarPagina"
          >
            {/* <img
              style={{ height: "25px", width: "auto" }}
              src="imagenes/Icono_Recargar.svg"
            ></img> */}
          </span>
        </a>
      </div>
    </div>
  );
};

export default MonitorPage;
