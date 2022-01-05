import classnames from "classnames/bind";
import React, { useState } from "react";
import { useFeaturedSource } from "../../hooks/useFeaturedSource";
import { Source } from "../../sources";
import { SelectSourceModal } from "./Modal";
import styles from "./Monitor.module.scss";
const cx = classnames.bind(styles);

type Props = {
  source?: Source;
  size: number;
  onChange?: (source: Source) => void;
};
export function Monitor({ source, size, onChange }: Props) {
  const [modalOpen, setModalOpen] = useState(false);

  const [, setFeaturedSource] = useFeaturedSource();

  const handlePromote = () => {
    setFeaturedSource(source?.slug);
  };

  const handleSelectSource = (source: Source) => {
    if (onChange) onChange(source);
  };

  return (
    <div className={`stream col-${size}`}>
      <div className="w-100 h-100">
        {!!source && source.codeHtml && (
          <div
            dangerouslySetInnerHTML={{
              __html: source.codeHtml,
            }}
          />
        )}
        {!!source && source.component}
        {modalOpen && (
          <SelectSourceModal
            onSelect={(source) => handleSelectSource(source)}
            onClose={() => setModalOpen(false)}
            selectedSource={source}
          />
        )}
      </div>
      {onChange && (
        <div className={cx("actions-container")}>
          <div
            className={cx("action-button")}
            onClick={() => setModalOpen((v) => !v)}
          >
            ㅤCAMBIAR SEÑALㅤ
          </div>
          <div className={cx("action-button")} onClick={handlePromote}>
            ㅤDESTACARㅤ
          </div>
        </div>
      )}
    </div>
  );
}
