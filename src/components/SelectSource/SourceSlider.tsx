import { ApiClient } from '@twurple/api';
import { StaticAuthProvider } from '@twurple/auth';
import {
  ChevronRight,
  Heart,
  Search,
  Tv,
  Video,
  X,
  YoutubeIcon,
  TwitchIcon,
  Music
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { Input } from '../../../components/ui/input';
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
import { useZappingSources, zappingSlug } from '../../hooks/useZappingChannels';
import { useZappingNowPlaying } from '../../hooks/useZappingNowPlaying';
import { useZappingToken } from '../../hooks/useZappingConfig';
import { useYoutubeLiveSources } from '../../hooks/useYoutubeLiveSubs';
import { useYoutubeAuth } from '../../hooks/useYoutubeAuth';
import { useCustomSpotifyItems } from '../../hooks/useCustomSpotifyItems';
import {
  useSpotifyLibrary,
  useSpotifyTabSections
} from '../../hooks/useSpotifyLibrary';
import { SpotifyConfig } from './SpotifySelector/SpotifyConfig';
import { useDisplayConfig } from '../../hooks/useDisplayConfig';
import { ZappingConfig } from './ZappingSelector/ZappingConfig';
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
import { CategoryTabs } from './CategoryTabs';
import {
  categoryOrder,
  normalizeSearch,
  showPruebas,
  sourceMatches,
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
type ListRow =
  | { kind: 'country'; key: string; group: TvCountryGroup; isOpen: boolean }
  | { kind: 'category'; key: string; label: string }
  | { kind: 'source'; key: string; source: SourceType; sourceIndex: number };

const listRowHeight = (row: ListRow) => {
  if (row.kind === 'source') return SIDEBAR_ROW_HEIGHT;
  return row.kind === 'country' ? COUNTRY_ROW_HEIGHT : TV_CATEGORY_ROW_HEIGHT;
};

/** A run of rows under one header, which is how Zapping and Spotify list. */
type SourceSection = { id: string; label: string; sources: SourceType[] };

/**
 * Sections as list rows, with the flat run of sources they lay out — the one
 * the arrows and the caret count through, which is why it comes back from here
 * rather than being rebuilt alongside.
 *
 * A section whose sources are all filtered out by the search goes with them,
 * header included, and a list left with a single section gets no header at all:
 * a label over the whole of it says nothing.
 *
 * Keys are section-scoped because a source can be listed under more than one
 * header — a Zapping channel in the ranking and again in the catalogue at its
 * number, a playlist both recently played and saved — and the rows are then
 * told apart only by where they sit.
 */
function buildSectionRows(sections: SourceSection[], searchQuery: string) {
  const hits = sections
    .map(section => ({
      ...section,
      sources: searchQuery
        ? section.sources.filter(source => sourceMatches(source, searchQuery))
        : section.sources
    }))
    .filter(section => section.sources.length);

  const rows: ListRow[] = [];
  const sources: SourceType[] = [];
  hits.forEach(section => {
    if (hits.length > 1)
      rows.push({
        kind: 'category',
        key: `${section.id}_header`,
        label: section.label
      });
    section.sources.forEach(source => {
      rows.push({
        kind: 'source',
        key: `${section.id}_${source.slug}`,
        source,
        sourceIndex: sources.length
      });
      sources.push(source);
    });
  });
  return { rows, sources };
}

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
  twitch: TwitchIcon,
  spotify: Music
};

type Props = {
  selectedSourceSlug: string | undefined;
  onSelect: (source: SourceType) => void;
  /** Signal the edited screen is playing; owned by the grid, not the source. */
  activeSignal?: string;
  onSelectSignal?: (key: string) => void;
  /**
   * On a phone the tabs are the app's bottom bar and stay put while the picker
   * folds away above them, so the picker doesn't carry its own copy — and the
   * keyboard hints mean nothing to a thumb.
   */
  showCategories?: boolean;
  showHints?: boolean;
};

const clientId = '0u3rttp1lk618elmdh5sg5b338dlrs';

export function SourceSlider({
  onSelect,
  selectedSourceSlug,
  activeSignal,
  onSelectSignal,
  showCategories = true,
  showHints = true
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
  const isSpotify = activeCategory === 'spotify';
  // Picking the live display leaves the edited screen — and so `selectedSourceSlug`
  // — untouched, so the list remembers the caret sat on it. The display mode has
  // the last word: switching to a layout drops the highlight on its own.
  const [youtubeLiveCaret, setYoutubeLiveCaret] = useState(
    displayConfig.mode === DisplayMode.Youtube
  );
  const youtubeLiveSelected =
    isYoutube && youtubeLiveCaret && displayConfig.mode === DisplayMode.Youtube;
  const { favourites, isFavourite, toggleFavourite } = useFavourites();
  const [twitchSources, setTwitchSources] = useState<SourceType[]>([]);
  const zappingSources = useZappingSources();
  const { nowBySlug, topChannels } = useZappingNowPlaying();
  const youtubeSources = useYoutubeLiveSources();
  const { isConnected: youtubeConnected } = useYoutubeAuth();
  // What the user pasted, what the account has been playing, what it has saved.
  const spotifySections = useSpotifyTabSections();
  const { items: spotifyCustomItems } = useCustomSpotifyItems();
  const {
    isConnected: spotifyConnected,
    isLoading: spotifyLoading,
    recentDenied: spotifyRecentDenied
  } = useSpotifyLibrary();
  // The TV feed is fetched once for the whole app, alongside the other
  // catalogues the picker reads from.
  const { tvGroups, bySlug: catalogueBySlug } = useSourceCatalog();
  const [openCountries, setOpenCountries] = useOpenCountries();

  // The search box narrows the tab being browsed, not the whole catalogue: each
  // tab comes from its own feed, and the tabs are how they are told apart.
  const [query, setQuery] = useState('');
  const searchQuery = normalizeSearch(query);
  const searchRef = useRef<HTMLInputElement>(null);

  // A query written for one tab means nothing in the next one, and a tab
  // silently filtered on arrival would look empty for no visible reason.
  useEffect(() => setQuery(''), [activeCategory]);

  const toggleCountry = (country: string) =>
    setOpenCountries(open =>
      open.includes(country)
        ? open.filter(other => other !== country)
        : [...open, country]
    );

  // The rows the TV list renders, plus the channels they expose: folded-away
  // countries drop out of both, so the arrows only walk what is on screen.
  const { tvRows, tvSources } = useMemo(() => {
    const rows: ListRow[] = [];
    const sources: SourceType[] = [];
    tvGroups.forEach(group => {
      const categories = searchQuery
        ? group.categories
            .map(category => ({
              ...category,
              sources: category.sources.filter(source =>
                sourceMatches(source, searchQuery)
              )
            }))
            .filter(category => category.sources.length)
        : group.categories;
      // A country with no hit has nothing to say about the search.
      if (searchQuery && !categories.length) return;
      // Hits are the point of searching, so the countries holding them are
      // unfolded. Folding one is still recorded — it takes hold once the
      // search box is cleared and the whole catalogue is back.
      const isOpen = !!searchQuery || openCountries.includes(group.country);
      rows.push({
        kind: 'country',
        key: `country_${group.country}`,
        // Collapsed, the header counts what is inside it; while searching that
        // is the hits, not the channels they were found among.
        group: searchQuery
          ? {
              ...group,
              count: categories.reduce(
                (total, category) => total + category.sources.length,
                0
              )
            }
          : group,
        isOpen
      });
      if (!isOpen) return;
      categories.forEach(category => {
        rows.push({
          kind: 'category',
          key: `category_${group.country}_${category.category}`,
          label: category.label
        });
        category.sources.forEach(source => {
          rows.push({
            kind: 'source',
            // Scoped to the category, as in the sectioned lists: a recommended
            // channel is listed again under its own category, and the two rows
            // are told apart only by where they sit.
            key: `${group.country}_${category.category}_${source.slug}`,
            source,
            sourceIndex: sources.length
          });
          sources.push(source);
        });
      });
    });
    return { tvRows: rows, tvSources: sources };
  }, [tvGroups, openCountries, searchQuery]);

  // The Zapping list, headed by the live "Más vistos" ranking. Until the
  // ranking lands there is only the catalogue, and `buildSectionRows` leaves a
  // lone section unheaded.
  const { rows: zappingRows, sources: zappingRowSources } = useMemo(() => {
    const bySlug = new Map(zappingSources.map(source => [source.slug, source]));
    const topSources = topChannels
      .map(channel => bySlug.get(zappingSlug(channel)))
      .filter((source): source is SourceType => !!source);
    return buildSectionRows(
      [
        { id: 'top', label: 'Más vistos', sources: topSources },
        { id: 'all', label: 'Todos los canales', sources: zappingSources }
      ],
      searchQuery
    );
  }, [zappingSources, topChannels, searchQuery]);

  // The Spotify list: pasted links, then the mixes and playlists the account
  // has been playing, then its saved things. `useSpotifyTabSections` has
  // already dropped the runs that are empty.
  const { rows: spotifyRows, sources: spotifyRowSources } = useMemo(
    () => buildSectionRows(spotifySections, searchQuery),
    [spotifySections, searchQuery]
  );

  const activeCategorySources: SourceType[] = useMemo(() => {
    const categorySources = () => {
      if (activeCategory === 'tv') {
        // Already filtered, along with the headers the hits are listed under.
        return tvSources;
        // return sourcesCategories.flatMap(cat => Object.values(cat.sources));
      } else if (activeCategory === 'twitch') {
        return twitchSources;
      } else if (activeCategory === 'youtube') {
        return [youtubeLiveEntry, ...youtubeSources];
      } else if (activeCategory === 'spotify') {
        // Already filtered, and ordered as its sections lay them out.
        return spotifyRowSources;
      } else if (activeCategory === 'favourites') {
        // The stored copy is a snapshot; show the catalogue's when it has one,
        // so a starred channel is listed with its current logo and signals.
        return favourites.map(fav => catalogueBySlug.get(fav.slug) ?? fav);
      } else if (activeCategory === 'pruebas') {
        return pruebasList;
      } else if (activeCategory === 'layouts') {
        return [];
      }
      // Already filtered, and ordered as the sections lay them out.
      return zappingRowSources;
    };
    const sources = categorySources();
    // The sectioned lists filter themselves, along with the headers their hits
    // are listed under.
    if (
      !searchQuery ||
      activeCategory === 'tv' ||
      activeCategory === 'zapping' ||
      activeCategory === 'spotify'
    )
      return sources;
    return sources.filter(source => sourceMatches(source, searchQuery));
  }, [
    activeCategory,
    tvSources,
    twitchSources,
    favourites,
    catalogueBySlug,
    zappingRowSources,
    youtubeSources,
    spotifyRowSources,
    searchQuery
  ]);

  const selectedLayoutIndex = findLayoutIndex(displayConfig);

  // The slider navigates either sources or layouts, depending on the category.
  // Looked up rather than counted: a search can filter the selection out of
  // the list, and then no row is the selected one.
  const selectedSlug = youtubeLiveSelected
    ? YOUTUBE_LIVE_SLUG
    : selectedSourceSlug;
  // Zapping lists its ranked channels twice, so the slug alone no longer says
  // *which* row the user is standing on. The caret remembers the row that was
  // last picked and is trusted only while it still points at the selection —
  // the list re-orders underneath it (the ranking polls, the search narrows,
  // the tab changes) and the screen can be re-pointed from outside the picker.
  const [caretIndex, setCaretIndex] = useState<number | null>(null);
  const caretOnSelection =
    caretIndex !== null &&
    !!selectedSlug &&
    activeCategorySources[caretIndex]?.slug === selectedSlug;
  const selectedIndex = isLayouts
    ? selectedLayoutIndex
    : caretOnSelection
      ? caretIndex
      : activeCategorySources.findIndex(src => src.slug === selectedSlug);
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
    setCaretIndex(index);
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
  // so up/down walk the sources and left/right the categories. Left and right
  // are left to the caret while the search box has the focus.
  useHotkeys('left', () => prevCategory(), { preventDefault: true });
  useHotkeys('right', () => nextCategory(), { preventDefault: true });

  // Layouts are driven by the RowSlider, which owns its own arrow handling.
  // Walking the results is what follows typing, so up/down keep working from
  // inside the search box.
  useHotkeys('up', () => (isLayouts ? undefined : prev()), {
    preventDefault: true,
    enableOnFormTags: ['input']
  });
  useHotkeys('down', () => (isLayouts ? undefined : next()), {
    preventDefault: true,
    enableOnFormTags: ['input']
  });
  useHotkeys(
    '/',
    () => searchRef.current?.focus(),
    // Matched on the character rather than the physical key, so it is the
    // slash the keyboard actually writes.
    { preventDefault: true, useKey: true, enabled: !isLayouts }
  );
  useHotkeys(
    'f',
    () => {
      // The live display is not a channel, so there is nothing to favourite.
      if (!selectedSource || selectedSource.slug === YOUTUBE_LIVE_SLUG) return;
      toggleFavourite(selectedSource);
    },
    { preventDefault: true }
  );
  // Zapping and YouTube both put a connect/disconnect panel where the signals
  // TAB would otherwise be; Spotify puts the box its catalogue is typed into.
  const isConfigCategory = isZapping || isYoutube || isSpotify;
  const zappingConfigRef = useRef<HTMLDivElement>(null);
  const youtubeConfigRef = useRef<HTMLDivElement>(null);
  const spotifyConfigRef = useRef<HTMLDivElement>(null);
  const activeConfigRef = isYoutube
    ? youtubeConfigRef
    : isSpotify
      ? spotifyConfigRef
      : zappingConfigRef;

  const selectedItemRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (isLayouts) return;
    // Arrowing through the results from the search box must not pull the focus
    // out of it, or the next keystroke would be a hotkey instead of a letter.
    if (document.activeElement === searchRef.current) return;
    // In the sidebar the VirtualList keeps the selected row mounted and in
    // view, so focusing it never needs to scroll.
    selectedItemRef.current?.focus({ preventScroll: true });
  }, [selectedSourceSlug, activeCategory, isLayouts, youtubeLiveSelected]);

  const focusActiveConfig = () => {
    const config = activeConfigRef.current;
    // Spotify's panel is a box to paste a link into; the others are buttons.
    const target = isSpotify
      ? config?.querySelector('input')
      : config?.querySelector('button');
    target?.focus();
  };

  // Spotify has two ways to fill its list, so neither one missing is enough:
  // an empty tab is one with no account connected *and* nothing pasted in.
  // Counted off the unfiltered sections — a search that matches nothing is not
  // an empty tab, and must not move the caret onto the config panel.
  const configNeedsAuth = isYoutube
    ? !youtubeConnected
    : isSpotify
      ? !spotifyConnected && !spotifySections.length
      : !zappingToken;

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

    // A channel listed twice is playing in both places, so both rows are lit.
    // Only the one the caret is on carries the focus and the signal controls —
    // those belong to a position in the list, not to the channel.
    const isActive = source.slug === selectedSourceSlug && !youtubeLiveSelected;
    const isCaret = isActive && canalIndex === selectedIndex;
    const starred = isFavourite(source.slug);
    // What the source is showing right now. Zapping's comes from the live EPG,
    // keyed by slug so a channel starred into Favourites keeps saying what is
    // on it there too; every other catalogue carries its own on the source.
    const description = nowBySlug.get(source.slug)?.title ?? source.description;

    return (
      <div
        ref={isCaret ? selectedItemRef : undefined}
        tabIndex={isCaret ? 0 : -1}
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
                {isCaret && (
                  <span className="absolute top-1.5 left-3 text-[9px] leading-none text-gray-300 bg-black/70 rounded px-0.5">
                    F
                  </span>
                )}
              </div>
            </div>
            {isCaret && availableSignals.length > 1 && (
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
          <div className="min-w-0 flex-1">
            <div className="truncate text-base font-semibold">
              {source.name}
            </div>
            {description && (
              <div className="truncate text-xs text-gray-400">
                {description}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderListRow = (row: ListRow) => {
    if (row.kind === 'source')
      return renderSourceCard(row.source, row.sourceIndex);

    if (row.kind === 'category')
      return (
        <div className="bg-background flex h-full items-end px-2 pb-0.5 text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
          {row.label}
        </div>
      );

    return (
      <button
        type="button"
        aria-expanded={row.isOpen}
        onClick={() => toggleCountry(row.group.country)}
        className="bg-background flex h-full w-full items-center gap-2 border-t border-gray-800 px-1 text-left outline-none hover:bg-gray-800/60 focus-visible:ring-2 focus-visible:ring-white"
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

  // YouTube has nothing to list until the account is connected; the indices
  // still line up with `activeCategorySources` because the list is either shown
  // whole or not at all. (Zapping is gated the same way, on its rows.)
  const listedSources =
    isYoutube && !youtubeConnected ? [] : activeCategorySources;

  // The TV, Zapping and Spotify lists carry their headers as rows, so the row
  // to scroll to has to be found rather than reused from the flat channel
  // index. Matched on that index and not on the slug: a channel listed in two
  // sections has two rows, and the one to bring into view is the caret's.
  // Zapping has nothing to list until the account is connected.
  const isSectioned = isTv || isZapping || isSpotify;
  const sectionRows = isTv
    ? tvRows
    : isZapping && zappingToken
      ? zappingRows
      : isSpotify
        ? spotifyRows
        : [];
  const selectedRowIndex = sectionRows.findIndex(
    row => row.kind === 'source' && row.sourceIndex === selectedIndex
  );

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
        !searchQuery &&
        !activeCategorySources.length &&
        'Sin favoritos'}
      {isYoutube &&
        youtubeConnected &&
        !youtubeSources.length &&
        'Ningún canal suscrito está en vivo'}
      {isSpotify &&
        !searchQuery &&
        !spotifyRowSources.length &&
        (spotifyLoading
          ? 'Cargando...'
          : spotifyConnected
            ? 'Tu cuenta no tiene playlists ni álbumes guardados'
            : 'Conecta tu cuenta, o agrega una playlist con su link')}
      {!!searchQuery &&
        !(isSectioned ? sectionRows.length : listedSources.length) &&
        `Sin resultados para «${query.trim()}»`}
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
      {isSpotify && (
        <div
          ref={spotifyConfigRef}
          className="flex w-full shrink-0 flex-col items-center gap-2 p-3"
        >
          <SpotifyConfig
            onSourceSelect={onSelect}
            selectedUri={selectedSource?.spotifyUri}
            // Only a pasted row can be taken out of the list; one that comes
            // from the account is removed in Spotify, not here.
            isSelectedCustom={spotifyCustomItems.some(
              item => item.uri === selectedSource?.spotifyUri
            )}
          />
          {spotifyRecentDenied && (
            // An older grant cannot read the play history, and the row it feeds
            // just isn't there — indistinguishable from having played nothing
            // unless it is said out loud.
            <span className="text-center text-[10px] leading-tight text-gray-400">
              Reconecta tu cuenta para ver lo que escuchaste hace poco
            </span>
          )}
          <span className="text-[9px] leading-none text-gray-400">TAB</span>
        </div>
      )}
    </>
  );

  const sourcesList = isSectioned ? (
    !!sectionRows.length && (
      <VirtualList
        items={sectionRows}
        itemHeight={listRowHeight}
        activeIndex={selectedRowIndex}
        getItemKey={row => row.key}
        // A section heads the channels under it, so the one being scrolled
        // through stays named at the top of the list.
        isStickyHeader={row => row.kind !== 'source'}
        renderItem={row => renderListRow(row)}
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

  // Above the scroller rather than inside it, so it stays put while the
  // catalogue runs past underneath and is always a keystroke from the list.
  const searchBar = (
    // `sticky` positions the box for the icons pinned inside it, and keeps it
    // in place should the sidebar itself ever be the thing scrolling.
    <div className="bg-background sticky top-0 z-20 shrink-0">
      <Search
        size={14}
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-2 -translate-y-1/2 text-gray-400"
      />
      <Input
        ref={searchRef}
        // Not `search`: the browser's own clear button would double the one
        // pinned to the right of the box.
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        onKeyDown={e => {
          if (e.key !== 'Escape') return;
          // Escape gives back the full list first and the focus second, so a
          // filtered list is never left behind by a stray keystroke.
          if (query) setQuery('');
          else searchRef.current?.blur();
        }}
        placeholder="Buscar canal"
        aria-label="Buscar canal"
        className="h-8 pr-7 pl-7 text-sm"
      />
      {query ? (
        <button
          type="button"
          title="Limpiar búsqueda"
          aria-label="Limpiar búsqueda"
          onClick={() => {
            setQuery('');
            searchRef.current?.focus();
          }}
          className="absolute top-1/2 right-1.5 -translate-y-1/2 rounded p-0.5 text-gray-400 hover:text-white"
        >
          <X size={14} />
        </button>
      ) : (
        <span className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-[9px] leading-none text-gray-400">
          /
        </span>
      )}
    </div>
  );

  const layoutsContent = (
    // The sidebar rows scroll, so they need the leftover height.
    <div className="flex min-h-0 w-full flex-1 flex-col gap-2">
      <RowSlider rows={layoutRows} />
    </div>
  );

  return (
    <div className="flex h-full w-full flex-col gap-2">
      {showCategories && (
        <CategoryTabs
          activeCategory={activeCategory}
          onSelect={setActiveCategory}
        />
      )}
      {showHints && (
        <div className="text-[9px] leading-none text-gray-400 text-center">
          ← → categorías · ↑ ↓ {isLayouts ? 'layouts' : 'canales'}
        </div>
      )}
      {isLayouts ? (
        layoutsContent
      ) : (
        <div className="flex min-h-0 flex-1 flex-col gap-2">
          {searchBar}
          <div className="flex min-h-0 flex-1 flex-col">{sourcesContent}</div>
        </div>
      )}
    </div>
  );
}
