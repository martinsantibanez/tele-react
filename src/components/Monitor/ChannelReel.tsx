'use client';
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import {
  SelectorCategories,
  useActiveCategory
} from '../SelectSource/sourceCategories';
import { categoryLabels } from '../SelectSource/CategoryTabs';
import { useTeleContext } from '../../context/TeleContext';
import {
  useAllCategorySources,
  useStockedCategories
} from '../../hooks/useCategorySources';
import { useNowPlayingLabel } from '../../hooks/useNowPlayingLabel';
import { useMediaQuery } from '../../hooks/useViewport';
import { useZappingBand, useZappingCursor } from '../../hooks/useZappingCursor';
import { SourceType } from '../../sources';
import { SourceNode } from '../../types/Monitor';
import { SourceImage } from '../SourceImage';
import { SourceOutput } from './SourceOutput/SourceOutput';

/** Neighbours kept loaded on each side of the channel on air. */
const PRELOAD = 1;

/**
 * Ceiling on how many players are alive at once. Above the preload window it
 * buys the way *back*: a channel just left is still running, so returning to it
 * is as instant as arriving was. Each one is a real stream being pulled, so the
 * ceiling is low.
 */
const MAX_MOUNTED = 6;

/** How far a player nobody is near gets parked, in stage-lengths. */
const PARKED = 2;

/** Move this far and the gesture has picked its axis. */
const CLAIM_PX = 10;

/** Drag past this and letting go changes the channel. */
const COMMIT_PX = 60;

/**
 * A flick commits without going the whole way: past this speed, in pixels per
 * millisecond, letting go still changes the channel.
 */
const FLICK_SPEED = 0.5;

/** However quick it was, a gesture shorter than this is a tap. */
const FLICK_PX = 20;

/**
 * How much of the foot of the picture is left to the player. Every embed draws
 * its controls along the bottom, and a layer over them would mean no pausing
 * and no fullscreen for a thumb.
 */
const CONTROLS_GUTTER = 'max(15%, 48px)';

/**
 * How long the compact channel banner (the horizontal, desktop layout) stays
 * up after a channel change or the last pointer movement, before it fades
 * away — the way the channel banner of an old set-top box would.
 */
const BANNER_HIDE_MS = 3000;

type Props = {
  /** The channel on air, as the screen stores it. */
  node: SourceNode;
  /**
   * Puts a channel on air. Absent on a screen nobody owns — a shared link, the
   * promoted screen — where the reel is a picture of one channel rather than
   * something to zap with.
   */
  onSelectSource?: (source: SourceType) => void;
  /** Down the screen on a phone, across it where there is width to spare. */
  orientation?: 'vertical' | 'horizontal';
  /**
   * How this reel names its channel to the page outside it (see the Monitor's
   * blur/refocus handler). 0 when the reel fills the whole screen; the tile's
   * own index when it is one screen among several, fullscreened in place.
   */
  screenIdx?: number;
  /** Whether the picture is the one filling the screen right now — same as a
   * fullscreened tile gets outside the reel. */
  fullscreen?: boolean;
};

/**
 * Whether the browser is asking us not to pull anything nobody has asked for
 * yet. Preloading two extra live streams is the whole point of the reel, and
 * exactly the wrong thing to do on a metered connection.
 */
function usePreloadBudget() {
  const [budget, setBudget] = useState(PRELOAD);

  useEffect(() => {
    const connection = (
      navigator as Navigator & {
        connection?: {
          saveData?: boolean;
          effectiveType?: string;
          addEventListener?: (type: string, listener: () => void) => void;
          removeEventListener?: (type: string, listener: () => void) => void;
        };
      }
    ).connection;

    const read = () => {
      const thrifty =
        !!connection?.saveData ||
        // A neighbour that will not have buffered by the time it is reached is
        // not a preload, it is a second stream competing with the one on air.
        /(^|-)2g$/.test(connection?.effectiveType ?? '') ||
        // Nothing is being watched, so nothing needs to be ready.
        document.hidden;
      setBudget(thrifty ? 0 : PRELOAD);
    };

    read();
    connection?.addEventListener?.('change', read);
    document.addEventListener('visibilitychange', read);
    return () => {
      connection?.removeEventListener?.('change', read);
      document.removeEventListener('visibilitychange', read);
    };
  }, []);

  return budget;
}

/**
 * The channel above or below the one on air: its mark, its name, and what it is
 * showing. Enough to decide whether to keep going without having to go and look.
 */
function Peek({
  source,
  towards,
  orientation,
  onClick,
  nowPlaying
}: {
  source?: SourceType;
  towards: 'previous' | 'next';
  orientation: 'vertical' | 'horizontal';
  onClick: () => void;
  nowPlaying?: string;
}) {
  const isVertical = orientation === 'vertical';
  const isPrevious = towards === 'previous';
  const Chevron = isVertical
    ? isPrevious
      ? ChevronUp
      : ChevronDown
    : isPrevious
      ? ChevronLeft
      : ChevronRight;

  // The slot keeps its size when there is nothing in it, so the picture does
  // not grow by a strip's worth at the ends of the band.
  if (!source)
    return (
      <div
        className={
          isVertical ? 'h-16 flex-none' : 'w-52 flex-none xl:w-64'
        }
        aria-hidden
      />
    );

  const logoUrl = source.logoUrl ?? source.imageUrl;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${isPrevious ? 'Canal anterior' : 'Canal siguiente'}: ${
        source.name ?? source.slug
      }`}
      className={`group flex flex-none items-center gap-3 overflow-hidden px-3 text-left transition-colors hover:bg-gray-900/70 ${
        isVertical
          ? 'h-16 w-full flex-row'
          : 'w-52 flex-col justify-center gap-2 py-4 text-center xl:w-64'
      }`}
    >
      <Chevron
        size={isVertical ? 18 : 22}
        aria-hidden
        className="flex-none text-gray-500 transition-colors group-hover:text-white"
      />
      <div
        className={`flex items-center justify-center ${
          isVertical ? 'h-11 w-11 flex-none' : 'h-16 w-full'
        }`}
      >
        {/* No fallback: the name is already spelled out below, and a channel
            without a mark saying its name twice reads as a mistake. */}
        <SourceImage
          src={logoUrl}
          alt={source.name ?? ''}
          className="max-h-full max-w-full object-contain"
        />
      </div>
      <div
        className={`min-w-0 ${isVertical ? 'flex-1' : 'w-full'}`}
      >
        <div className="truncate text-sm font-semibold">{source.name}</div>
        {nowPlaying && (
          <div className="truncate text-xs text-gray-400">{nowPlaying}</div>
        )}
      </div>
    </button>
  );
}

/**
 * The desktop layout's banner: one pill docked at the foot of the picture,
 * naming the channel on air with a hint of what a nudge either way brings up
 * — instead of a strip of channel art bolted to each side of the screen. It
 * only earns its keep around a channel change, the way the channel banner of
 * an old set-top box did: up on a change or a stir of the mouse, gone again
 * once the screen has been left alone.
 */
function ZapBanner({
  current,
  previous,
  next,
  nowPlaying,
  visible,
  onPrev,
  onNext
}: {
  current?: SourceType;
  previous?: SourceType;
  next?: SourceType;
  nowPlaying?: string;
  visible: boolean;
  onPrev: () => void;
  onNext: () => void;
}) {
  if (!current) return null;
  const logoUrl = current.logoUrl ?? current.imageUrl;

  return (
    <div
      className={`absolute inset-x-0 bottom-6 z-20 flex justify-center transition-all duration-300 ease-out ${
        visible
          ? 'translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-3 opacity-0'
      }`}
      aria-hidden={!visible}
    >
      <div className="flex items-center gap-1 rounded-full bg-black/70 px-2 py-1.5 text-white backdrop-blur-sm">
        <button
          type="button"
          onClick={onPrev}
          disabled={!previous}
          aria-label={`Canal anterior${
            previous ? `: ${previous.name ?? previous.slug}` : ''
          }`}
          className="flex flex-none items-center gap-1 rounded-full px-2 py-1 text-gray-400 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
        >
          <ChevronLeft size={16} aria-hidden />
          {previous && (
            <span className="max-w-24 truncate text-xs">{previous.name}</span>
          )}
        </button>

        <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">
          <div className="flex h-7 w-7 flex-none items-center justify-center">
            <SourceImage
              src={logoUrl}
              alt=""
              className="max-h-full max-w-full object-contain"
            />
          </div>
          <div className="min-w-0 leading-tight">
            <div className="truncate text-sm font-semibold">
              {current.name}
            </div>
            {nowPlaying && (
              <div className="truncate text-[11px] text-gray-300">
                {nowPlaying}
              </div>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={onNext}
          disabled={!next}
          aria-label={`Canal siguiente${
            next ? `: ${next.name ?? next.slug}` : ''
          }`}
          className="flex flex-none items-center gap-1 rounded-full px-2 py-1 text-gray-400 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
        >
          {next && (
            <span className="max-w-24 truncate text-xs">{next.name}</span>
          )}
          <ChevronRight size={16} aria-hidden />
        </button>
      </div>
    </div>
  );
}

/**
 * Zapping: one channel on air, the one before and the one after it named above
 * and below, and a whole catalogue behind them to run through.
 *
 * What is being walked is the picker's active tab — the band — so the channels
 * are the ones the user is already browsing, and switching bands is switching
 * catalogues. Each band remembers where it was left (`useZappingCursor`), so
 * coming back to one lands on what was playing there rather than at the top.
 *
 * The screen itself keeps a single source, whatever is on air. That is what
 * makes the mode fit the rest of the app: a zapping screen saves, shares, gets
 * promoted and draws its thumbnail like any other, because it *is* one — the
 * reel only decides what sits in its one slot.
 */
export function ChannelReel({
  node,
  onSelectSource,
  orientation = 'vertical',
  screenIdx = 0,
  fullscreen = false
}: Props) {
  const { isEditing } = useTeleContext();
  const [storedCategory, setActiveCategory] = useActiveCategory();
  const bands = useAllCategorySources();
  const stocked = useStockedCategories();
  const [cursors, setCursor] = useZappingCursor();
  const [lastBand, setLastBand] = useZappingBand();
  const nowPlayingLabel = useNowPlayingLabel();
  const preload = usePreloadBudget();
  // A thumb, rather than a touchscreen that happens to be there: a laptop with
  // one still points at things with a mouse, and keeps its clicks.
  const isTouch = useMediaQuery('(pointer: coarse)');
  const swipeable = !!onSelectSource && isTouch;

  /**
   * The catalogue being walked. The picker's tab, whenever that tab is a
   * catalogue — but Layouts is not one, and it is where the reel is switched on
   * from, so arriving would always mean arriving at nothing. Standing there the
   * reel keeps playing the band it was last in and lets the sidebar get on with
   * showing layouts; it is not pushed back onto a catalogue, or the Layouts tab
   * could never be opened again to switch the reel back off.
   */
  const band: SelectorCategories = bands[storedCategory]?.length
    ? storedCategory
    : lastBand && bands[lastBand]?.length
      ? lastBand
      : (stocked[0] ?? storedCategory);

  const sources = useMemo(() => bands[band] ?? [], [bands, band]);

  useEffect(() => {
    if (sources.length) setLastBand(band);
  }, [band, sources.length, setLastBand]);

  const indexBySlug = useMemo(
    () => new Map(sources.map((source, idx) => [source.slug, idx])),
    [sources]
  );

  // Where the reel is standing. The channel on air has the last word — it is
  // what the screen actually holds, and the picker can re-point it from
  // outside — and the band's remembered place is what fills in when the two
  // belong to different catalogues, which is exactly the moment a band has just
  // been switched to.
  const onAirIndex = node.sourceSlug
    ? (indexBySlug.get(node.sourceSlug) ?? -1)
    : -1;
  const rememberedIndex = indexBySlug.get(cursors[band] ?? '') ?? -1;
  const index = onAirIndex >= 0 ? onAirIndex : Math.max(rememberedIndex, 0);

  const current = sources[index];
  const previous = sources[index - 1];
  const next = sources[index + 1];

  // Held in a ref so the effect below is driven by the channel it should be
  // putting on air, and not by the callback being rebuilt on every render of
  // the Monitor above it.
  const selectRef = useRef(onSelectSource);
  selectRef.current = onSelectSource;

  const select = useCallback((source?: SourceType) => {
    if (!source) return;
    selectRef.current?.(source);
  }, []);

  // Switching bands is what brings this about: the screen is still holding a
  // channel from the catalogue just left, so the band's remembered one goes on
  // air. Guarded on the on-air channel being foreign to the band, which stops
  // being true the moment this has done its job.
  useEffect(() => {
    if (!selectRef.current || onAirIndex >= 0) return;
    const target = sources[Math.max(rememberedIndex, 0)];
    if (target) selectRef.current(target);
  }, [onAirIndex, rememberedIndex, sources]);

  // Wherever the channel on air came from — a swipe, a key, or the picker
  // pointing the screen at it from outside the reel — that is where this band
  // was left. Recorded here rather than in `select` so the memory cannot drift
  // away from the screen when something else does the pointing.
  useEffect(() => {
    if (onAirIndex < 0) return;
    setCursor(band, sources[onAirIndex].slug);
  }, [onAirIndex, sources, band, setCursor]);

  const step = useCallback(
    (delta: number) => {
      // Stops at the ends rather than wrapping, like every other list here:
      // holding a key down should settle on the last channel, not cycle.
      const target = sources[index + delta];
      if (target) select(target);
    },
    [sources, index, select]
  );

  /** Moves to the next catalogue with anything in it. */
  const stepBand = useCallback(
    (delta: number) => {
      if (!stocked.length) return;
      const at = stocked.indexOf(band);
      // Standing on an empty band, the nearest stocked one in that direction is
      // where the press should land.
      const from = at === -1 ? (delta > 0 ? -1 : stocked.length) : at;
      const target =
        stocked[(from + delta + stocked.length) % stocked.length];
      if (target) setActiveCategory(target);
    },
    [stocked, band, setActiveCategory]
  );

  // ── What is mounted ───────────────────────────────────────────────────────
  // The window around the cursor, plus whatever is still running from before it
  // got here. Only ever appended to and evicted from, never re-ordered: React
  // moves DOM nodes when a keyed list re-orders, and moving an <iframe> reloads
  // the page inside it — which is the one thing the whole reel exists to avoid.

  const windowSlugs = useMemo(() => {
    const slugs: string[] = [];
    for (let offset = -preload; offset <= preload; offset++) {
      const source = sources[index + offset];
      if (source) slugs.push(source.slug);
    }
    return slugs;
  }, [sources, index, preload]);

  const [mounted, setMounted] = useState<string[]>(windowSlugs);

  useEffect(() => {
    setMounted(current => {
      // A channel the band no longer carries has nothing left to play.
      const live = current.filter(slug => indexBySlug.has(slug));
      const missing = windowSlugs.filter(slug => !live.includes(slug));
      const merged = missing.length ? [...live, ...missing] : live;
      const excess = merged.length - MAX_MOUNTED;
      if (excess <= 0)
        return merged.length === current.length &&
          merged.every((slug, i) => slug === current[i])
          ? current
          : merged;
      // Evict the oldest, but never one the window is asking for.
      const spare = merged.filter(slug => !windowSlugs.includes(slug));
      const evicted = new Set(spare.slice(0, excess));
      return merged.filter(slug => !evicted.has(slug));
    });
  }, [windowSlugs, indexBySlug]);

  // ── Swiping ───────────────────────────────────────────────────────────────
  // Along the reel walks the channels and drags the picture with the thumb;
  // across it changes catalogue, which has nothing to drag and so only reads
  // once the finger is lifted. The axis is settled at the first few pixels and
  // then kept, so a swipe that wanders cannot change its mind halfway.

  const isVertical = orientation === 'vertical';
  const [drag, setDrag] = useState(0);
  const gesture = useRef<{
    id: number;
    x: number;
    y: number;
    at: number;
    axis?: 'along' | 'across';
  } | null>(null);

  const handlePointerDown = (event: React.PointerEvent) => {
    gesture.current = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      at: event.timeStamp
    };
  };

  const handlePointerMove = (event: React.PointerEvent) => {
    const active = gesture.current;
    if (!active || active.id !== event.pointerId) return;
    const dx = event.clientX - active.x;
    const dy = event.clientY - active.y;
    const along = isVertical ? dy : dx;
    const across = isVertical ? dx : dy;

    if (!active.axis) {
      // Under the threshold there is no telling the two apart yet, and a tap
      // that never gets there is not a swipe at all.
      if (Math.abs(along) < CLAIM_PX && Math.abs(across) < CLAIM_PX) return;
      active.axis = Math.abs(across) > Math.abs(along) ? 'across' : 'along';
      // The rest of the gesture belongs here however far it strays, so lifting
      // off the edge of the picture still ends it properly.
      event.currentTarget.setPointerCapture(event.pointerId);
    }

    if (active.axis === 'across') return;
    // Nothing to drag towards at the ends of the band, so the pull goes slack.
    const blocked = along > 0 ? !previous : !next;
    setDrag(blocked ? along / 4 : along);
  };

  const endGesture = (event: React.PointerEvent) => {
    const active = gesture.current;
    gesture.current = null;
    if (!active?.axis) return;
    setDrag(0);
    const dx = event.clientX - active.x;
    const dy = event.clientY - active.y;
    const isBandSwipe = active.axis === 'across';
    // However far it went along the axis it settled on; the other one is noise.
    const moved = isBandSwipe === isVertical ? dx : dy;
    // A short flick counts as much as a long drag: on a picture this size the
    // gesture that means "next" is thrown, not measured out.
    const speed = Math.abs(moved) / Math.max(event.timeStamp - active.at, 1);
    const committed =
      Math.abs(moved) > COMMIT_PX ||
      (Math.abs(moved) > FLICK_PX && speed > FLICK_SPEED);
    if (!committed) return;
    // Swiping down reaches for what is above: the strip follows the finger.
    if (isBandSwipe) stepBand(moved < 0 ? 1 : -1);
    else step(moved > 0 ? -1 : 1);
  };

  // ── Keys ──────────────────────────────────────────────────────────────────
  // Only while the picker is away. Open, it owns all four arrows to walk its
  // own list with, and it is mounted precisely when `isEditing` is on.
  const keysLive = !!onSelectSource && !isEditing;
  const options = { enabled: keysLive, preventDefault: true };

  // Up and down walk the channels, left and right the catalogues — the picker's
  // own arrows, and the ones printed under its tabs. Deliberately *not* turned
  // to match a reel lying on its side: the picker binds these same four keys
  // whenever it is open, and a pair that swapped meaning depending on whether a
  // panel happened to be showing would be worse than one that does not line up
  // with the picture. The swipes below are the ones that follow the layout.
  useHotkeys('up', () => step(-1), options, [step]);
  useHotkeys('down', () => step(1), options, [step]);
  useHotkeys('left', () => stepBand(-1), options, [stepBand]);
  useHotkeys('right', () => stepBand(1), options, [stepBand]);

  // ── Banner (horizontal layout only) ─────────────────────────────────────
  // The vertical layout keeps its strips docked in the flow, always visible,
  // so none of this applies there — `showBanner` is only ever reached from a
  // horizontal reel.
  const [bannerVisible, setBannerVisible] = useState(true);
  const bannerHideTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const showBanner = useCallback(() => {
    setBannerVisible(true);
    if (bannerHideTimer.current) clearTimeout(bannerHideTimer.current);
    bannerHideTimer.current = setTimeout(
      () => setBannerVisible(false),
      BANNER_HIDE_MS
    );
  }, []);

  useEffect(() => {
    if (isVertical) return;
    showBanner();
  }, [isVertical, index, showBanner]);

  useEffect(
    () => () => {
      if (bannerHideTimer.current) clearTimeout(bannerHideTimer.current);
    },
    []
  );

  const revealBanner = useCallback(() => {
    if (isVertical) return;
    showBanner();
  }, [isVertical, showBanner]);

  // ── Drawing ───────────────────────────────────────────────────────────────

  const stage = (
    <div className="relative min-h-0 min-w-0 flex-1 overflow-hidden bg-black">
      {mounted.map(slug => {
        const at = indexBySlug.get(slug);
        if (at === undefined) return null;
        const source = sources[at];
        const isOnAir = at === index;
        // Parked well clear of the stage when it is neither on air nor next in
        // line: still running, still buffered, simply not in the way.
        const offset = Math.max(-PARKED, Math.min(PARKED, at - index));
        const shift = `${offset * 100}%`;
        return (
          <div
            key={slug}
            // How a screen names itself to the page outside it; the Monitor
            // reads it back to bounce focus out of embedded players.
            data-screen-idx={isOnAir ? screenIdx : undefined}
            aria-hidden={!isOnAir}
            className={`absolute inset-0 ${
              isOnAir ? 'z-10' : 'z-0 pointer-events-none'
            } ${drag ? '' : 'transition-transform duration-200 ease-out'}`}
            style={{
              transform: isVertical
                ? `translateY(calc(${shift} + ${drag}px))`
                : `translateX(calc(${shift} + ${drag}px))`
            }}
          >
            <SourceOutput
              source={source}
              // The signal is the screen's choice, and the screen only holds
              // the channel on air; a neighbour plays its own default.
              activeSignal={isOnAir ? node.activeSignal : undefined}
              muted={!isOnAir || (node.muted ?? true)}
              fullscreen={isOnAir && fullscreen}
            />
          </div>
        );
      })}
      {/* Where the swipe is actually caught. Every channel plays inside a
          cross-origin <iframe>, and a touch that lands on one is the iframe's:
          the page around it never hears a pointer event, so handlers on the
          stage below would sit there waiting for a gesture that never arrives.
          A layer over the picture is the only thing that hears it.

          It stops short of the foot of the picture, where the players draw
          their own controls, and it is only there for a thumb: with a mouse it
          would take every click away from the player for a gesture nobody makes
          when the strips above and below are one click each. */}
      {swipeable && (
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 z-20"
          // `none`, not `pan-x`: both axes mean something here, and letting the
          // browser scroll the page with either would cancel the swipe.
          style={{ bottom: CONTROLS_GUTTER, touchAction: 'none' }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endGesture}
          onPointerCancel={endGesture}
        />
      )}
    </div>
  );

  if (!sources.length)
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-1 p-6 text-center text-gray-400">
        <span>No hay canales en {categoryLabels[band]}</span>
        {stocked.length > 0 && (
          <span className="text-xs">← → para cambiar de categoría</span>
        )}
      </div>
    );

  return (
    <div
      className={`relative flex h-full w-full min-h-0 min-w-0 ${
        isVertical ? 'flex-col' : 'flex-row'
      }`}
      onPointerMove={isVertical ? undefined : revealBanner}
    >
      {isVertical ? (
        <>
          <Peek
            source={previous}
            towards="previous"
            orientation={orientation}
            nowPlaying={nowPlayingLabel(previous)}
            onClick={() => step(-1)}
          />
          {stage}
          <Peek
            source={next}
            towards="next"
            orientation={orientation}
            nowPlaying={nowPlayingLabel(next)}
            onClick={() => step(1)}
          />
        </>
      ) : (
        <>
          {stage}
          <ZapBanner
            current={current}
            previous={previous}
            next={next}
            nowPlaying={nowPlayingLabel(current)}
            visible={bannerVisible}
            onPrev={() => step(-1)}
            onNext={() => step(1)}
          />
        </>
      )}
      {/* The band and the place in it, said out loud for anyone who cannot see
          the banner or the strips above and below. */}
      <span className="sr-only" aria-live="polite">
        {categoryLabels[band]}: {current?.name} ({index + 1} de {sources.length})
      </span>
    </div>
  );
}
