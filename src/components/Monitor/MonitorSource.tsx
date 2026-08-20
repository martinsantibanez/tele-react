'use client';
import { Replace, X } from 'lucide-react';
import { useMemo } from 'react';
import { useTeleContext } from '../../context/TeleContext';
import { useResolveSource } from '../../hooks/useSourceCatalog';
import { useIsMobile } from '../../hooks/useViewport';
import { SourceType } from '../../sources';
import { getSourceShortcutLabel } from '../../utils/sourceShortcut';
import { ChannelReel } from './ChannelReel';
import { SourceLogo } from './SourceLogo';
import { SourceOutput } from './SourceOutput/SourceOutput';

export type OnSwitchCb = (left: number, right: number) => void;

type Props = {
  sourceSlug?: string;
  /** The node's own copy of the source, for anything outside the built-ins. */
  storedSource?: SourceType;
  activeSignal?: string;
  /** Clicking the picture picks the screen, as its number key would. */
  onSelect?: () => void;
  onChangeClick?: () => void;
  onRemove?: () => void;
  isBeingEdited?: boolean;
  isMarkedForSwap?: boolean;
  fullscreen?: boolean;
  /**
   * Puts a channel on this tile, for the zapping reel to surf with while the
   * tile is fullscreen. Set on every tile whenever the feature is on, not only
   * on the fullscreened one: the reel is what the tile draws its picture with
   * from then on, and it only starts *zapping* once the tile fills the screen.
   * See the Monitor.
   */
  onZapChange?: (source: SourceType) => void;
  idx: number;
};

export function MonitorSource({
  sourceSlug,
  storedSource,
  activeSignal,
  onSelect,
  onChangeClick,
  onRemove,
  isBeingEdited,
  isMarkedForSwap,
  fullscreen,
  onZapChange,
  idx
}: Props) {
  const { isEditing, swapSourceIdx, editingSourceIdx, isMuted } =
    useTeleContext();
  // Audio is the app's: whichever screen is selected is the one that plays,
  // and only while the app itself is unmuted. Nothing about it is stored on
  // the tile.
  const muted = isMuted || idx !== editingSourceIdx;
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
  //     sources: [{ sourceSlug, uuid: uuid() }]
  //   });
  // };

  const handleChangeClick = () => {
    if (onChangeClick) onChangeClick();
  };

  return (
    <div
      // How a screen is named to the page outside it: the iframe trick in the
      // Monitor reads its number back off here.
      data-screen-idx={idx}
      className={fullscreen ? 'fixed inset-0 z-50 bg-black' : 'w-full h-full'}
    >
      <div
        className={`w-full h-full relative box-border ${
          showFocus ? 'border-2 border-slate-400' : ''
        }`}
      >
        {/* The picture is the screen's own handle. It picks on the way down
            and lets the press carry on, so a player's controls still answer to
            it; the frames that keep their clicks to themselves are caught by
            the focus they steal instead (see the Monitor). */}
        <div
          className={`w-full h-full ${onSelect ? 'cursor-pointer' : ''}`}
          onPointerDownCapture={onSelect}
        >
          {/* With zapping on, the reel draws the picture whether or not
              anyone is zapping with it. Growing one only on the way into
              fullscreen would swap the player out for a reel — a new
              <iframe>, and the stream reloading at the very moment the viewer
              asked to see it bigger. Mounted all along, fullscreen only wakes
              it up. */}
          {onZapChange ? (
            <ChannelReel
              node={{ sourceSlug, source: storedSource, activeSignal }}
              onSelectSource={fullscreen ? onZapChange : undefined}
              orientation={isMobile ? 'vertical' : 'horizontal'}
              screenIdx={idx}
              fullscreen={fullscreen}
            />
          ) : (
            !!source && (
              <SourceOutput
                source={source}
                activeSignal={activeSignal}
                muted={muted}
                fullscreen={fullscreen}
              />
            )
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
                // One pill, sized and coloured like the number badge across
                // the tile from it, so the two overlays read as a pair rather
                // than as chrome dropped on top of the picture.
                <div className="flex h-5 items-center overflow-hidden rounded bg-black/70 text-white backdrop-blur-sm">
                  {onChangeClick && (
                    <button
                      type="button"
                      onClick={handleChangeClick}
                      className={`flex h-full items-center gap-1 px-2 text-[11px] font-medium transition-colors ${
                        isBeingEdited
                          ? 'bg-white text-black'
                          : 'hover:bg-white/20'
                      }`}
                    >
                      <Replace size={12} />
                      Cambiar
                    </button>
                  )}
                  {onChangeClick && onRemove && (
                    <span className="h-2.5 w-px bg-white/25" />
                  )}
                  {onRemove && (
                    <button
                      type="button"
                      onClick={onRemove}
                      className="flex h-full items-center gap-1 px-2 text-[11px] font-medium transition-colors hover:bg-red-600"
                    >
                      <X size={12} />
                      Quitar
                    </button>
                  )}
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
