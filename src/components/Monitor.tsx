import React from "react";

type Props = {};
export function Monitor({}: Props) {
  return (
    <div className="embed-responsive-item">
      <div className="CAJABoton_SeleccionarSeñales">
        <div className="row no-gutters row-canales" id="los-canales"></div>
        {/* <!--modal listado canales--> */}
        <div className="modal" id="custom-modal">
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-footer FondoTitulo">
                <a>
                  <span
                    className="BotonCierreMenuSeñales waves-effect waves-red"
                    id="custom-close"
                    data-dismiss="modal"
                  >
                    CERRAR MENU
                  </span>
                </a>
              </div>
              <div id="PorFiltrar">
                <div
                  style={{ maxHeight: "calc(90vh - 50px)" }}
                  className="modal-body canales-body"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="BotonLapiz">
        <div className="BotonSeleccionarSeñales2" type="button" id="custom-btn">
          ㅤCAMBIAR SEÑALㅤ
        </div>
      </div>
    </div>
  );
}
