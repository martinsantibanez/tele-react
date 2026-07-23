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
      <div
        className={`w-full h-full relative box-border ${
          isBeingEdited ? 'border-2 border-slate-400' : ''
        }`}
      >
        <div className="w-full h-full">
          {!!source && <SourceOutput source={source} muted={muted} />}
        </div>
        {/* Drawn as an overlay: the player covers any border on the wrapper. */}
        {!muted && (
          <div
            className="pointer-events-none absolute inset-0 z-[1] box-border"
            style={{
              border: '3px solid transparent',
              borderImage:
                'linear-gradient(135deg, rgba(255,94,0,0.85), rgba(255,0,72,0.6), rgba(255,176,0,0.85)) 1'
            }}
          />
        )}
        {isEditing && (
          <div className="absolute top-[1%] h-[20px] leading-[20px] text-center flex justify-between w-full opacity-100 z-[2]">
            <span className="ml-1 rounded bg-black/70 px-2 font-bold text-white">
              {idx + 1}
            </span>
            <div className="flex">
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
          </div>
        )}
      </div>
    </div>
  );
}
