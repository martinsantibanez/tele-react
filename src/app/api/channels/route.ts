import { NextResponse } from 'next/server';

const CHANNELS_URL =
  'https://raw.githubusercontent.com/Alplox/json-teles/main/channels.json';
const REVALIDATE_SECONDS = 3600;

// Revalidated at most once per REVALIDATE_SECONDS via Next.js's data cache.
// If the upstream fetch fails during revalidation, Next.js keeps serving the
// last successful response instead of overwriting the cache with an error.
export async function GET() {
  try {
    const upstream = await fetch(CHANNELS_URL, {
      next: { revalidate: REVALIDATE_SECONDS }
    });

    if (!upstream.ok) {
      throw new Error(`Upstream responded with ${upstream.status}`);
    }

    const data = await upstream.json();

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': `public, s-maxage=${REVALIDATE_SECONDS}, stale-while-revalidate=86400`
      }
    });
  } catch (err) {
    console.error('Failed to fetch channels.json', err);
    return NextResponse.json(
      { error: 'Failed to fetch channels' },
      { status: 502 }
    );
  }
}
