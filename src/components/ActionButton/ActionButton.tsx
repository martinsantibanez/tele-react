import React, { PropsWithChildren } from "react";
import classnames from "classnames/bind";
import styles from "./styles.module.scss";

const cx = classnames.bind(styles);
type Props = {
  href?: string
  onClick?: React.MouseEventHandler<HTMLButtonElement>
};

export function ActionButton({ children, href, onClick }: PropsWithChildren<Props>) {
  return (
    <button className="btn" onClick={onClick}>
      <span className={cx("button-content")}>{children}</span>
    </button>
  );
}
