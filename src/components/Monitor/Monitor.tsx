import classnames from 'classnames/bind';
import React, { useMemo } from 'react';
import { useTeleContext } from '../../context/TeleContext';
import { useCustomSources } from '../../hooks/useCustomSources';
import { useFeaturedSource } from '../../hooks/useFeaturedSource';
import { getSource } from '../../sources';
import styles from './Monitor.module.scss';
import { SourceOutput } from './SourceOutput';
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
  const { customSources } = useCustomSources();
  const source = useMemo(() => {
    if (sourceSlug) {
      if (sourceSlug.startsWith('custom_')) {
        return customSources?.find(src => src.slug === sourceSlug);
      } else {
        return getSource(sourceSlug);
      }
    }
    return null;
  }, [customSources, sourceSlug]);

  const handlePromote = () => {
    setFeaturedSource(source?.slug);
  };

  const handleChangeClick = () => {
    if (onChangeClick) onChangeClick();
  };

  return (
    <div className={cx(`stream`) + ` col-${size}`}>
      <div className="w-100 h-100">
        {!!source && <SourceOutput source={source} />}
        {isEditing && (
          <div className={cx('actions-container')}>
            {onChangeClick && (
              <>
                <div
                  className={cx('action-button')}
                  onClick={handleChangeClick}
                >
                  CAMBIAR
                </div>
                <div className={cx('action-button')} onClick={handlePromote}>
                  DESTACAR
                </div>
              </>
            )}
            {onRemove && (
              <div
                className={cx('action-button', 'color-red')}
                onClick={onRemove}
              >
                QUITAR
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
