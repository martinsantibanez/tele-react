import { ApiClient } from '@twurple/api';
import { StaticAuthProvider } from '@twurple/auth';
import { useEffect, useMemo, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import screenfull from 'screenfull';
import useLocalStorageState from 'use-local-storage-state';
import { Button } from '../../../components/ui/button';
import { useTwitchToken } from '../../app/duo/DuoPage';
import { useCustomSources } from '../../hooks/useCustomSources';
import { sourcesCategories, SourceType } from '../../sources';
import { zappingSources } from './ZappingSelector/ZappingConfig';

type Props = {
  selectedSourceSlug: string | undefined;
  onSelect: (source: SourceType) => void;
  onSourceSwap?: () => void;
  invertControl?: boolean;
};

type SelectorCategories = 'tv' | 'zapping' | 'twitch';

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

  const { createSource } = useCustomSources();
  const [twitchSources, setTwitchSources] = useState<SourceType[]>([]);

  const activeCategorySources: SourceType[] = useMemo(() => {
    if (activeCategory === 'tv') {
      return sourcesCategories.flatMap(cat => Object.values(cat.sources));
    } else if (activeCategory === 'twitch') {
      return twitchSources;
    }
    return zappingSources;
  }, [activeCategory, twitchSources]);

  const selectedIndex = activeCategorySources.findIndex(
    src => src.slug === selectedSourceSlug
  );

  const updateSelectedChannel = (index: number) => {
    const source = activeCategorySources[index];
    createSource(source);
    onSelect(source);
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
    if (activeCategory === 'tv') {
      setActiveCategory('twitch');
    } else if (activeCategory === 'twitch') {
      setActiveCategory('zapping');
    } else {
      setActiveCategory('tv');
    }
  };
  const prevCategory = () => {
    if (activeCategory === 'tv') {
      setActiveCategory('zapping');
    } else if (activeCategory === 'twitch') {
      setActiveCategory('tv');
    } else {
      setActiveCategory('twitch');
    }
  };

  useHotkeys('up', () => prevCategory(), { preventDefault: true });
  useHotkeys('down', () => nextCategory(), { preventDefault: true });

  useHotkeys('left', () => prev(), { preventDefault: true });
  useHotkeys('right', () => next(), { preventDefault: true });
  useHotkeys('enter', () => (onSourceSwap ? onSourceSwap() : undefined), {
    preventDefault: true
  });
  useHotkeys('f', () => {
    if (screenfull.isEnabled) screenfull.toggle();
  });

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

        const followedResponse = await apiClient.streams.getFollowedStreams(
          userId
        );

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

  return (
    <div className="w-full h-full flex flex-col justify-center">
      <div className="grid grid-cols-12">
        <div className="w-full flex flex-col gap-3 justify-center pl-3 col-span-2">
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
        </div>
        <div className="flex justify-between items-center col-span-10 w-full">
          <Button
            onClick={() => prev()}
            variant="ghost"
            className="h-full"
            disabled={selectedIndex === 0}
          >
            {'<'}
          </Button>
          {activeCategory === 'twitch' && !accessToken && (
            <a
              href={`https://id.twitch.tv/oauth2/authorize?client_id=${clientId}&redirect_uri=${window.location.href}&response_type=token&scope=user:read:follows`}
            >
              Connect with Twitch
            </a>
          )}
          {isLoadingTwitch && 'Cargando...'}
          {activeCategorySources.map((source, canalIndex) => {
            if (canalIndex < startIndex || canalIndex > endIndex) return null;
            const isActive = source.slug === selectedSourceSlug;

            return (
              <div
                className={isActive ? 'bg-gray-800' : ''}
                onClick={() => {
                  updateSelectedChannel(canalIndex);
                }}
                key={`zp_${source.slug}`}
              >
                <div className="flex flex-col items-center gap-4 p-6">
                  {source.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={source.imageUrl}
                      className="w-[62px] "
                      alt={source.name || ''}
                    />
                  )}
                  <div className="text-lg font-semibold">{source.name}</div>
                </div>
              </div>
            );
          })}
          <Button
            onClick={() => next()}
            variant="ghost"
            className="h-full"
            disabled={selectedIndex === activeCategorySources.length - 1}
          >
            {'>'}
          </Button>
        </div>
      </div>
    </div>
  );
}
