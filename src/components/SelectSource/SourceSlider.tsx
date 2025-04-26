import { useEffect, useMemo, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import screenfull from 'screenfull';
import { Button } from '../../../components/ui/button';
import { useCustomSources } from '../../hooks/useCustomSources';
import { sourcesCategories, SourceType } from '../../sources';
import { ZappingConfig, zappingSources } from './ZappingSelector/ZappingConfig';
import { StaticAuthProvider } from '@twurple/auth';
import { ApiClient, HelixStream } from '@twurple/api';

type Props = {
  selectedSourceSlug: string | undefined;
  onSelect: (source: SourceType) => void;
  onSourceSwap?: () => void;
};

type SelectorCategories = 'tv' | 'zapping' | 'twitch';

const clientId = '0u3rttp1lk618elmdh5sg5b338dlrs';

export function SourceSlider({
  onSelect,
  selectedSourceSlug,
  onSourceSwap
}: Props) {
  const [activeCategory, setActiveCategory] =
    useState<SelectorCategories>('zapping');

  const { createSource, customSources } = useCustomSources();
  const twitchSources = customSources.filter(source => !!source.twitchAccount);
  const [followedChannels, setFollowedChannels] = useState<HelixStream[]>();

  const activeCategorySources: SourceType[] = useMemo(() => {
    if (activeCategory === 'tv') {
      return sourcesCategories.flatMap(cat => Object.values(cat.sources));
    } else if (activeCategory === 'twitch') {
      return (
        followedChannels?.map(followed => {
          // createSource();
          return {
            slug: `custom_twitch-${followed.userName}`,
            name: followed.userName,
            imageUrl: followed.getThumbnailUrl(62, 62),
            twitchAccount: followed.userName
            
          };
        }) || []
      );
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

  let accessToken: string | null | undefined;
  if (document.location.hash) {
    const parsedHash = new URLSearchParams(window.location.hash.substring(1));
    if (parsedHash.get('access_token')) {
      accessToken = parsedHash.get('access_token');
    }
  }

  useEffect(() => {
    const getFollowing = async () => {
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
      setFollowedChannels(followedResponse.data);
      for (const followed of followedResponse.data) {
        const source: SourceType = {
          slug: `custom_twitch-${followed.userName}`,
          twitchAccount: followed.userName
        };
        createSource(source);
      }
    };
    getFollowing();
  }, [createSource]);

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
              href={`https://id.twitch.tv/oauth2/authorize?client_id=${clientId}&redirect_uri=http://localhost:3002/duo&response_type=token&scope=user:read:follows`}
            >
              Connect with Twitch
            </a>
          )}
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
                  <img src={source.imageUrl} />
                  {/* <div className="space-y-1"> */}
                  <div className="text-lg font-semibold">{source.name}</div>
                  {/* </div> */}
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
      <div className="flex">
        <div className="mt-3 flex flex-col mw-300 mr-6">
          <div>Keyboard shortcuts</div>
          <div className="flex flex-row gap-3">
            <div>
              <span className="font-bold text-xl">E</span> Toggle Edit Mode
            </div>
            <div>
              <span className="font-bold text-xl">Arrows</span> Preview
              Next/Previous source
            </div>
            <div>
              <span className="font-bold text-xl">Enter</span> Swap sources
            </div>
            <div>
              <span className="font-bold text-xl">F</span> Toggle Full Screen
            </div>
          </div>
          <ZappingConfig />
        </div>
      </div>
    </div>
  );
}
