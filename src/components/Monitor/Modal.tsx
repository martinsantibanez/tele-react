import React from "react";
import { Source, sourcesCategories } from "../../sources";

type Props = {
  onSelect: (source: Source) => void;
  onClose: () => void;
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
          <div id="PorFiltrar">
            <div
              style={{ maxHeight: "calc(90vh - 50px)" }}
              className="modal-body canales-body"
            >
              {sourcesCategories.map((sourceCategory) => (
                <div key={sourceCategory.name}>
                  {sourceCategory.name}
                  <div>
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
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
