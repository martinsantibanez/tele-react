import classnames from 'classnames/bind';
import { useMemo } from 'react';
import { useDrop } from 'react-dnd';
import { useTeleContext } from '../../context/TeleContext';
import { useCustomSources } from '../../hooks/useCustomSources';
import { useFeaturedScreen } from '../../hooks/useFeaturedScreen';
import { getSource } from '../../sources';
import styles from './Source.module.scss';
import { SourceOutput } from './SourceOutput/SourceOutput';
import { Button } from '../../../components/ui/button';
const cx = classnames.bind(styles);

export type OnSwitchCb = (left: number, right: number) => void;

type Props = {
  sourceSlug?: string;
  muted?: boolean;
  // size: number;
  onChangeClick?: () => void;
  onRemove?: () => void;
  isBeingEdited?: boolean;
  idx: number;
  onSwitch?: OnSwitchCb;
};

export function Source({
  sourceSlug,
  muted = true,
  // size,
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

  // const handlePromote = () => {
  //   setFeaturedScreen({
  //     config: {
  //       grid: {
  //         size: 12
  //       },
  //       mode: DisplayMode.Grid,
  //       layout: {}
  //     },
  //     sources: [{ sourceSlug, uuid: uuid(), muted: false }]
  //   });
  // };

  const handleChangeClick = () => {
    if (onChangeClick) onChangeClick();
  };

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
    <div className="w-full h-full">
      <div
        className={`w-full h-full relative`}
        style={{ opacity: isOver ? 0.1 : 1 }}
      >
        <div className="w-full h-full">
          {!!source && <SourceOutput source={source} muted={muted} />}
        </div>
        {isEditing && (
          <div className="absolute top-[1%] h-[20px] leading-[20px] text-center flex justify-end w-full opacity-100 z-[2]">
            {onChangeClick && (
              <>
                <Button
                  variant={isBeingEdited ? 'outline' : 'default'}
                  onClick={handleChangeClick}
                >
                  Cambiar
                </Button>
              </>
            )}
            {onRemove && (
              <Button variant={'destructive'} onClick={onRemove}>
                Quitar
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
