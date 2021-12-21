import React, { useState } from "react";
import { Source, sources } from "../../sources";
import { SelectSourceModal } from "./Modal";

type Props = {
  source?: Source;
  size: number;
};
export function Monitor({ source, size }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSource, setSelectedSource] = useState<Source | undefined>(
    source
  );

  const handleSelectSource = (source: Source) => {
    if (selectedSource?.slug === source.slug) {
      setSelectedSource(undefined);
    } else {
      setSelectedSource(source);
    }
  };

  return (
    <div className={`stream col-${size}`}>
      <div className="CAJABoton_SeleccionarSeñales">
        {!!selectedSource && (
          <div
            dangerouslySetInnerHTML={{
              __html: selectedSource.codeHtml,
            }}
          />
        )}
        {modalOpen && (
          <SelectSourceModal
            onSelect={(source) => handleSelectSource(source)}
            onClose={() => setModalOpen(false)}
            selectedSource={selectedSource}
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
