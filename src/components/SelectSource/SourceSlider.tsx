import { ApiClient } from '@twurple/api';
import { StaticAuthProvider } from '@twurple/auth';
import { Heart, Tv, Video, YoutubeIcon, TwitchIcon } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import useLocalStorageState from 'use-local-storage-state';
import { Button } from '../../../components/ui/button';
import { useTwitchToken } from '../../app/duo/DuoPage';
import { useCustomSources } from '../../hooks/useCustomSources';
import { getAvailableSignals, SignalType, SourceType } from '../../sources';
import { useZappingSources } from '../../hooks/useZappingChannels';
import { useZappingToken } from '../../hooks/useZappingConfig';
import { useYoutubeLiveSources } from '../../hooks/useYoutubeLiveSubs';
import { useYoutubeAuth } from '../../hooks/useYoutubeAuth';
import { useDisplayConfig } from '../../hooks/useDisplayConfig';
import { ZappingConfig } from './ZappingSelector/ZappingConfig';
import { YoutubeConfig } from './YoutubeSelector/YoutubeConfig';
import {
  findLayoutIndex,
  possibleLayouts,
  PossibleLayout
} from './layoutOptions';
import Image from 'next/image';
import {
  COMPACT_ITEM_HEIGHT,
  RowSlider,
  sliderRow
} from '../RowSlider/RowSlider';
import { VirtualList } from '../VirtualList/VirtualList';
import { useSavedScreensRow } from './SavedScreensRow';

/**
 * Height of a source row in the sidebar: the 44px logo box plus its padding.
 * The virtual list needs it up front, so the card is pinned to it.
 */
const SIDEBAR_ROW_HEIGHT = 60;

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
  onSourceSwap?: () => void;
  invertControl?: boolean;
  /**
   * Sidebar layout: the sources are stacked in a column and the categories run
   * across the top, so up/down walk the sources and left/right the categories.
   */
  vertical?: boolean;
};

type SelectorCategories =
  | 'tv'
  | 'twitch'
  | 'zapping'
  | 'youtube'
  | 'favourites'
  | 'layouts';

const categoryOrder: SelectorCategories[] = [
  'tv',
  'zapping',
  'youtube',
  'favourites',
  'twitch',
  'layouts'
];

const categoryLabels: Record<SelectorCategories, string> = {
  tv: 'TV',
  twitch: 'Twitch',
  zapping: 'Zapping',
  youtube: 'YouTube',
  favourites: 'Favoritos',
  layouts: 'Layouts'
};

type Channel = {
  id: string;
  name: string;
  logo: string;
  signals: { type: 'm3u8' | 'iframe' | 'audio'; url: string }[];
  youtube: string | null;
  last_youtube_livestreams?: string[];
  twitch: string | null;
  website: string;
  country: string;
  category: string;
};

const clientId = '0u3rttp1lk618elmdh5sg5b338dlrs';

export const useActiveCategory = () => {
  return useLocalStorageState<SelectorCategories>('_active_category_', {
    defaultValue: 'tv'
  });
};

export function SourceSlider({
  onSelect,
  selectedSourceSlug,
  onSourceSwap,
  vertical
}: Props) {
  const [activeCategory, setActiveCategory] = useActiveCategory();
  const [accessToken] = useTwitchToken();
  const [zappingToken] = useZappingToken();
  const [displayConfig, setDisplayConfig] = useDisplayConfig();
  const isLayouts = activeCategory === 'layouts';
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
  } = useSavedScreensRow({ compact: vertical });
  // Which RowSlider row Tab is on, so D only deletes from the saved row.
  const [activeRowKey, setActiveRowKey] = useState<string | undefined>();

  const { createSource, updateSource, toggleFavourite, customSources } =
    useCustomSources();
  const [twitchSources, setTwitchSources] = useState<SourceType[]>([]);
  const zappingSources = useZappingSources();
  const youtubeSources = useYoutubeLiveSources();
  const { isConnected: youtubeConnected } = useYoutubeAuth();
  const [tvSources, setTvSources] = useState<SourceType[]>([]);

  const activeCategorySources: SourceType[] = useMemo(() => {
    if (activeCategory === 'tv') {
      return tvSources;
      // return sourcesCategories.flatMap(cat => Object.values(cat.sources));
    } else if (activeCategory === 'twitch') {
      return twitchSources;
    } else if (activeCategory === 'youtube') {
      return youtubeSources;
    } else if (activeCategory === 'favourites') {
      return customSources.filter(source => source.favourite);
    } else if (activeCategory === 'layouts') {
      return [];
    }
    return zappingSources;
  }, [
    activeCategory,
    tvSources,
    twitchSources,
    customSources,
    zappingSources,
    youtubeSources
  ]);

  const selectedLayoutIndex = findLayoutIndex(displayConfig);

  // The slider navigates either sources or layouts, depending on the category.
  const selectedIndex = isLayouts
    ? selectedLayoutIndex
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
    createSource(source);
    onSelect(source);
  };

  const selectedSource = activeCategorySources[selectedIndex] as
    | SourceType
    | undefined;
  // The persisted copy is what MonitorSource actually plays, so it's the
  // source of truth for which signal is currently active.
  const persistedSelectedSource = customSources.find(
    src => src.slug === selectedSource?.slug
  );
  const availableSignals = selectedSource
    ? getAvailableSignals(selectedSource)
    : [];
  const activeSignalType =
    persistedSelectedSource?.activeSignalType ?? availableSignals[0];

  const selectSignal = (type: SignalType) => {
    if (!selectedSource) return;
    updateSource(selectedSource.slug, { activeSignalType: type });
  };

  const cycleSignal = () => {
    if (!selectedSource || availableSignals.length < 2) return;
    const currentIdx = activeSignalType
      ? availableSignals.indexOf(activeSignalType)
      : -1;
    const nextType =
      availableSignals[(currentIdx + 1) % availableSignals.length];
    selectSignal(nextType);
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

  // The sources run along the picker's main axis and the categories across it,
  // so which arrows do what follows the orientation.
  const [prevItemKey, nextItemKey, prevCategoryKey, nextCategoryKey] = vertical
    ? ['up', 'down', 'left', 'right']
    : ['left', 'right', 'up', 'down'];

  useHotkeys(prevCategoryKey, () => prevCategory(), { preventDefault: true });
  useHotkeys(nextCategoryKey, () => nextCategory(), { preventDefault: true });

  // Layouts are driven by the RowSlider, which owns its own arrow handling.
  useHotkeys(prevItemKey, () => (isLayouts ? undefined : prev()), {
    preventDefault: true
  });
  useHotkeys(nextItemKey, () => (isLayouts ? undefined : next()), {
    preventDefault: true
  });
  useHotkeys('enter', () => (onSourceSwap ? onSourceSwap() : undefined), {
    preventDefault: true
  });
  useHotkeys(
    'f',
    () => {
      if (!selectedSource) return;
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
  const isZapping = activeCategory === 'zapping';
  const isYoutube = activeCategory === 'youtube';
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
  }, [selectedSourceSlug, activeCategory, isLayouts]);

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
      availableSignals,
      activeSignalType
    ]
  );

  // The horizontal picker only fits a handful of cards, so it renders a window
  // around the selection. The sidebar scrolls the whole list instead.
  const startIndex = Math.max(selectedIndex - 2, 0);
  const endIndex = Math.min(itemCount - 1, selectedIndex + 2);

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
          className={`cursor-pointer ${vertical ? 'p-1' : 'p-3'} ${
            isSelected ? 'bg-gray-800' : ''
          }`}
        >
          <div className="flex flex-col items-center gap-2">
            <Image
              alt={layout.name}
              src={`/img/layout/${layout.imgName}`}
              width={vertical ? 112 : 160}
              height={vertical ? 63 : 90}
              className={
                isSelected ? 'ring-2 ring-white rounded-sm' : undefined
              }
            />
            <div
              className={`font-semibold ${
                vertical ? 'max-w-full truncate text-xs' : 'text-sm'
              }`}
            >
              {layout.name}
            </div>
          </div>
        </div>
      )
    })
  ];

  const [isLoadingTwitch, setIsLoadingTwitch] = useState(false);

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
  }, [accessToken, createSource]);

  useEffect(() => {
    const loadSources = async () => {
      const response = await fetch('/api/channels');
      if (!response.ok) return;
      const { channels }: { channels: Channel[] } = await response.json();
      const sources: SourceType[] = channels.map(canal => ({
        slug: `custom_${canal.id}`,
        name: canal.name,
        imageUrl: canal.logo,
        iframeSrc: canal.signals.find(s => s.type === 'iframe')?.url,
        m3u8Url: canal.signals.find(s => s.type === 'm3u8')?.url,
        youtubeChannelId: canal.youtube ?? undefined,
        twitchAccount: canal.twitch ?? undefined
      }));
      sources.forEach(createSource);
      setTvSources(sources);
    };
    loadSources();
  }, [createSource]);

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

  const categoryButtons = categoryOrder.map(category => (
    <Button
      key={category}
      variant={activeCategory === category ? 'default' : 'outline'}
      onClick={() => setActiveCategory(category)}
      className={vertical ? 'h-8 grow px-2 text-xs' : undefined}
    >
      {categoryLabels[category]}
    </Button>
  ));

  const renderSourceCard = (source: SourceType, canalIndex: number) => {
    const isActive = source.slug === selectedSourceSlug;
    const isFavourite =
      source.favourite ??
      customSources.find(s => s.slug === source.slug)?.favourite ??
      false;

    return (
      <div
        ref={isActive ? selectedItemRef : undefined}
        tabIndex={isActive ? 0 : -1}
        aria-current={isActive}
        className={`cursor-pointer rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-white ${
          vertical ? 'h-full w-full' : ''
        } ${isActive ? 'bg-gray-800' : ''}`}
        onClick={() => {
          updateSelectedChannel(canalIndex);
        }}
        key={`zp_${source.slug}`}
      >
        <div
          className={`flex ${
            vertical
              ? 'h-full flex-row items-center gap-3 p-2'
              : 'flex-col items-center gap-4 p-6'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <div className="relative">
              {source.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={source.imageUrl}
                  className={
                    // Logos come in every aspect ratio; boxing them keeps the
                    // sidebar rows the height the virtual list assumes.
                    vertical ? 'h-[44px] w-[44px] object-contain' : 'w-[62px] '
                  }
                  alt={source.name || ''}
                />
              )}
              <div className="flex flex-col">
                <button
                  title={
                    isFavourite ? 'Quitar de favoritos' : 'Agregar a favoritos'
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
                      isFavourite ? 'fill-red-500 text-red-500' : 'text-white'
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
              <div
                className={`flex items-center gap-1 rounded bg-black/70 p-1 ${
                  vertical ? 'flex-row ml-2' : 'flex-col ml-5'
                }`}
              >
                {availableSignals.map(type => {
                  const Icon = signalIcons[type];
                  return (
                    <button
                      key={type}
                      title={type}
                      onClick={e => {
                        e.stopPropagation();
                        selectSignal(type);
                      }}
                      className={`rounded p-0.5 ${
                        type === activeSignalType
                          ? 'bg-white text-black'
                          : 'text-white'
                      }`}
                    >
                      <Icon size={14} />
                    </button>
                  );
                })}
                <span
                  className={`text-[9px] leading-none text-gray-300 ${
                    vertical ? '' : 'mt-0.5'
                  }`}
                >
                  TAB
                </span>
              </div>
            )}
          </div>
          <div
            className={
              vertical
                ? 'min-w-0 flex-1 truncate text-base font-semibold'
                : 'text-lg font-semibold'
            }
          >
            {source.name}
          </div>
        </div>
      </div>
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
        (activeCategory === 'tv' && !tvSources.length)) &&
        'Cargando...'}
      {activeCategory === 'favourites' &&
        !activeCategorySources.length &&
        'Sin favoritos'}
      {activeCategory === 'youtube' &&
        youtubeConnected &&
        !activeCategorySources.length &&
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

  const sourcesContent = (
    <>
      {sourcesStatus}
      {listedSources.map((source, canalIndex) => {
        if (canalIndex < startIndex || canalIndex > endIndex) return null;
        return renderSourceCard(source, canalIndex);
      })}
      {configPanels}
    </>
  );

  // The sidebar shows the whole catalogue instead of a window around the
  // selection, so it scrolls natively (touch included) and only the rows near
  // the viewport are mounted.
  const verticalSourcesContent = (
    <>
      <div className="shrink-0 text-center">{sourcesStatus}</div>
      {/* Skipped when empty so the config panel stays next to the message
          explaining why the list is empty, instead of at the bottom. */}
      {!!listedSources.length && (
        <VirtualList
          items={listedSources}
          itemHeight={SIDEBAR_ROW_HEIGHT}
          activeIndex={selectedIndex}
          getItemKey={source => source.slug}
          renderItem={(source, index) => renderSourceCard(source, index)}
          className="min-h-0 w-full flex-1"
        />
      )}
      <div className="flex shrink-0 flex-col items-center">{configPanels}</div>
    </>
  );

  const layoutsContent = (
    <div
      className={`flex w-full flex-col gap-2 ${
        // The sidebar rows scroll, so they need the leftover height.
        vertical ? 'min-h-0 flex-1' : ''
      }`}
    >
      {namePrompt}
      {deletePrompt}
      {/* While a prompt is open the keys belong to it, not the rows. */}
      <RowSlider
        rows={layoutRows}
        enabled={!isNaming && !isConfirmingDelete}
        onActiveRowChange={setActiveRowKey}
        vertical={vertical}
      />
    </div>
  );

  const savedScreensHint = isLayouts && (
    <div className="text-[9px] leading-none text-gray-400 text-center">
      S guarda la pantalla actual · D elimina la guardada
    </div>
  );

  if (vertical)
    return (
      <div className="flex h-full w-full flex-col gap-2">
        <div className="flex flex-wrap gap-1">{categoryButtons}</div>
        <div className="text-[9px] leading-none text-gray-400 text-center">
          ← → categorías · ↑ ↓ {isLayouts ? 'layouts' : 'canales'}
        </div>
        {savedScreensHint}
        {isLayouts ? (
          layoutsContent
        ) : (
          <div className="flex min-h-0 flex-1 flex-col">
            <Button
              onClick={() => prev()}
              variant="ghost"
              className="h-6 w-full py-0"
              disabled={selectedIndex <= 0}
            >
              <span>{'∧'}</span>
            </Button>
            <div className="flex min-h-0 flex-1 flex-col">
              {verticalSourcesContent}
            </div>
            <Button
              onClick={() => next()}
              variant="ghost"
              className="h-6 w-full py-0"
              disabled={selectedIndex === itemCount - 1}
            >
              <span>{'∨'}</span>
            </Button>
          </div>
        )}
      </div>
    );

  return (
    <div className="w-full h-full flex flex-col justify-center">
      <div className="grid grid-cols-12">
        <div className="w-full flex flex-col gap-3 justify-center pl-3 col-span-2">
          <div className="text-[9px] leading-none text-gray-400 text-center">
            ↑ ↓ usa las flechas para navegar ← →
          </div>
          {categoryButtons}
          {savedScreensHint}
        </div>
        <div className="flex justify-between items-center col-span-10 w-full">
          {isLayouts && layoutsContent}
          {!isLayouts && (
            <Button
              onClick={() => prev()}
              variant="ghost"
              className="h-full flex flex-col items-center gap-0.5"
              disabled={selectedIndex <= 0}
            >
              <span>{'<'}</span>
            </Button>
          )}
          {!isLayouts && sourcesContent}
          {!isLayouts && (
            <Button
              onClick={() => next()}
              variant="ghost"
              className="h-full flex flex-col items-center gap-0.5"
              disabled={selectedIndex === itemCount - 1}
            >
              <span>{'>'}</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
