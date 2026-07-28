import { ApiClient } from '@twurple/api';
import { StaticAuthProvider } from '@twurple/auth';
import {
  ChevronRight,
  FlaskConical,
  Heart,
  LayoutGrid,
  Tv,
  Video,
  YoutubeIcon,
  TwitchIcon
} from 'lucide-react';
import { ComponentType, useEffect, useMemo, useRef, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { Button } from '../../../components/ui/button';
import { useTwitchToken } from '../../hooks/useTwitchToken';
import { useFavourites } from '../../hooks/useFavourites';
import { useSourceCatalog } from '../../hooks/useSourceCatalog';
import {
  getAvailableSignals,
  Signal,
  SignalType,
  SourceType
} from '../../sources';
import { pruebasSources } from '../../sources/pruebas';
import { useZappingSources } from '../../hooks/useZappingChannels';
import { useZappingToken } from '../../hooks/useZappingConfig';
import { useYoutubeLiveSources } from '../../hooks/useYoutubeLiveSubs';
import { useYoutubeAuth } from '../../hooks/useYoutubeAuth';
import { useDisplayConfig } from '../../hooks/useDisplayConfig';
import { ZappingConfig } from './ZappingSelector/ZappingConfig';
import { ZappingLogo } from './ZappingSelector/ZappingLogo';
import { YoutubeConfig } from './YoutubeSelector/YoutubeConfig';
import {
  findLayoutIndex,
  possibleLayouts,
  PossibleLayout,
  YOUTUBE_LAYOUT_NAME,
  youtubeLayoutConfig
} from './layoutOptions';
import { DisplayMode } from '../../types/Monitor';
import Image from 'next/image';
import {
  COMPACT_ITEM_HEIGHT,
  RowSlider,
  sliderRow
} from '../RowSlider/RowSlider';
import { VirtualList } from '../VirtualList/VirtualList';
import { SourceImage } from '../SourceImage';
import { useSavedScreensRow } from './SavedScreensRow';
import {
  categoryOrder,
  SelectorCategories,
  showPruebas,
  useActiveCategory,
  useOpenCountries
} from './sourceCategories';
import { TvCountryGroup } from './tvChannels';

/**
 * Height of a source row in the sidebar: the 44px logo box plus its padding.
 * The virtual list needs it up front, so the card is pinned to it.
 */
const SIDEBAR_ROW_HEIGHT = 60;

/** Heights of the two headers the TV list mixes in between the channels. */
const COUNTRY_ROW_HEIGHT = 38;
const TV_CATEGORY_ROW_HEIGHT = 24;

/**
 * A row of the TV list: the country headers fold their channels away, and each
 * open country labels its channels by the category the feed gives them.
 */
type TvRow =
  | { kind: 'country'; key: string; group: TvCountryGroup; isOpen: boolean }
  | { kind: 'category'; key: string; label: string }
  | { kind: 'source'; key: string; source: SourceType; sourceIndex: number };

const tvRowHeight = (row: TvRow) => {
  if (row.kind === 'source') return SIDEBAR_ROW_HEIGHT;
  return row.kind === 'country' ? COUNTRY_ROW_HEIGHT : TV_CATEGORY_ROW_HEIGHT;
};

/**
 * The dynamic YouTube display heads that category's list. It rides along as a
 * source so the arrows and the virtual list keep counting plain rows, but it
 * plays nothing: picking it swaps the whole grid for the live tiles.
 */
const YOUTUBE_LIVE_SLUG = '_youtube_live_display_';
const youtubeLiveEntry: SourceType = {
  slug: YOUTUBE_LIVE_SLUG,
  name: YOUTUBE_LAYOUT_NAME
};

/** Hand-written sources for trying things out; they come from no feed. */
const pruebasList = showPruebas ? Object.values(pruebasSources) : [];

const signalIcons: Record<SignalType, typeof Tv> = {
  iframe: Tv,
  m3u8: Video,
  youtube: YoutubeIcon,
  youtubeChannel: YoutubeIcon,
  twitch: TwitchIcon
};

type Props = {
  selectedSourceSlug: string | undefined;
  onSelect: (source: SourceType) => void;
  /** Signal the edited screen is playing; owned by the grid, not the source. */
  activeSignal?: string;
  onSelectSignal?: (key: string) => void;
};

const categoryLabels: Record<SelectorCategories, string> = {
  tv: 'TV',
  twitch: 'Twitch',
  zapping: 'Zapping',
  youtube: 'YouTube',
  favourites: 'Favoritos',
  pruebas: 'Pruebas',
  layouts: 'Layouts'
};

/**
 * The nav shows only these; the label rides along as the accessible name.
 * Zapping brings its own wordmark, so the map is not lucide-only.
 */
const categoryIcons: Record<
  SelectorCategories,
  ComponentType<{ size?: number; 'aria-hidden'?: boolean }>
> = {
  tv: Tv,
  twitch: TwitchIcon,
  zapping: ZappingLogo,
  youtube: YoutubeIcon,
  favourites: Heart,
  pruebas: FlaskConical,
  layouts: LayoutGrid
};

const clientId = '0u3rttp1lk618elmdh5sg5b338dlrs';

export function SourceSlider({
  onSelect,
  selectedSourceSlug,
  activeSignal,
  onSelectSignal
}: Props) {
  const [storedCategory, setActiveCategory] = useActiveCategory();
  // A stored category can stop existing — `pruebas` outside dev — and the
  // picker would then show an empty list no button points at.
  const activeCategory = categoryOrder.includes(storedCategory)
    ? storedCategory
    : 'tv';
  const [accessToken, setTwitchToken] = useTwitchToken();
  const [zappingToken] = useZappingToken();
  const [displayConfig, setDisplayConfig] = useDisplayConfig();
  const isLayouts = activeCategory === 'layouts';
  const isTv = activeCategory === 'tv';
  const isZapping = activeCategory === 'zapping';
  const isYoutube = activeCategory === 'youtube';
  // Picking the live display leaves the edited screen — and so `selectedSourceSlug`
  // — untouched, so the list remembers the caret sat on it. The display mode has
  // the last word: switching to a layout drops the highlight on its own.
  const [youtubeLiveCaret, setYoutubeLiveCaret] = useState(
    displayConfig.mode === DisplayMode.Youtube
  );
  const youtubeLiveSelected =
    isYoutube && youtubeLiveCaret && displayConfig.mode === DisplayMode.Youtube;
  const {
    row: savedScreensRow,
    startSave,
    namePrompt,
    isNaming,
    startDelete,
    confirmDelete,
    cancelDelete,
    deletePrompt,
    isConfirmingDelete
  } = useSavedScreensRow();
  // Which RowSlider row Tab is on, so D only deletes from the saved row.
  const [activeRowKey, setActiveRowKey] = useState<string | undefined>();

  const { favourites, isFavourite, toggleFavourite } = useFavourites();
  const [twitchSources, setTwitchSources] = useState<SourceType[]>([]);
  const zappingSources = useZappingSources();
  const youtubeSources = useYoutubeLiveSources();
  const { isConnected: youtubeConnected } = useYoutubeAuth();
  // The TV feed is fetched once for the whole app, alongside the other
  // catalogues the picker reads from.
  const { tvGroups, bySlug: catalogueBySlug } = useSourceCatalog();
  const [openCountries, setOpenCountries] = useOpenCountries();

  const toggleCountry = (country: string) =>
    setOpenCountries(open =>
      open.includes(country)
        ? open.filter(other => other !== country)
        : [...open, country]
    );

  // The rows the TV list renders, plus the channels they expose: folded-away
  // countries drop out of both, so the arrows only walk what is on screen.
  const { tvRows, tvSources } = useMemo(() => {
    const rows: TvRow[] = [];
    const sources: SourceType[] = [];
    tvGroups.forEach(group => {
      const isOpen = openCountries.includes(group.country);
      rows.push({
        kind: 'country',
        key: `country_${group.country}`,
        group,
        isOpen
      });
      if (!isOpen) return;
      group.categories.forEach(category => {
        rows.push({
          kind: 'category',
          key: `category_${group.country}_${category.category}`,
          label: category.label
        });
        category.sources.forEach(source => {
          rows.push({
            kind: 'source',
            key: source.slug,
            source,
            sourceIndex: sources.length
          });
          sources.push(source);
        });
      });
    });
    return { tvRows: rows, tvSources: sources };
  }, [tvGroups, openCountries]);

  const activeCategorySources: SourceType[] = useMemo(() => {
    if (activeCategory === 'tv') {
      return tvSources;
      // return sourcesCategories.flatMap(cat => Object.values(cat.sources));
    } else if (activeCategory === 'twitch') {
      return twitchSources;
    } else if (activeCategory === 'youtube') {
      return [youtubeLiveEntry, ...youtubeSources];
    } else if (activeCategory === 'favourites') {
      // The stored copy is a snapshot; show the catalogue's when it has one, so
      // a starred channel is listed with its current logo and signals.
      return favourites.map(fav => catalogueBySlug.get(fav.slug) ?? fav);
    } else if (activeCategory === 'pruebas') {
      return pruebasList;
    } else if (activeCategory === 'layouts') {
      return [];
    }
    return zappingSources;
  }, [
    activeCategory,
    tvSources,
    twitchSources,
    favourites,
    catalogueBySlug,
    zappingSources,
    youtubeSources
  ]);

  const selectedLayoutIndex = findLayoutIndex(displayConfig);

  // The slider navigates either sources or layouts, depending on the category.
  const selectedIndex = isLayouts
    ? selectedLayoutIndex
    : youtubeLiveSelected
      ? 0
      : activeCategorySources.findIndex(src => src.slug === selectedSourceSlug);
  const itemCount = isLayouts
    ? possibleLayouts.length
    : activeCategorySources.length;

  const selectLayout = (index: number) => {
    setDisplayConfig(possibleLayouts[index].config);
  };

  const updateSelectedChannel = (index: number) => {
    if (isLayouts) {
      selectLayout(index);
      return;
    }
    const source = activeCategorySources[index];
    if (!source) return;
    if (isYoutube) setYoutubeLiveCaret(source.slug === YOUTUBE_LIVE_SLUG);
    // The live display is not a channel: it takes over the whole grid with the
    // live tiles and leaves the edited screen alone.
    if (source.slug === YOUTUBE_LIVE_SLUG) {
      setDisplayConfig(youtubeLayoutConfig);
      return;
    }
    onSelect(source);
  };

  const selectedSource = activeCategorySources[selectedIndex] as
    SourceType | undefined;
  const availableSignals = selectedSource
    ? getAvailableSignals(selectedSource)
    : [];
  // Nothing stored means the screen is on the source's default, which is the
  // first signal the fallback chain would reach for.
  const activeSignalKey = activeSignal ?? availableSignals[0]?.key;

  // Mirrors of one type are interchangeable, so the picker shows a button per
  // type and the active one counts through the mirrors behind it.
  const signalGroups = availableSignals.reduce<
    { type: SignalType; signals: Signal[] }[]
  >((groups, signal) => {
    const group = groups.find(g => g.type === signal.type);
    if (group) group.signals.push(signal);
    else groups.push({ type: signal.type, signals: [signal] });
    return groups;
  }, []);

  // Tab walks every signal, mirrors included: when a stream is dead the next
  // thing to try is the next mirror, not the next type.
  const cycleSignal = () => {
    if (availableSignals.length < 2) return;
    const currentIdx = availableSignals.findIndex(
      signal => signal.key === activeSignalKey
    );
    onSelectSignal?.(
      availableSignals[(currentIdx + 1) % availableSignals.length].key
    );
  };

  // Clicking the type already playing steps to its next mirror; clicking any
  // other type jumps to that type's primary.
  const selectSignalGroup = (signals: Signal[]) => {
    const currentIdx = signals.findIndex(
      signal => signal.key === activeSignalKey
    );
    const nextIdx = currentIdx === -1 ? 0 : (currentIdx + 1) % signals.length;
    onSelectSignal?.(signals[nextIdx].key);
  };

  const next = () => {
    if (!itemCount) return;
    updateSelectedChannel(Math.min(selectedIndex + 1, itemCount - 1));
  };

  const prev = () => {
    if (!itemCount) return;
    updateSelectedChannel(Math.max(selectedIndex - 1, 0));
  };

  const nextCategory = () => {
    const currentIdx = categoryOrder.indexOf(activeCategory);
    setActiveCategory(categoryOrder[(currentIdx + 1) % categoryOrder.length]);
  };
  const prevCategory = () => {
    const currentIdx = categoryOrder.indexOf(activeCategory);
    setActiveCategory(
      categoryOrder[
        (currentIdx - 1 + categoryOrder.length) % categoryOrder.length
      ]
    );
  };

  // The sources are stacked in a column and the categories run across the top,
  // so up/down walk the sources and left/right the categories.
  useHotkeys('left', () => prevCategory(), { preventDefault: true });
  useHotkeys('right', () => nextCategory(), { preventDefault: true });

  // Layouts are driven by the RowSlider, which owns its own arrow handling.
  useHotkeys('up', () => (isLayouts ? undefined : prev()), {
    preventDefault: true
  });
  useHotkeys('down', () => (isLayouts ? undefined : next()), {
    preventDefault: true
  });
  useHotkeys(
    'f',
    () => {
      // The live display is not a channel, so there is nothing to favourite.
      if (!selectedSource || selectedSource.slug === YOUTUBE_LIVE_SLUG) return;
      toggleFavourite(selectedSource);
    },
    { preventDefault: true }
  );
  useHotkeys(
    's',
    () => {
      if (!isLayouts || isNaming || isConfirmingDelete) return;
      startSave();
    },
    { preventDefault: true },
    [isLayouts, isNaming, isConfirmingDelete, startSave]
  );
  useHotkeys(
    'd',
    () => {
      if (!isLayouts || isNaming || isConfirmingDelete) return;
      if (activeRowKey !== 'saved') return;
      startDelete();
    },
    { preventDefault: true },
    [isLayouts, isNaming, isConfirmingDelete, activeRowKey, startDelete]
  );
  useHotkeys(
    'y',
    () => (isConfirmingDelete ? confirmDelete() : undefined),
    { preventDefault: true },
    [isConfirmingDelete, confirmDelete]
  );
  useHotkeys(
    'n',
    () => (isConfirmingDelete ? cancelDelete() : undefined),
    { preventDefault: true },
    [isConfirmingDelete, cancelDelete]
  );
  // Zapping and YouTube both put a connect/disconnect panel where the signals
  // TAB would otherwise be.
  const isConfigCategory = isZapping || isYoutube;
  const zappingConfigRef = useRef<HTMLDivElement>(null);
  const youtubeConfigRef = useRef<HTMLDivElement>(null);
  const activeConfigRef = isYoutube ? youtubeConfigRef : zappingConfigRef;

  const selectedItemRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (isLayouts) return;
    // In the sidebar the VirtualList keeps the selected row mounted and in
    // view, so focusing it never needs to scroll.
    selectedItemRef.current?.focus({ preventScroll: true });
  }, [selectedSourceSlug, activeCategory, isLayouts, youtubeLiveSelected]);

  const focusActiveConfig = () => {
    activeConfigRef.current?.querySelector('button')?.focus();
  };

  const configNeedsAuth = isYoutube ? !youtubeConnected : !zappingToken;

  // Without a connection there is nothing to browse, so the config is the only
  // thing worth reaching: put the caret on it as soon as the tab opens.
  useEffect(() => {
    if (!isConfigCategory || !configNeedsAuth) return;
    focusActiveConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConfigCategory, configNeedsAuth]);

  useHotkeys(
    'tab',
    e => {
      // In layouts Tab switches rows inside the RowSlider.
      if (isLayouts) return;
      const config = activeConfigRef.current;
      // Inside the config controls Tab keeps its native meaning.
      if (
        isConfigCategory &&
        config &&
        !config.contains(document.activeElement)
      ) {
        e.preventDefault();
        focusActiveConfig();
        return;
      }
      if (isConfigCategory) return;
      e.preventDefault();
      cycleSignal();
    },
    { preventDefault: false },
    [
      isLayouts,
      isConfigCategory,
      isYoutube,
      selectedSource,
      activeSignal,
      onSelectSignal
    ]
  );

  const layoutRows = [
    savedScreensRow,
    sliderRow<PossibleLayout>({
      key: 'layouts',
      items: possibleLayouts,
      selectedIndex: selectedLayoutIndex,
      onSelect: index => selectLayout(index),
      getItemKey: layout => layout.imgName,
      itemHeight: COMPACT_ITEM_HEIGHT,
      renderItem: (layout, { isSelected }) => (
        <div
          className={`cursor-pointer p-1 ${isSelected ? 'bg-gray-800' : ''}`}
        >
          <div className="flex flex-col items-center gap-2">
            <Image
              alt={layout.name}
              src={`/img/layout/${layout.imgName}`}
              width={112}
              height={63}
              className={
                isSelected ? 'ring-2 ring-white rounded-sm' : undefined
              }
            />
            <div className="max-w-full truncate text-xs font-semibold">
              {layout.name}
            </div>
          </div>
        </div>
      )
    })
  ];

  const [isLoadingTwitch, setIsLoadingTwitch] = useState(false);

  // Twitch sends the token back in the fragment of the page that started the
  // flow, which is whichever page is hosting the picker.
  useEffect(() => {
    if (!document.location.hash) return;
    const parsedHash = new URLSearchParams(window.location.hash.substring(1));
    const token = parsedHash.get('access_token');
    if (token) setTwitchToken(token);
  }, [setTwitchToken]);

  useEffect(() => {
    const getFollowing = async () => {
      try {
        setIsLoadingTwitch(true);
        if (!accessToken) return;
        const authProvider = new StaticAuthProvider(clientId, accessToken);
        const apiClient = new ApiClient({ authProvider });

        const currentUserResponse = await fetch(
          'https://api.twitch.tv/helix/users',
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Client-Id': clientId
            }
          }
        );
        const currentUser = await currentUserResponse.json();
        const userId = currentUser.data[0].id;

        const followedResponse =
          await apiClient.streams.getFollowedStreams(userId);

        setTwitchSources(
          await Promise.all(
            followedResponse.data.map(async followed => {
              const avatar = await apiClient.users.getUserById(followed.userId);
              return {
                slug: `custom_twitch-${followed.userName}`,
                name: followed.userName,
                imageUrl: avatar?.profilePictureUrl,
                twitchAccount: followed.userName
              };
            })
          )
        );
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoadingTwitch(false);
      }
    };
    getFollowing();
  }, [accessToken]);

  const youtubeConfigPanel = (
    <div
      ref={youtubeConfigRef}
      className="flex flex-col items-center gap-2 p-3 shrink-0"
    >
      {!youtubeConnected && (
        <span className="text-center text-gray-400">
          Conecta tu cuenta para ver tus canales en vivo
        </span>
      )}
      <YoutubeConfig />
      {youtubeConnected && (
        <span className="text-[9px] leading-none text-gray-400">TAB</span>
      )}
    </div>
  );

  const categoryButtons = categoryOrder.map(category => {
    const Icon = categoryIcons[category];
    const isActive = activeCategory === category;
    return (
      <Button
        key={category}
        variant={isActive ? 'default' : 'outline'}
        onClick={() => setActiveCategory(category)}
        className="h-8 grow px-2 text-xs"
        // The icon carries no text, so the label has to be spelled out for
        // screen readers and pointed out on hover for everyone else.
        aria-label={categoryLabels[category]}
        title={categoryLabels[category]}
        aria-pressed={isActive}
      >
        <Icon size={16} aria-hidden />
      </Button>
    );
  });

  // The live display shares the channels' rows but has no logo, no signals and
  // nothing to favourite, so it gets a card of its own.
  const renderYoutubeLiveCard = (index: number) => (
    <div
      ref={youtubeLiveSelected ? selectedItemRef : undefined}
      tabIndex={youtubeLiveSelected ? 0 : -1}
      aria-current={youtubeLiveSelected}
      className={`h-full w-full cursor-pointer rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-white ${
        youtubeLiveSelected ? 'bg-gray-800' : ''
      }`}
      onClick={() => updateSelectedChannel(index)}
    >
      <div className="flex h-full flex-row items-center gap-3 p-2">
        <div className="flex h-[44px] w-[44px] items-center justify-center">
          <YoutubeIcon size={28} className="text-red-500" />
        </div>
        <div className="min-w-0 flex-1 truncate text-base font-semibold">
          {YOUTUBE_LAYOUT_NAME}
        </div>
      </div>
    </div>
  );

  const renderSourceCard = (source: SourceType, canalIndex: number) => {
    if (source.slug === YOUTUBE_LIVE_SLUG)
      return renderYoutubeLiveCard(canalIndex);

    const isActive = source.slug === selectedSourceSlug && !youtubeLiveSelected;
    const starred = isFavourite(source.slug);

    return (
      <div
        ref={isActive ? selectedItemRef : undefined}
        tabIndex={isActive ? 0 : -1}
        aria-current={isActive}
        className={`h-full w-full cursor-pointer rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-white ${
          isActive ? 'bg-gray-800' : ''
        }`}
        onClick={() => {
          updateSelectedChannel(canalIndex);
        }}
        key={`zp_${source.slug}`}
      >
        <div className="flex h-full flex-row items-center gap-3 p-2">
          <div className="flex items-center gap-1.5">
            <div className="relative">
              {source.imageUrl && (
                <SourceImage
                  src={source.imageUrl}
                  // Logos come in every aspect ratio; boxing them keeps the
                  // sidebar rows the height the virtual list assumes.
                  className="h-[44px] w-[44px] object-contain"
                  alt={source.name || ''}
                  // A dead logo still holds its slot, so the heart pinned to
                  // its corner doesn't land on top of the channel name.
                  fallback={<div className="h-[44px] w-[44px]" />}
                />
              )}
              <div className="flex flex-col">
                <button
                  title={
                    starred ? 'Quitar de favoritos' : 'Agregar a favoritos'
                  }
                  onClick={e => {
                    e.stopPropagation();
                    toggleFavourite(source);
                  }}
                  className="absolute -top-1.5 -left-1.5 rounded-full bg-black/70 p-0.5"
                >
                  <Heart
                    size={14}
                    className={
                      starred ? 'fill-red-500 text-red-500' : 'text-white'
                    }
                  />
                </button>
                {isActive && (
                  <span className="absolute top-1.5 left-3 text-[9px] leading-none text-gray-300 bg-black/70 rounded px-0.5">
                    F
                  </span>
                )}
              </div>
            </div>
            {isActive && availableSignals.length > 1 && (
              <div className="ml-2 flex flex-row items-center gap-1 rounded bg-black/70 p-1">
                {signalGroups.map(({ type, signals }) => {
                  const Icon = signalIcons[type];
                  const currentIdx = signals.findIndex(
                    signal => signal.key === activeSignalKey
                  );
                  const isActiveGroup = currentIdx !== -1;
                  return (
                    <button
                      key={type}
                      title={
                        signals.length > 1
                          ? `${type} (${signals.length} señales)`
                          : type
                      }
                      onClick={e => {
                        e.stopPropagation();
                        selectSignalGroup(signals);
                      }}
                      className={`flex items-center gap-0.5 rounded p-0.5 ${
                        isActiveGroup ? 'bg-white text-black' : 'text-white'
                      }`}
                    >
                      <Icon size={14} />
                      {signals.length > 1 && (
                        <span className="text-[9px] leading-none">
                          {isActiveGroup ? `${currentIdx + 1}/` : ''}
                          {signals.length}
                        </span>
                      )}
                    </button>
                  );
                })}
                <span className="text-[9px] leading-none text-gray-300">
                  TAB
                </span>
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1 truncate text-base font-semibold">
            {source.name}
          </div>
        </div>
      </div>
    );
  };

  const renderTvRow = (row: TvRow) => {
    if (row.kind === 'source')
      return renderSourceCard(row.source, row.sourceIndex);

    if (row.kind === 'category')
      return (
        <div className="flex h-full items-end px-2 pb-0.5 text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
          {row.label}
        </div>
      );

    return (
      <button
        type="button"
        aria-expanded={row.isOpen}
        onClick={() => toggleCountry(row.group.country)}
        className="flex h-full w-full items-center gap-2 border-t border-gray-800 px-1 text-left outline-none hover:bg-gray-800/60 focus-visible:ring-2 focus-visible:ring-white"
      >
        <ChevronRight
          size={16}
          className={`shrink-0 transition-transform ${
            row.isOpen ? 'rotate-90' : ''
          }`}
        />
        <span aria-hidden>{row.group.flag}</span>
        <span className="min-w-0 flex-1 truncate text-sm font-semibold">
          {row.group.label}
        </span>
        <span className="shrink-0 text-xs text-gray-400">
          {row.group.count}
        </span>
      </button>
    );
  };

  // Zapping and YouTube have nothing to list until the account is connected;
  // the indices still line up with `activeCategorySources` because the list is
  // either shown whole or not at all.
  const listedSources =
    (isZapping && !zappingToken) || (isYoutube && !youtubeConnected)
      ? []
      : activeCategorySources;

  const sourcesStatus = (
    <>
      {activeCategory === 'twitch' && !accessToken && (
        <a
          href={`https://id.twitch.tv/oauth2/authorize?client_id=${clientId}&redirect_uri=${window.location.href}&response_type=token&scope=user:read:follows`}
        >
          Connect with Twitch
        </a>
      )}
      {((activeCategory === 'twitch' && isLoadingTwitch) ||
        (isTv && !tvGroups.length)) &&
        'Cargando...'}
      {activeCategory === 'favourites' &&
        !activeCategorySources.length &&
        'Sin favoritos'}
      {isYoutube &&
        youtubeConnected &&
        !youtubeSources.length &&
        'Ningún canal suscrito está en vivo'}
    </>
  );

  const configPanels = (
    <>
      {isZapping && (
        <div
          ref={zappingConfigRef}
          className="flex flex-col items-center gap-2 p-3 shrink-0"
        >
          {!zappingToken && (
            <span className="text-center text-gray-400">
              Conecta tu cuenta para ver los canales
            </span>
          )}
          <ZappingConfig />
          {!!zappingToken && (
            <span className="text-[9px] leading-none text-gray-400">TAB</span>
          )}
        </div>
      )}
      {isYoutube && youtubeConfigPanel}
    </>
  );

  // The TV list carries its headers as rows, so the selection has to be looked
  // up by slug rather than reused from the flat channel index.
  const selectedTvRowIndex = tvRows.findIndex(
    row => row.kind === 'source' && row.source.slug === selectedSourceSlug
  );

  const sourcesList = isTv ? (
    !!tvRows.length && (
      <VirtualList
        items={tvRows}
        itemHeight={tvRowHeight}
        activeIndex={selectedTvRowIndex}
        getItemKey={row => row.key}
        renderItem={row => renderTvRow(row)}
        className="min-h-0 w-full flex-1"
      />
    )
  ) : (
    <VirtualList
      items={listedSources}
      itemHeight={SIDEBAR_ROW_HEIGHT}
      activeIndex={selectedIndex}
      getItemKey={source => source.slug}
      renderItem={(source, index) => renderSourceCard(source, index)}
      className="min-h-0 w-full flex-1"
    />
  );

  // The sidebar shows the whole catalogue, so it scrolls natively (touch
  // included) and only the rows near the viewport are mounted.
  const sourcesContent = (
    <>
      <div className="shrink-0 text-center">{sourcesStatus}</div>
      {/* Skipped when empty so the config panel stays next to the message
          explaining why the list is empty, instead of at the bottom. */}
      {(isTv || !!listedSources.length) && sourcesList}
      <div className="flex shrink-0 flex-col items-center">{configPanels}</div>
    </>
  );

  const layoutsContent = (
    // The sidebar rows scroll, so they need the leftover height.
    <div className="flex min-h-0 w-full flex-1 flex-col gap-2">
      {namePrompt}
      {deletePrompt}
      {/* While a prompt is open the keys belong to it, not the rows. */}
      <RowSlider
        rows={layoutRows}
        enabled={!isNaming && !isConfirmingDelete}
        onActiveRowChange={setActiveRowKey}
      />
    </div>
  );

  const savedScreensHint = isLayouts && (
    <div className="text-[9px] leading-none text-gray-400 text-center">
      S guarda la pantalla actual · D elimina la guardada
    </div>
  );

  return (
    <div className="flex h-full w-full flex-col gap-2">
      <div
        role="group"
        aria-label="Categorías"
        className="flex flex-wrap gap-1"
      >
        {categoryButtons}
      </div>
      <div className="text-[9px] leading-none text-gray-400 text-center">
        ← → categorías · ↑ ↓ {isLayouts ? 'layouts' : 'canales'}
      </div>
      {savedScreensHint}
      {isLayouts ? (
        layoutsContent
      ) : (
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex min-h-0 flex-1 flex-col">{sourcesContent}</div>
        </div>
      )}
    </div>
  );
}
