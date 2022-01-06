import React from "react";
import { Accordion } from "react-bootstrap";
import { Source, sourcesCategories } from "../../sources";

type Props = {
  onSelect: (source: Source) => void;
  onClose?: () => void;
  selectedSource?: Source;
};
export function SelectSourceModal({
  onSelect,
  onClose,
  selectedSource,
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
              <Accordion defaultActiveKey="0">
                {sourcesCategories.map((sourceCategory, idx) => (
                  <Accordion.Item eventKey={`${idx}`} key={sourceCategory.name}>
                    <Accordion.Header>{sourceCategory.name}</Accordion.Header>
                    <Accordion.Body>
                      {Object.values(sourceCategory.sources).map((source) => (
                        <button
                          title={source.slug}
                          key={source.slug}
                          className={`btn ${
                            source.slug === selectedSource?.slug
                              ? "BotonTV_SeñalSeleccionada"
                              : "BotonTV_Señales"
                          }`}
                          onClick={() => onSelect(source)}
                          dangerouslySetInnerHTML={{
                            __html: source.titleHtml,
                          }}
                        />
                      ))}
                    </Accordion.Body>
                  </Accordion.Item>
                ))}
              </Accordion>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
