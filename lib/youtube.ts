// YouTube Data API v3 — "my subscriptions that are live right now".
//
// There is no single endpoint for this, and the obvious composition is a quota
// trap: search.list with eventType=live costs 100 units PER CHANNEL, so a single
// sweep of 200 subscriptions would blow the whole 10,000 units/day budget. This
// module implements the cheap composition instead (~1 unit per channel):
//
//   1. subscriptions.list       — 1 unit / 50 subs, paginated on nextPageToken.
//   2. uploads playlist id       — NO API CALL. A channel's uploads playlist id
//        is its channel id with the "UC" prefix swapped for "UU":
//          UCDGiCfCZIV5phsoGiPwIcyQ  ->  UUDGiCfCZIV5phsoGiPwIcyQ
//        This has held for every channel for years. A live stream shows up in
//        the uploads playlist once it starts (1-5 min latency), so we never pay
//        for a search.
//   3. playlistItems.list        — 1 unit per channel; the bulk of the cost.
//        Grab the few most recent video ids from each uploads playlist.
//   4. videos.list               — 1 unit per batch of 50; hydrates the ids and
//        tells us which are actually live via snippet.liveBroadcastContent.
//
// subscriptions.list requires an OAuth user token (an API key alone returns
// 401); everything else works with the same bearer token. All endpoints are
// CORS-open, so this runs client-side, mirroring lib/zapping.ts.

const YT_BASE = 'https://www.googleapis.com/youtube/v3';

/** One subscribed channel, distilled from subscriptions.list. */
export type Subscription = {
  channelId: string;
  title: string;
  thumbnailUrl: string;
};

/** A subscribed channel that is live right now. */
export type YoutubeLiveVideo = {
  videoId: string;
  channelId: string;
  channelTitle: string;
  title: string;
  thumbnailUrl: string;
  concurrentViewers?: number;
  actualStartTime?: string;
};

type SubscriptionsResponse = {
  nextPageToken?: string;
  items?: {
    snippet?: {
      title?: string;
      resourceId?: { channelId?: string };
      thumbnails?: { default?: { url?: string }; medium?: { url?: string } };
    };
  }[];
};

type PlaylistItemsResponse = {
  items?: { contentDetails?: { videoId?: string } }[];
};

type VideosResponse = {
  items?: {
    id?: string;
    snippet?: {
      title?: string;
      channelId?: string;
      channelTitle?: string;
      liveBroadcastContent?: 'live' | 'upcoming' | 'none';
      thumbnails?: Record<string, { url?: string }>;
    };
    liveStreamingDetails?: {
      actualStartTime?: string;
      actualEndTime?: string;
      scheduledStartTime?: string;
      concurrentViewers?: string;
    };
  }[];
};

async function ytGet<T>(
  path: string,
  accessToken: string,
  params: Record<string, string>
): Promise<T> {
  const url = `${YT_BASE}/${path}?${new URLSearchParams(params).toString()}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  if (res.status === 401) {
    throw new YoutubeAuthError('YouTube: token expirado o inválido');
  }
  if (!res.ok) {
    throw new Error(`YouTube: ${path} respondió ${res.status}`);
  }
  return res.json() as Promise<T>;
}

/** Raised on a 401 so the auth layer can prompt for re-auth. */
export class YoutubeAuthError extends Error {}

/** The uploads playlist id for a channel: UC... -> UU... (see header). */
export const uploadsPlaylistId = (channelId: string) =>
  channelId.replace(/^UC/, 'UU');

/**
 * STEP 1 — every subscribed channel, following pagination. 1 unit per page of
 * 50. Cacheable for hours; subscriptions change rarely.
 */
export async function fetchSubscriptions(
  accessToken: string
): Promise<Subscription[]> {
  const subs: Subscription[] = [];
  let pageToken: string | undefined;
  do {
    const params: Record<string, string> = {
      part: 'snippet',
      mine: 'true',
      maxResults: '50'
    };
    if (pageToken) params.pageToken = pageToken;
    const json = await ytGet<SubscriptionsResponse>(
      'subscriptions',
      accessToken,
      params
    );
    for (const item of json.items ?? []) {
      const channelId = item.snippet?.resourceId?.channelId;
      if (!channelId) continue;
      subs.push({
        channelId,
        title: item.snippet?.title ?? '',
        thumbnailUrl:
          item.snippet?.thumbnails?.medium?.url ??
          item.snippet?.thumbnails?.default?.url ??
          ''
      });
    }
    pageToken = json.nextPageToken;
  } while (pageToken);
  return subs;
}

/** Run tasks with a bounded number in flight at once. */
async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;
  const worker = async () => {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await fn(items[index]);
    }
  };
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, worker)
  );
  return results;
}

const bestThumb = (thumbs?: Record<string, { url?: string }>) =>
  thumbs?.medium?.url ?? thumbs?.high?.url ?? thumbs?.default?.url ?? '';

/**
 * STEPS 3-4 — given channel ids, return the ones currently live. Step 3 fetches
 * the recent uploads of every channel with bounded concurrency (~8 parallel);
 * step 4 hydrates the collected video ids in batches of 50 and keeps only the
 * ones YouTube reports as `live`.
 *
 * A 404 from step 3 just means "channel has no uploads playlist" — skip it
 * rather than special-casing, exactly as the header note describes.
 */
export async function fetchLiveFromChannels(
  accessToken: string,
  channelIds: string[]
): Promise<YoutubeLiveVideo[]> {
  // STEP 3 — a few most-recent video ids per channel.
  const perChannelIds = await mapWithConcurrency(
    channelIds,
    8,
    async channelId => {
      try {
        const json = await ytGet<PlaylistItemsResponse>(
          'playlistItems',
          accessToken,
          {
            part: 'contentDetails',
            playlistId: uploadsPlaylistId(channelId),
            maxResults: '3'
          }
        );
        return (json.items ?? [])
          .map(i => i.contentDetails?.videoId)
          .filter((id): id is string => Boolean(id));
      } catch (err) {
        // 401 must still bubble up so the caller can re-auth.
        if (err instanceof YoutubeAuthError) throw err;
        return [];
      }
    }
  );

  const videoIds = Array.from(new Set(perChannelIds.flat()));
  if (!videoIds.length) return [];

  // STEP 4 — hydrate in batches of 50 and filter to live.
  const batches: string[][] = [];
  for (let i = 0; i < videoIds.length; i += 50) {
    batches.push(videoIds.slice(i, i + 50));
  }

  const hydrated = await mapWithConcurrency(batches, 4, async batch => {
    const json = await ytGet<VideosResponse>('videos', accessToken, {
      part: 'snippet,liveStreamingDetails',
      id: batch.join(',')
    });
    return json.items ?? [];
  });

  const live: YoutubeLiveVideo[] = [];
  for (const item of hydrated.flat()) {
    const snippet = item.snippet;
    const details = item.liveStreamingDetails;
    // Prefer the field YouTube itself keys on. Fall back to liveStreamingDetails
    // (present only on streams): started but not ended.
    const isLive =
      snippet?.liveBroadcastContent === 'live' ||
      (!!details?.actualStartTime && !details?.actualEndTime);
    if (!item.id || !snippet || !isLive) continue;
    live.push({
      videoId: item.id,
      channelId: snippet.channelId ?? '',
      channelTitle: snippet.channelTitle ?? '',
      title: snippet.title ?? '',
      thumbnailUrl: bestThumb(snippet.thumbnails),
      concurrentViewers: details?.concurrentViewers
        ? Number(details.concurrentViewers)
        : undefined,
      actualStartTime: details?.actualStartTime
    });
  }
  return live;
}
