import classnames from "classnames/bind";
import React, { useMemo, useState } from "react";
import { useTeleContext } from "../../context/TeleContext";
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
  onRemove?: () => void;
};
export function Monitor({ sourceSlug, size, onChange, onRemove }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const { isEditing } = useTeleContext();

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
              selectedSourceSlug={source.slug}
            />
          )}
        </div>
      )}
      {isEditing && (
        <div className={cx("actions-container")}>
          {onChange && (
            <>
              <div
                className={cx("action-button")}
                onClick={() => setModalOpen((v) => !v)}
              >
                CAMBIAR
              </div>
              <div className={cx("action-button")} onClick={handlePromote}>
                DESTACAR
              </div>
            </>
          )}
          {onRemove && (
            <div
              className={cx("action-button", "color-red")}
              onClick={onRemove}
            >
              QUITAR
            </div>
          )}
        </div>
      )}
    </div>
  );
}
