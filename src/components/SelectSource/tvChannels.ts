import { SourceInput, SourceType } from '../../sources';

export type Channel = {
  id: string;
  name: string;
  logo: string;
  signals: { type: 'm3u8' | 'iframe' | 'audio'; url: string }[];
  youtube: string | null;
  last_youtube_livestreams?: string[];
  twitch: string | null;
  website: string;
  country: string | null;
  category: string | null;
};

/** Country whose channels always head the list. */
export const HOME_COUNTRY = 'cl';
/** Bucket for channels the feed leaves without a country. */
const NO_COUNTRY = 'other';

const countryLabels: Record<string, string> = {
  // Subdivisions: Intl only knows whole regions, so these are spelled out.
  'gb-eng': 'Inglaterra',
  'us-hi': 'Hawái',
  [NO_COUNTRY]: 'Internacional'
};

const regionNames =
  typeof Intl !== 'undefined' && 'DisplayNames' in Intl
    ? new Intl.DisplayNames(['es'], { type: 'region' })
    : undefined;

function countryLabel(code: string) {
  const known = countryLabels[code];
  if (known) return known;
  try {
    return regionNames?.of(code.toUpperCase()) ?? code.toUpperCase();
  } catch {
    return code.toUpperCase();
  }
}

/** Regional-indicator pair for the ISO code, so subdivisions fly their flag. */
function countryFlag(code: string) {
  const base = code.split('-')[0];
  if (base.length !== 2 || code === NO_COUNTRY) return '🌐';
  return String.fromCodePoint.apply(
    null,
    base
      .toUpperCase()
      .split('')
      .map(char => 0x1f1a5 + char.charCodeAt(0))
  );
}

const categoryLabels: Record<string, string> = {
  general: 'General',
  news: 'Noticias',
  sports: 'Deportes',
  entertainment: 'Entretenimiento',
  music: 'Música',
  kids: 'Infantil',
  animation: 'Animación',
  culture: 'Cultura',
  outdoor: 'Cámaras en vivo',
  science: 'Ciencia',
  business: 'Negocios',
  legislative: 'Legislativo',
  lifestyle: 'Estilo de vida',
  religious: 'Religioso',
  weather: 'Clima',
  auto: 'Autos',
  classic: 'Clásicos',
  relax: 'Relax'
};

/** Categories run in this order; anything unlisted follows, alphabetically. */
const categoryOrder = Object.keys(categoryLabels);

/** The hand-picked list heading the home country. */
const RECOMMENDED_CATEGORY = 'recommended';

/**
 * The channels the home country's list opens on, in the order they are shown.
 * Each one is still listed under its own category further down: this is a
 * shortcut to the handful most people are after, not a category of its own.
 * Slugs rather than feed ids, so a channel that leaves the feed simply drops
 * out of the list.
 */
const recommendedSlugs = [
  'custom_canal-13',
  'custom_chilevision',
  'custom_mega-cl',
  'custom_puranoticia',
  'custom_24-horas',
  'custom_tvn-cl',
  'custom_chv-noticias',
  'custom_cnn-cl',
  'custom_meganoticias',
  'custom_t13',
  'custom_manupuntocl',
  'custom_mediabanco-cl'
];

export type TvCategoryGroup = {
  category: string;
  label: string;
  sources: SourceType[];
};

export type TvCountryGroup = {
  country: string;
  label: string;
  flag: string;
  /** Channels across every category, for the collapsed header. */
  count: number;
  categories: TvCategoryGroup[];
};

export function channelToSource(canal: Channel): SourceType {
  const iframes = canal.signals.filter(s => s.type === 'iframe');
  const m3u8s = canal.signals.filter(s => s.type === 'm3u8');
  // Channels carry up to seven m3u8 mirrors of the same feed; the first of
  // each type is the source's own signal and the rest ride along as inputs, so
  // a dead stream can be stepped past instead of ending the channel.
  const mirrors: SourceInput[] = [
    ...iframes.slice(1).map(s => ({ iframeSrc: s.url })),
    ...m3u8s.slice(1).map(s => ({ m3u8Url: s.url }))
  ];
  return {
    slug: `custom_${canal.id}`,
    name: canal.name,
    imageUrl: canal.logo,
    iframeSrc: iframes[0]?.url,
    m3u8Url: m3u8s[0]?.url,
    youtubeChannelId: canal.youtube ?? undefined,
    twitchAccount: canal.twitch ?? undefined,
    inputs: mirrors.length ? mirrors : undefined
  };
}

function compareCategories(a: string, b: string) {
  const aIdx = categoryOrder.indexOf(a);
  const bIdx = categoryOrder.indexOf(b);
  if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
  if (aIdx !== -1) return -1;
  if (bIdx !== -1) return 1;
  return a.localeCompare(b, 'es');
}

/**
 * The recommended channels a country has, in the order they are listed rather
 * than the feed's. Only the home country has one; everywhere else the list is
 * empty and no header is rendered for it.
 */
function recommendedList(
  country: string,
  categories: Record<string, SourceType[]>
): SourceType[] {
  if (country !== HOME_COUNTRY) return [];
  const bySlug = new Map(
    Object.values(categories)
      .flat()
      .map(source => [source.slug, source])
  );
  return recommendedSlugs
    .map(slug => bySlug.get(slug))
    .filter((source): source is SourceType => !!source);
}

/**
 * Buckets the feed by country and then by category. The home country leads and
 * the countryless bucket trails; the rest are alphabetical by display name.
 */
export function groupChannelsByCountry(channels: Channel[]): TvCountryGroup[] {
  const byCountry: Record<string, Record<string, SourceType[]>> = {};

  channels.forEach(canal => {
    const country = canal.country ?? NO_COUNTRY;
    const category = canal.category ?? 'other';
    const categories = byCountry[country] ?? (byCountry[country] = {});
    const sources = categories[category] ?? (categories[category] = []);
    sources.push(channelToSource(canal));
  });

  return Object.keys(byCountry)
    .map(country => {
      const categories = byCountry[country];
      const grouped: TvCategoryGroup[] = Object.keys(categories)
        .sort(compareCategories)
        .map(category => ({
          category,
          label: categoryLabels[category] ?? 'Otros',
          sources: categories[category].sort((a, b) =>
            (a.name ?? '').localeCompare(b.name ?? '', 'es')
          )
        }));
      const recommended = recommendedList(country, categories);
      return {
        country,
        label: countryLabel(country),
        flag: countryFlag(country),
        // The recommended channels are the same ones counted below, so the
        // header still counts the country's channels rather than its rows.
        count: Object.keys(categories).reduce(
          (total, category) => total + categories[category].length,
          0
        ),
        categories: recommended.length
          ? [
              {
                category: RECOMMENDED_CATEGORY,
                label: 'Recomendados',
                sources: recommended
              },
              ...grouped
            ]
          : grouped
      };
    })
    .sort((a, b) => {
      if (a.country === b.country) return 0;
      if (a.country === HOME_COUNTRY) return -1;
      if (b.country === HOME_COUNTRY) return 1;
      if (a.country === NO_COUNTRY) return 1;
      if (b.country === NO_COUNTRY) return -1;
      return a.label.localeCompare(b.label, 'es');
    });
}
