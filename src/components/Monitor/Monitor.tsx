import React, { useState } from "react";
import { Source, sources } from "../../sources";
import { SelectSourceModal } from "./Modal";

type Props = {
  source?: Source;
  size: number;
  onChange: (source: Source) => void;
};
export function Monitor({ source, size, onChange }: Props) {
  const [modalOpen, setModalOpen] = useState(false);

  const handleSelectSource = (source: Source) => {
    onChange(source);
  };

  return (
    <div className={`stream col-${size}`}>
      <div className="CAJABoton_SeleccionarSeñales">
        {!!source && (
          <div
            dangerouslySetInnerHTML={{
              __html: source.codeHtml,
            }}
          />
        )}
        {modalOpen && (
          <SelectSourceModal
            onSelect={(source) => handleSelectSource(source)}
            onClose={() => setModalOpen(false)}
            selectedSource={source}
          />
        )}
      </div>
      <div className="BotonLapiz" onClick={() => setModalOpen((v) => !v)}>
        <div className="BotonSeleccionarSeñales2" id="custom-btn">
          ㅤCAMBIAR SEÑALㅤ
        </div>
      </div>
    </div>
  );
}
