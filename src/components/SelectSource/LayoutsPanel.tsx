'use client';
import { RotateCcw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { Button } from '../../../components/ui/button';
import { useDisplayConfig } from '../../hooks/useDisplayConfig';
import { useIsTv } from '../../hooks/useIsTv';
import { useSavedGrid } from '../../hooks/useSavedGrid';
import { useZappingSources } from '../../hooks/useZappingChannels';
import {
  useZappingLoginToken,
  useZappingToken
} from '../../hooks/useZappingConfig';
import { useZappingTopGridSources } from '../../hooks/useZappingTopGrid';
import { embeddedSource } from '../../sources';
import {
  DisplayConfig,
  DisplayMode,
  ScreenType,
  SourceNode
} from '../../types/Monitor';
import { defaultGrid } from '../GridDisplay/initialGrid';
import {
  tvZappingPresetScreens,
  zappingPresetScreens
} from '../GridDisplay/zappingPresetScreens';
import { fillSlots } from '../Monitor/predefinedLayouts';
import {
  findLayoutIndex,
  layoutScreenCount,
  possibleLayouts,
  ZAPPING_TOP_NAME,
  zappingTopConfig
} from './layoutOptions';
import { ScreenThumbnail } from './ScreenThumbnail';

const THUMB_WIDTH = 128;
const THUMB_HEIGHT = 72;

/** How long the reset button waits for the second press before giving up. */
const CONFIRM_MS = 3000;

/**
 * The channels a screen starts with: the first Zapping preset once an account
 * is paired — the open-web set is what those replace — and the usual open-web
 * channels otherwise. Zapping nodes carry their source from the live
 * catalogue, as the seeding does (see `useZappingPresetScreens`).
 */
function useDefaultSources(isTv: boolean): SourceNode[] {
  const [loginToken] = useZappingLoginToken();
  const zappingSources = useZappingSources();
  if (!loginToken) return defaultGrid;
  const presets = isTv ? tvZappingPresetScreens : zappingPresetScreens;
  const bySlug = new Map(zappingSources.map(src => [src.slug, src]));
  return presets[0].screen.sources.map(node => {
    const source = node.sourceSlug && bySlug.get(node.sourceSlug);
    return source ? { ...node, source: embeddedSource(source) } : node;
  });
}

const screenCount = (count: number) =>
  count === 1 ? '1 pantalla' : `${count} pantallas`;

/**
 * How the screen on air is divided. Every option is drawn with the channels
 * already on it, so picking one is picking a picture rather than a mode name,
 * and each has a set number of screens. Moving to a smaller one only hides
 * the channels that no longer fit; they are back on the way up again.
 *
 * With Zapping connected, the list ends on the live wall of its most watched
 * channels. Up and down walk the whole list and put each option on air on the
 * spot, like the saved screens tab.
 */
export function LayoutsPanel() {
  const [displayConfig, setDisplayConfig] = useDisplayConfig();
  const [sources, setSources] = useSavedGrid();
  const isTv = useIsTv();
  const [zappingToken] = useZappingToken();
  const defaultSources = useDefaultSources(isTv);

  // Resetting throws away every channel on the screen, so it takes a second
  // press; one left hanging lapses rather than waiting to go off later.
  const [confirmingReset, setConfirmingReset] = useState(false);
  useEffect(() => {
    if (!confirmingReset) return;
    const timeout = setTimeout(() => setConfirmingReset(false), CONFIRM_MS);
    return () => clearTimeout(timeout);
  }, [confirmingReset]);
  const resetSources = () => {
    if (!confirmingReset) {
      setConfirmingReset(true);
      return;
    }
    setSources(defaultSources);
    setConfirmingReset(false);
  };

  const topConfig = zappingTopConfig(isTv);
  const topNodes = useZappingTopGridSources({
    count: topConfig.grid.count ?? 0
  });
  const showTop = !!zappingToken;

  const options: { name: string; config: DisplayConfig; detail: string }[] = [
    ...possibleLayouts.map(layout => ({
      ...layout,
      detail: screenCount(layoutScreenCount(layout.config))
    })),
    ...(showTop
      ? [
          {
            name: ZAPPING_TOP_NAME,
            config: topConfig,
            detail: `Los ${topConfig.grid.count} canales más vistos de Zapping, al momento`
          }
        ]
      : [])
  ];

  const selectedIndex =
    displayConfig.mode === DisplayMode.ZappingTop
      ? showTop
        ? options.length - 1
        : -1
      : findLayoutIndex(displayConfig);

  const select = (index: number) => {
    const option = options[index];
    if (option) setDisplayConfig(option.config);
  };
  const move = (delta: number) =>
    select(
      selectedIndex < 0
        ? 0
        : Math.min(Math.max(selectedIndex + delta, 0), options.length - 1)
    );
  useHotkeys('up', () => move(-1), { preventDefault: true }, [move]);
  useHotkeys('down', () => move(1), { preventDefault: true }, [move]);

  const itemRefs = useRef<(HTMLElement | null)[]>([]);
  useEffect(() => {
    itemRefs.current[selectedIndex]?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  /** What the option would look like with the channels it would show. */
  const previewOf = (config: DisplayConfig): ScreenType =>
    config.mode === DisplayMode.ZappingTop
      ? {
          // Drawn as the grid it fills, with the channels ranking right now.
          config: { ...config, mode: DisplayMode.Grid },
          sources: topNodes
        }
      : { config, sources: fillSlots(sources, layoutScreenCount(config)) };

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col">
      <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto py-1">
        {options.map((option, index) => {
          const isSelected = index === selectedIndex;
          const isTop = option.config.mode === DisplayMode.ZappingTop;
          return (
            <div key={option.name} className="shrink-0">
              {isTop && (
                <div className="mt-2 mb-1 px-1 text-xs font-semibold tracking-wide text-gray-300 uppercase">
                  En vivo
                </div>
              )}
              <button
                type="button"
                ref={el => {
                  itemRefs.current[index] = el;
                }}
                onClick={() => select(index)}
                aria-pressed={isSelected}
                className={`flex w-full items-center gap-3 rounded-sm p-1 text-left outline-none ${
                  isSelected ? 'bg-gray-800' : 'hover:bg-gray-900'
                }`}
              >
                <ScreenThumbnail
                  screen={previewOf(option.config)}
                  width={THUMB_WIDTH}
                  height={THUMB_HEIGHT}
                  className={`flex-none ${isSelected ? 'ring-2 ring-white' : ''}`}
                />
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">
                    {option.name}
                  </div>
                  <div className="text-xs text-gray-400">{option.detail}</div>
                </div>
              </button>
            </div>
          );
        })}
      </div>
      <Button
        variant={confirmingReset ? 'destructive' : 'outline'}
        size="sm"
        onClick={resetSources}
        onBlur={() => setConfirmingReset(false)}
        className="mt-1 shrink-0"
        title="Vuelve a poner los canales de inicio en la pantalla al aire"
      >
        <RotateCcw aria-hidden />
        {confirmingReset
          ? 'Pulsa otra vez para confirmar'
          : 'Restablecer canales'}
      </Button>
    </div>
  );
}
