import React from "react";
import { Source } from "../../sources";
import { SourceAccordionList } from "./SourceAccordionList";

type Props = {
  onSelect: (source: Source) => void;
  onClose?: () => void;
  selectedSourceSlug?: string;
};
export function SelectSourceModal({
  onSelect,
  onClose,
  selectedSourceSlug,
}: Props) {
  return (
    <div className="modal" id="custom-modal" style={{ display: "block" }}>
      <div className="modal-dialog modal-xl">
        <div className="modal-content">
          {onClose && (
            <div className="modal-footer FondoTitulo">
              <a>
                <span
                  className="BotonCierreMenuSeñales waves-effect waves-red"
                  id="custom-close"
                  data-dismiss="modal"
                  onClick={onClose}
                >
                  CERRAR MENU
                </span>
              </a>
            </div>
          )}
          <div id="PorFiltrar">
            <div
              style={{ maxHeight: "calc(90vh - 50px)" }}
              className="modal-body canales-body"
            >
              <SourceAccordionList
                onSelect={onSelect}
                selectedSourceSlug={selectedSourceSlug}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
