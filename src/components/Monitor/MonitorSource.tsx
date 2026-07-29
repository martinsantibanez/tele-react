'use client';
import { X } from 'lucide-react';
import { useMemo } from 'react';
import { Button } from '../../../components/ui/button';
import { useTeleContext } from '../../context/TeleContext';
import { useResolveSource } from '../../hooks/useSourceCatalog';
import { useIsMobile } from '../../hooks/useViewport';
import { SourceType } from '../../sources';
import { getSourceShortcutLabel } from '../../utils/sourceShortcut';
import { SourceLogo } from './SourceLogo';
import { SourceOutput } from './SourceOutput/SourceOutput';

export type OnSwitchCb = (left: number, right: number) => void;

type Props = {
  sourceSlug?: string;
  /** The node's own copy of the source, for anything outside the built-ins. */
  storedSource?: SourceType;
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
  storedSource,
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
  const isMobile = useIsMobile();
  const showFocus = isBeingEdited && (isEditing || swapSourceIdx !== undefined);
  const resolveSource = useResolveSource();
  const source = useMemo(
    () => resolveSource(sourceSlug, storedSource),
    [resolveSource, sourceSlug, storedSource]
  );

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
            gets its own box rather than riding the button row.

            It is also the tile's own handle: a thumb has no number keys, and
            the player underneath swallows any tap meant for the tile itself. */}
        {(isEditing || swapSourceIdx !== undefined) && (
          <button
            type="button"
            onClick={handleChangeClick}
            disabled={!onChangeClick}
            aria-label={`Seleccionar pantalla ${getSourceShortcutLabel(idx)}`}
            aria-pressed={isBeingEdited}
            className="absolute left-1 top-[1%] z-[2] flex h-[9%] max-h-11 min-h-5 max-w-[45%] items-center gap-1.5"
          >
            <span
              className={`shrink-0 rounded px-2 leading-[20px] font-bold ${
                isBeingEdited ? 'bg-white text-black' : 'bg-black/70 text-white'
              }`}
            >
              {getSourceShortcutLabel(idx)}
            </span>
            {!!source && <SourceLogo source={source} />}
          </button>
        )}
        {(isEditing || swapSourceIdx !== undefined) && (
          <div className="absolute top-[1%] right-1 z-[2] flex justify-end">
            {isEditing &&
              (isMobile ? (
                // Two words of Spanish do not fit across a tile a third of a
                // phone wide, and the badge to their left already selects.
                onRemove && (
                  <button
                    type="button"
                    onClick={onRemove}
                    aria-label="Quitar pantalla"
                    title="Quitar"
                    className="rounded-full bg-black/60 p-1.5 text-white"
                  >
                    <X size={16} />
                  </button>
                )
              ) : (
                <div className="flex h-[20px] leading-[20px]">
                  {onChangeClick && (
                    <Button
                      variant={isBeingEdited ? 'outline' : 'default'}
                      onClick={handleChangeClick}
                    >
                      Cambiar
                    </Button>
                  )}
                  {onRemove && (
                    <Button variant={'destructive'} onClick={onRemove}>
                      Quitar
                    </Button>
                  )}
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
