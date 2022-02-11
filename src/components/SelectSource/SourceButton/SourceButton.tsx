import React from "react";
import { Source } from "../../../sources";
import classnames from "classnames/bind";
import styles from "./SourceButton.module.scss";
const cx = classnames.bind(styles);

type Props = {
  source: Source;
  isSelected?: boolean;
  onSelect?: (source: Source) => void;
};
export function SourceButton({ source, onSelect, isSelected }: Props) {
  return (
    <button
      title={source.slug}
      key={source.slug}
      className={cx("btn", "source-button", { selected: isSelected })}
      onClick={() => onSelect && onSelect(source)}
    >
      {source.titleIcons?.length && (
        <span className={cx("icons", "mr-1")}>{source.titleIcons}</span>
      )}
      {source.flag && (
        <span className={cx("icons", "mr-1")}>
          <img src={`https://flagcdn.com/${source.flag}.svg`}></img>
        </span>
      )}
      {source.listTitle ? (
        source.listTitle
      ) : (
        <span
          dangerouslySetInnerHTML={{
            __html: source.titleHtml || "",
          }}
        ></span>
      )}
    </button>
  );
}
