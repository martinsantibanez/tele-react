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
  onChangeClick?: () => void;
  onRemove?: () => void;
};
export function Monitor({ sourceSlug, size, onChangeClick, onRemove }: Props) {
  const { isEditing } = useTeleContext();

  const [, setFeaturedSource] = useFeaturedSource();
  const source = useMemo(
    () => (sourceSlug ? getSource(sourceSlug) : null),
    [sourceSlug]
  );

  const handlePromote = () => {
    setFeaturedSource(source?.slug);
  };

  const handleChangeClick = () => {
    if (onChangeClick) onChangeClick();
  };

  return (
    <div className={`stream col-${size}`}>
      {source && (
        <div className="w-100 h-100">
          {!!source && <SourceOutput source={source} />}
        </div>
      )}
      {isEditing && (
        <div className={cx("actions-container")}>
          {onChangeClick && (
            <>
              <div className={cx("action-button")} onClick={handleChangeClick}>
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
