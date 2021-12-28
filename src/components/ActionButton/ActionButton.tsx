import React, { PropsWithChildren } from "react";
import classnames from "classnames/bind";
import styles from "./styles.module.scss";

const cx = classnames.bind(styles);
type Props = {};
export function ActionButton({ children }: PropsWithChildren<Props>) {
  return (
    <a>
      <span className={cx("button-content")}>{children}</span>
    </a>
  );
}
