import classnames from 'classnames/bind';
import { useMemo } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { useTeleContext } from '../../context/TeleContext';
import { useCustomSources } from '../../hooks/useCustomSources';
import { useFeaturedScreen } from '../../hooks/useFeaturedScreen';
import { DisplayMode } from '../../pages/monitor/types';
import { getSource } from '../../sources';
import { uuid } from '../../utils/uuid';
import styles from './Source.module.scss';
import { SourceOutput } from './SourceOutput/SourceOutput';
const cx = classnames.bind(styles);

export type OnSwitchCb = (left: number, right: number) => void;

type Props = {
  sourceSlug?: string;
  muted?: boolean;
  size: number;
  onChangeClick?: () => void;
  onRemove?: () => void;
  isBeingEdited?: boolean;
  idx: number;
  onSwitch?: OnSwitchCb;
};

export function Source({
  sourceSlug,
  muted = true,
  size,
  onChangeClick,
  onRemove,
  isBeingEdited,
  idx,
  onSwitch
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

  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: 'Monitor',
      canDrag: isEditing,
      item: () => ({
        idx
      }),
      collect: monitor => ({
        isDragging: !!monitor.isDragging()
      })
    }),
    [idx]
  );

  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: 'Monitor',
      collect: monitor => ({
        isOver: !!monitor.isOver()
      }),
      drop: (a: { idx: number }) => {
        if (onSwitch) onSwitch(idx, a.idx);
      }
    }),
    [idx]
  );

  return (
    <div
      className={
        cx(`stream`, { editing: false }) + ` col-${size} position-relative`
      }
      ref={drag}
      style={{ opacity: isDragging ? 0.5 : 1, cursor: 'move' }}
    >
      <div
        className={`w-100 h-100`}
        style={{ opacity: isOver ? 0.1 : 1 }}
        ref={drop}
      >
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
