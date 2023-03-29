import classnames from 'classnames/bind';
import { useMemo } from 'react';
import { useTeleContext } from '../../context/TeleContext';
import { useCustomSources } from '../../hooks/useCustomSources';
import { useFeaturedScreen } from '../../hooks/useFeaturedScreen';
import { DisplayMode } from '../../pages/monitor/types';
import { getSource } from '../../sources';
import { uuid } from '../../utils/uuid';
import styles from './Monitor.module.scss';
import { SourceOutput } from './SourceOutput/SourceOutput';
const cx = classnames.bind(styles);

type Props = {
  sourceSlug?: string;
  muted?: boolean;
  size: number;
  onChangeClick?: () => void;
  onRemove?: () => void;
  isBeingEdited?: boolean;
};

export function Monitor({
  sourceSlug,
  muted = true,
  size,
  onChangeClick,
  onRemove,
  isBeingEdited
}: Props) {
  const { isEditing } = useTeleContext();
  const [, setFeaturedScreen] = useFeaturedScreen();
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
    setFeaturedScreen({
      config: {
        grid: {
          size: 12
        },
        mode: DisplayMode.Grid,
        layout: {}
      },
      sources: [{ sourceSlug, uuid: uuid(), muted: false }]
    });
  };

  const handleChangeClick = () => {
    if (onChangeClick) onChangeClick();
  };

  return (
    <div
      className={
        cx(`stream`, { editing: false }) + ` col-${size} position-relative`
      }
    >
      <div className="w-100 h-100">
        <div className={cx({ editing: isBeingEdited }) + ' w-100 h-100'}>
          {!!source && <SourceOutput source={source} muted={muted} />}
        </div>
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
