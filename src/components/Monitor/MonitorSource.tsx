'use client';
import { useMemo } from 'react';
import { Button } from '../../../components/ui/button';
import { useTeleContext } from '../../context/TeleContext';
import { useCustomSources } from '../../hooks/useCustomSources';
import { useFeaturedScreen } from '../../hooks/useFeaturedScreen';
import { getSource } from '../../sources';
import { SourceOutput } from './SourceOutput/SourceOutput';

export type OnSwitchCb = (left: number, right: number) => void;

type Props = {
  sourceSlug?: string;
  muted?: boolean;
  onChangeClick?: () => void;
  onRemove?: () => void;
  isBeingEdited?: boolean;
  idx: number;
  onSwitch?: OnSwitchCb;
};

export function MonitorSource({
  sourceSlug,
  muted = true,
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

  return (
    <div className="w-full h-full">
      <div className={`w-full h-full relative`}>
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
