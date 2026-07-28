'use client';
import { useMemo } from 'react';
import { Button } from '../../../components/ui/button';
import { useTeleContext } from '../../context/TeleContext';
import { useCustomSources } from '../../hooks/useCustomSources';
import { getSource } from '../../sources';
import { getSourceShortcutLabel } from '../../utils/sourceShortcut';
import { SourceLogo } from './SourceLogo';
import { SourceOutput } from './SourceOutput/SourceOutput';

export type OnSwitchCb = (left: number, right: number) => void;

type Props = {
  sourceSlug?: string;
  activeSignal?: string;
  muted?: boolean;
  onChangeClick?: () => void;
  onRemove?: () => void;
  isBeingEdited?: boolean;
  isMarkedForSwap?: boolean;
  fullscreen?: boolean;
  idx: number;
};

export function MonitorSource({
  sourceSlug,
  activeSignal,
  muted = true,
  onChangeClick,
  onRemove,
  isBeingEdited,
  isMarkedForSwap,
  fullscreen,
  idx
}: Props) {
  const { isEditing, swapSourceIdx } = useTeleContext();
  const showFocus = isBeingEdited && (isEditing || swapSourceIdx !== undefined);
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
    <div
      className={fullscreen ? 'fixed inset-0 z-50 bg-black' : 'w-full h-full'}
    >
      <div
        className={`w-full h-full relative box-border ${
          showFocus ? 'border-2 border-slate-400' : ''
        }`}
      >
        <div className="w-full h-full">
          {!!source && (
            <SourceOutput
              source={source}
              activeSignal={activeSignal}
              muted={muted}
            />
          )}
        </div>
        {isMarkedForSwap && (
          <div className="pointer-events-none absolute inset-0 z-[3] bg-slate-500/40" />
        )}
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
        {/* Number and logo are one badge, sized to the tile so the mark stays
            legible on a big screen without swamping a small one. The number
            keeps its own type size and centres against the taller mark, so it
            gets its own box rather than riding the button row. */}
        {(isEditing || swapSourceIdx !== undefined) && (
          <div className="absolute left-1 top-[1%] z-[2] flex h-[9%] max-h-11 min-h-5 max-w-[45%] items-center gap-1.5">
            <span className="shrink-0 rounded bg-black/70 px-2 leading-[20px] font-bold text-white">
              {getSourceShortcutLabel(idx)}
            </span>
            {!!source && <SourceLogo source={source} />}
          </div>
        )}
        {(isEditing || swapSourceIdx !== undefined) && (
          <div className="absolute top-[1%] h-[20px] leading-[20px] text-center flex justify-end w-full opacity-100 z-[2]">
            {isEditing && (
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
            )}
          </div>
        )}
      </div>
    </div>
  );
}
