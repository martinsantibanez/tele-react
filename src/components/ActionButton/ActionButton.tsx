import React, { PropsWithChildren } from 'react';
import classnames from 'classnames/bind';
import styles from './styles.module.scss';

const cx = classnames.bind(styles);
type Props = {
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
};

export function ActionButton({ children, onClick }: PropsWithChildren<Props>) {
  return (
    <button className={`btn ${cx('action-button')}`} onClick={onClick}>
      <span className={cx('button-content')}>{children}</span>
    </button>
  );
}
