import classnames from "classnames/bind";
import React, { useMemo, useState } from "react";
import { useFeaturedSource } from "../../hooks/useFeaturedSource";
import { getSource, Source } from "../../sources";
import { SelectSourceModal } from "../SelectSource/SelectSourceModal";
import styles from "./Monitor.module.scss";
import { SourceOutput } from "./SourceOutput";
const cx = classnames.bind(styles);

type Props = {
  sourceSlug?: string;
  size: number;
  onChange?: (source: Source) => void;
};
export function Monitor({ sourceSlug, size, onChange }: Props) {
  const [modalOpen, setModalOpen] = useState(false);

  const [, setFeaturedSource] = useFeaturedSource();
  const source = useMemo(
    () => (sourceSlug ? getSource(sourceSlug) : null),
    [sourceSlug]
  );

  const handlePromote = () => {
    setFeaturedSource(source?.slug);
  };

  const handleSelectSource = (source: Source) => {
    if (onChange) onChange(source);
  };

  return (
    <div className={`stream col-${size}`}>
      {source && (
        <div className="w-100 h-100">
          {!!source && <SourceOutput source={source} />}
          {modalOpen && (
            <SelectSourceModal
              onSelect={(source) => handleSelectSource(source)}
              onClose={() => setModalOpen(false)}
              selectedSource={source}
            />
          )}
        </div>
      )}
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
