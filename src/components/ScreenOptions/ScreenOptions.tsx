import Link from "next/link";
import React, { ChangeEventHandler, CSSProperties } from "react";
import Fullscreen1 from "../../../public/ui_icons/PantallaCompleta_1.svg";
import Fullscreen2 from "../../../public/ui_icons/PantallaCompleta_2.svg";
import { ActionButton } from "../ActionButton/ActionButton";

const buttons: CSSProperties = {
  position: "sticky",
  bottom: "2em",
  width: "100%",
  height: "20px",
  lineHeight: "20px",
  textAlign: "center",
};

type Props = {
  onSizeChange?: ChangeEventHandler<HTMLSelectElement>;
  onSourceAdd?: () => void;
};
export function ScreenOptions({ onSizeChange, onSourceAdd }: Props) {
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
  return (
    <div className="Botones" style={buttons}>
      <div className="SeleccionarStreamsPorFila waves-effect waves-light">
        <select
          title="Streams por fila"
          className="StreamsPorFila"
          id="Stream_por_fila"
          onChange={onSizeChange}
        >
          <option value="6">Por fila</option>
          <option value="12">1 por fila</option>
          <option value="6">2 por fila</option>
          <option value="4">3 por fila</option>
        </select>
      </div>

      <a onClick={() => launchFullScreen()}>
        <span
          // type="button"
          className="Boton_PantallaCompleta waves-effect waves-light"
        >
          <Fullscreen1 style={{ height: "15px", width: "auto" }} />
        </span>
      </a>
      <Link href="/" passHref>
        <ActionButton>ㅤIR A HOMEㅤ</ActionButton>
      </Link>
      <ActionButton onClick={onSourceAdd}>Agregar</ActionButton>

      <a onClick={() => cancelFullScreen()}>
        <span
          // type="button"
          className="Boton_PantallaCompleta waves-effect waves-light"
        >
          ﾠ
          <Fullscreen2 style={{ height: "15px", width: "auto" }} />ﾠ
        </span>
      </a>
    </div>
  );
}
