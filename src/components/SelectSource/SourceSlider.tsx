import { ApiClient } from '@twurple/api';
import { StaticAuthProvider } from '@twurple/auth';
import { Heart, Tv, Video, YoutubeIcon, TwitchIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import useLocalStorageState from 'use-local-storage-state';
import { Button } from '../../../components/ui/button';
import { useTwitchToken } from '../../app/duo/DuoPage';
import { useCustomSources } from '../../hooks/useCustomSources';
import { getAvailableSignals, SignalType, SourceType } from '../../sources';
import { ZappingConfig, zappingSources } from './ZappingSelector/ZappingConfig';
import { useZappingToken } from '../../hooks/useZappingConfig';

const signalIcons: Record<SignalType, typeof Tv> = {
  iframe: Tv,
  m3u8: Video,
  youtube: YoutubeIcon,
  twitch: TwitchIcon
};

type Props = {
  selectedSourceSlug: string | undefined;
  onSelect: (source: SourceType) => void;
  onSourceSwap?: () => void;
  invertControl?: boolean;
};

type SelectorCategories = 'tv' | 'twitch' | 'zapping' | 'favourites';

const categoryOrder: SelectorCategories[] = [
  'tv',
  'twitch',
  'zapping',
  'favourites'
];

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
  onSourceSwap
}: Props) {
  const [activeCategory, setActiveCategory] = useActiveCategory();
  const [accessToken] = useTwitchToken();

  const { createSource, updateSource, toggleFavourite, customSources } =
    useCustomSources();
  const [twitchSources, setTwitchSources] = useState<SourceType[]>([]);
  const [tvSources, setTvSources] = useState<SourceType[]>([]);

  const activeCategorySources: SourceType[] = useMemo(() => {
    if (activeCategory === 'tv') {
      return tvSources;
      // return sourcesCategories.flatMap(cat => Object.values(cat.sources));
    } else if (activeCategory === 'twitch') {
      return twitchSources;
    } else if (activeCategory === 'favourites') {
      return customSources.filter(source => source.favourite);
    }
    return zappingSources;
  }, [activeCategory, tvSources, twitchSources, customSources]);

  const selectedIndex = activeCategorySources.findIndex(
    src => src.slug === selectedSourceSlug
  );

  const updateSelectedChannel = (index: number) => {
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
    updateSelectedChannel(
      Math.min(selectedIndex + 1, activeCategorySources.length - 1)
    );
  };

  const prev = () => {
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

  useHotkeys('up', () => prevCategory(), { preventDefault: true });
  useHotkeys('down', () => nextCategory(), { preventDefault: true });

  useHotkeys('left', () => prev(), { preventDefault: true });
  useHotkeys('right', () => next(), { preventDefault: true });
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
  useHotkeys('tab', () => cycleSignal(), { preventDefault: true });

  const startIndex = Math.max(selectedIndex - 2, 0);
  const endIndex = Math.min(
    activeCategorySources.length - 1,
    selectedIndex + 2
  );

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
        youtubeVideoId: canal.last_youtube_livestreams?.[0],
        twitchAccount: canal.twitch ?? undefined
      }));
      sources.forEach(createSource);
      setTvSources(sources);
    };
    loadSources();
  }, [createSource]);
  const [zappingToken] = useZappingToken();

  return (
    <div className="w-full h-full flex flex-col justify-center">
      <div className="grid grid-cols-12">
        <div className="w-full flex flex-col gap-3 justify-center pl-3 col-span-2">
          <div className="text-[9px] leading-none text-gray-400 text-center">
            ↑ ↓ usa las flechas para navegar ← →
          </div>
          <Button
            variant={activeCategory === 'tv' ? 'default' : 'outline'}
            onClick={() => setActiveCategory('tv')}
          >
            TV
          </Button>
          <Button
            variant={activeCategory === 'twitch' ? 'default' : 'outline'}
            onClick={() => setActiveCategory('twitch')}
          >
            Twitch
          </Button>
          <Button
            variant={activeCategory === 'zapping' ? 'default' : 'outline'}
            onClick={() => setActiveCategory('zapping')}
          >
            Zapping
          </Button>
          <Button
            variant={activeCategory === 'favourites' ? 'default' : 'outline'}
            onClick={() => setActiveCategory('favourites')}
          >
            Favourites
          </Button>
        </div>
        <div className="flex justify-between items-center col-span-10 w-full">
          <Button
            onClick={() => prev()}
            variant="ghost"
            className="h-full flex flex-col items-center gap-0.5"
            disabled={selectedIndex === 0}
          >
            <span>{'<'}</span>
          </Button>
          {activeCategory === 'twitch' && !accessToken && (
            <a
              href={`https://id.twitch.tv/oauth2/authorize?client_id=${clientId}&redirect_uri=${window.location.href}&response_type=token&scope=user:read:follows`}
            >
              Connect with Twitch
            </a>
          )}
          {activeCategory === 'zapping' && !zappingToken && <ZappingConfig />}
          {((activeCategory === 'twitch' && isLoadingTwitch) ||
            (activeCategory === 'tv' && !tvSources.length)) &&
            'Cargando...'}
          {activeCategory === 'favourites' &&
            !activeCategorySources.length &&
            'Sin favoritos'}
          {activeCategorySources.map((source, canalIndex) => {
            if (canalIndex < startIndex || canalIndex > endIndex) return null;
            if (activeCategory === 'zapping' && !zappingToken) return null;
            const isActive = source.slug === selectedSourceSlug;
            const isFavourite =
              source.favourite ??
              customSources.find(s => s.slug === source.slug)?.favourite ??
              false;

            return (
              <div
                className={isActive ? 'bg-gray-800' : ''}
                onClick={() => {
                  updateSelectedChannel(canalIndex);
                }}
                key={`zp_${source.slug}`}
              >
                <div className="flex flex-col items-center gap-4 p-6">
                  <div className="flex items-center gap-1.5">
                    <div className="relative">
                      {source.imageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={source.imageUrl}
                          className="w-[62px] "
                          alt={source.name || ''}
                        />
                      )}
                      <div className="flex flex-col">
                        <button
                          title={
                            isFavourite
                              ? 'Quitar de favoritos'
                              : 'Agregar a favoritos'
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
                              isFavourite
                                ? 'fill-red-500 text-red-500'
                                : 'text-white'
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
                      <div className="flex flex-col items-center gap-1 rounded bg-black/70 p-1 ml-5">
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
                        <span className="text-[9px] leading-none text-gray-300 mt-0.5">
                          TAB
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="text-lg font-semibold">{source.name}</div>
                </div>
              </div>
            );
          })}
          <Button
            onClick={() => next()}
            variant="ghost"
            className="h-full flex flex-col items-center gap-0.5"
            disabled={selectedIndex === activeCategorySources.length - 1}
          >
            <span>{'>'}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
