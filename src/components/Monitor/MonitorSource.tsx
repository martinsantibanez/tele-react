'use client';
import { Replace } from 'lucide-react';
import { useMemo } from 'react';
import { useTeleContext } from '../../context/TeleContext';
import { useResolveSource } from '../../hooks/useSourceCatalog';
import { useIsTv } from '../../hooks/useIsTv';
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
  isBeingEdited?: boolean;
  isMarkedForSwap?: boolean;
  fullscreen?: boolean;
  /** Whether another tile is filling the screen, with this one behind it. */
  covered?: boolean;
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

/** The picker sidebar's width, in pixels, on a desktop or a TV. */
export const PICKER_WIDTH = 340;

export function MonitorSource({
  sourceSlug,
  storedSource,
  activeSignal,
  onSelect,
  onChangeClick,
  isBeingEdited,
  isMarkedForSwap,
  fullscreen,
  covered,
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
  // Seen from across the room, a 2px border is not there at all.
  const isTv = useIsTv();
  // Behind a fullscreened tile, on a TV, the picture holds still. Nobody can
  // see it, and a box with a couple of hardware decoders cannot spare one for
  // a stream nobody sees — it is the one on air that goes without. Paused
  // rather than unmounted, so leaving fullscreen finds the player already
  // there and only has to catch up with the live edge, not load from nothing.
  // Elsewhere there is decoding to spare, and a tile that keeps running is
  // one that is already current the moment it is back in view.
  const paused = isTv && !!covered;
  // Out of the picker the selected tile is the one that sounds, and its border
  // says so; muted, nothing would mark which tile the arrows are on.
  const showFocus =
    !fullscreen &&
    isBeingEdited &&
    (isEditing || swapSourceIdx !== undefined || isMuted);
  // The tile's own marks are for picking it out of the wall. Fullscreen there
  // is no wall, and with the picker open beside it they would only sit on the
  // picture.
  const showTileChrome =
    !fullscreen && (isEditing || swapSourceIdx !== undefined);
  const resolveSource = useResolveSource();
  const source = useMemo(
    () => resolveSource(sourceSlug, storedSource),
    [resolveSource, sourceSlug, storedSource]
  );

  const handleChangeClick = () => {
    if (onChangeClick) onChangeClick();
  };

  return (
    <div
      // How a screen is named to the page outside it: the iframe trick in the
      // Monitor reads its number back off here.
      data-screen-idx={idx}
      className={fullscreen ? 'fixed inset-0 z-50 bg-black' : 'w-full h-full'}
      // The picker can open beside a fullscreen tile, and the picture makes
      // way for it rather than covering the list.
      style={
        fullscreen && isEditing && !isMobile
          ? { left: PICKER_WIDTH }
          : undefined
      }
    >
      <div
        className={`w-full h-full relative box-border ${
          showFocus
            ? isTv
              ? 'border-4 border-white'
              : 'border-2 border-slate-400'
            : ''
        }`}
      >
        {/* The picture is the screen's own handle. It picks on the way down
            and lets the press carry on, so a player's controls still answer to
            it; the frames that keep their clicks to themselves are caught by
            the focus they steal instead (see the Monitor). */}
        {/* `isolate`, so the tile's own marks stay on top of it. The reel
            layers the channel on air over its parked neighbours, and neither
            it nor its stage is positioned with a z-index of its own — without
            a stacking context here that ordering escapes into the tile's, and
            the picture paints over the overlays below. */}
        <div
          className={`isolate w-full h-full ${onSelect ? 'cursor-pointer' : ''}`}
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
              // On the wall the selected tile still answers a remote's
              // channel keys once the picker is away: nothing on screen
              // says what else they could mean.
              onChannelKey={
                !fullscreen && !covered && !isEditing && isBeingEdited
                  ? onZapChange
                  : undefined
              }
              orientation={isMobile ? 'vertical' : 'horizontal'}
              screenIdx={idx}
              fullscreen={fullscreen}
              paused={paused}
            />
          ) : (
            !!source && (
              <SourceOutput
                source={source}
                activeSignal={activeSignal}
                muted={muted}
                fullscreen={fullscreen}
                paused={paused}
              />
            )
          )}
        </div>
        {isMarkedForSwap && (
          <div className="pointer-events-none absolute inset-0 z-[3] bg-slate-500/40" />
        )}
        {/* Drawn as an overlay: the player covers any border on the wrapper.
            Fullscreen there is only the one picture, so nothing to tell apart. */}
        {!muted && !fullscreen && (
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
        {showTileChrome && (
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
        {showTileChrome && (
          <div className="absolute top-[1%] right-1 z-[2] flex justify-end">
            {/* A phone has no room across a tile a third of its width, and
                the badge to the left already selects. */}
            {isEditing && !isMobile && (
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
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
