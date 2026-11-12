import {
  ALL_FORMATS,
  BlobSource,
  BufferTarget,
  canEncodeVideo,
  Conversion,
  getFirstEncodableAudioCodec,
  Input,
  type InputAudioTrack,
  MediaStreamAudioTrackSource,
  MediaStreamVideoTrackSource,
  Mp4OutputFormat,
  Output,
  QUALITY_HIGH,
  UrlSource,
  type VideoSample
} from 'mediabunny';

/** A segment of the stream, placed on the timeline of the player showing it. */
export type ClipSegment = {
  /** Its media sequence number, the same in every rendition. */
  sequence: number;
  /** Where the player has it, in seconds. */
  start: number;
  end: number;
};

/** The part of the frame a clip keeps, as fractions of its width and height. */
export type ClipCrop = { x: number; y: number; width: number; height: number };

/**
 * A band across the clip's frame, `top` pixels down and `height` tall, filled
 * with `crop` of the picture.
 */
export type ClipPane = { crop: ClipCrop; top: number; height: number };

/** A clip's shape: original, vertical for social media, square or portrait. */
export type ClipAspect = { label: string; ratio: number | 'source' };

export const CLIP_ASPECTS: ClipAspect[] = [
  { label: 'Original', ratio: 'source' },
  { label: 'Vertical 9:16', ratio: 9 / 16 },
  { label: 'Cuadrado 1:1', ratio: 1 },
  { label: 'Retrato 4:5', ratio: 4 / 5 }
];

/** A clip longer than this is a recording, not a clip, and wouldn't fit in memory. */
export const CLIP_MAX_S = 10 * 60;
export const CLIP_MIN_S = 1;

/**
 * The pixel size of a clip of `ratio` (width / height) whose short side is
 * `shortSide`. Even, as H.264 asks.
 */
export const clipSize = (ratio: number, shortSide: number) => {
  const even = (n: number) => Math.round(n / 2) * 2;
  return ratio >= 1
    ? { width: even(shortSide * ratio), height: shortSide }
    : { width: shortSide, height: even(shortSide / ratio) };
};

/**
 * The bands of a frame `height` tall cut across at `at`, a fraction of it
 * from the top: as one, or as two stacked. Even, as H.264 asks.
 */
export const clipBands = (height: number, at?: number) => {
  if (at === undefined) return [{ top: 0, height }];
  const top = Math.round((height * at) / 2) * 2;
  return [
    { top: 0, height: top },
    { top, height: height - top }
  ];
};

/** Whether this browser can encode the clips: WebCodecs and H.264. */
export const canExportClips = async () =>
  typeof VideoEncoder !== 'undefined' &&
  (await canEncodeVideo('avc', { width: 1080, height: 1920 }));

// Tags that describe the whole playlist; any other tag belongs to the segment
// that follows it.
const PLAYLIST_TAGS = [
  '#EXT-X-VERSION',
  '#EXT-X-TARGETDURATION',
  '#EXT-X-INDEPENDENT-SEGMENTS',
  '#EXT-X-ALLOW-CACHE',
  '#EXT-X-START'
];
const DROPPED_TAGS = [
  '#EXTM3U',
  '#EXT-X-MEDIA-SEQUENCE',
  '#EXT-X-DISCONTINUITY-SEQUENCE',
  '#EXT-X-PLAYLIST-TYPE',
  '#EXT-X-ENDLIST'
];

/**
 * A media playlist cut down to the segments `first` to `last`, ended, so it
 * reads as a finished video holding just those. The key and init section in
 * force at the first one kept are carried over to it. URIs are left as they
 * are: the playlist is served from its own url, which they are relative to.
 *
 * A live playlist may have slid past `first` since; it then starts at the
 * earliest still listed, which it returns as `first`.
 */
export const slicePlaylist = (text: string, first: number, last: number) => {
  const head: string[] = [];
  const kept: string[] = [];
  let keptFirst: number | undefined;
  let sequence = 0;
  let tags: string[] = [];
  let key: string | undefined;
  let map: string | undefined;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith('#EXT-X-MEDIA-SEQUENCE:')) {
      sequence = parseInt(line.slice('#EXT-X-MEDIA-SEQUENCE:'.length), 10);
    } else if (DROPPED_TAGS.some(tag => line.startsWith(tag))) {
      continue;
    } else if (PLAYLIST_TAGS.some(tag => line.startsWith(tag))) {
      head.push(line);
    } else if (line.startsWith('#')) {
      if (line.startsWith('#EXT-X-KEY')) key = line;
      if (line.startsWith('#EXT-X-MAP')) map = line;
      tags.push(line);
    } else {
      if (sequence >= first && sequence <= last) {
        if (keptFirst === undefined) {
          keptFirst = sequence;
          tags = tags.filter(tag => tag !== '#EXT-X-DISCONTINUITY');
          if (map && !tags.includes(map)) tags.unshift(map);
          if (key && !tags.includes(key)) tags.unshift(key);
        }
        kept.push(...tags, line);
      }
      tags = [];
      sequence++;
    }
  }
  if (keptFirst === undefined) return undefined;
  return {
    first: keptFirst,
    text: [
      '#EXTM3U',
      ...head,
      '#EXT-X-PLAYLIST-TYPE:VOD',
      `#EXT-X-MEDIA-SEQUENCE:${keptFirst}`,
      ...kept,
      '#EXT-X-ENDLIST'
    ].join('\n')
  };
};

/** What a clip comes out as, whatever it is cut from. */
type CutOptions = {
  /** One pane for the whole frame, or several stacked. */
  panes: ClipPane[];
  width: number;
  height: number;
  onProgress?: (progress: number) => void;
  signal: AbortSignal;
};

type ExportOptions = CutOptions & {
  /** The media playlist of the rendition to cut from. */
  playlistUrl: string;
  /** The stream's segments, on the timeline `start` and `end` are on. */
  segments: ClipSegment[];
  start: number;
  end: number;
};

/**
 * Each frame drawn pane by pane onto a canvas of the clip's size, which the
 * encoder takes a copy of.
 */
const stacked = (panes: ClipPane[], width: number, height: number) => {
  const canvas = new OffscreenCanvas(width, height);
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Este navegador no puede componer el clip');
  context.imageSmoothingQuality = 'high';
  return {
    process: (sample: VideoSample) => {
      const w = sample.displayWidth;
      const h = sample.displayHeight;
      for (const { crop, top, height: paneHeight } of panes) {
        sample.draw(
          context,
          crop.x * w,
          crop.y * h,
          crop.width * w,
          crop.height * h,
          0,
          top,
          width,
          paneHeight
        );
      }
      return canvas;
    },
    processedWidth: width,
    processedHeight: height
  };
};

const requestUrl = (input: RequestInfo | URL) =>
  typeof input === 'string'
    ? input
    : input instanceof URL
      ? input.href
      : input.url;

/**
 * Cuts `start`–`end` out of a stream into an MP4 (H.264 and AAC, see
 * `clipAudioCodec`) of `width` ×
 * `height`, each of its panes filled with a crop of the picture.
 *
 * Only the segments the clip covers are downloaded: the stream's playlist is
 * served to Mediabunny cut down to them, so the clip's time starts at the
 * first one's. Mediabunny reads the HLS itself — keys, discontinuities and
 * all — and decodes and encodes on the browser's WebCodecs.
 */
export async function exportClip({
  playlistUrl,
  segments,
  start,
  end,
  panes,
  width,
  height,
  onProgress,
  signal
}: ExportOptions): Promise<Blob> {
  const covered = segments.filter(s => s.end > start && s.start < end);
  if (!covered.length) throw new Error('El clip quedó fuera de la señal');
  const last = covered[covered.length - 1];

  const res = await fetch(playlistUrl, { signal });
  if (!res.ok) throw new Error(`La señal respondió ${res.status}`);
  const playlist = slicePlaylist(
    await res.text(),
    covered[0].sequence,
    last.sequence
  );
  const first = covered.find(s => s.sequence === playlist?.first);
  if (!playlist || !first) {
    throw new Error('El clip ya no está en la señal');
  }
  // What slid off the front of a live playlist meanwhile is lost to the clip.
  start = Math.max(start, first.start);

  const fetchFn: typeof fetch = (input, init) =>
    requestUrl(input) === playlistUrl
      ? Promise.resolve(
          new Response(playlist.text, {
            headers: { 'Content-Type': 'application/vnd.apple.mpegurl' }
          })
        )
      : fetch(input, init);

  const input = new Input({
    source: new UrlSource(playlistUrl, { fetchFn, parallelism: 4 }),
    formats: ALL_FORMATS,
    // Times from the first segment, not the wall clock, to match `segments`.
    formatOptions: { hls: { offsetTimestampsByDateTime: false } }
  });
  return cut(
    input,
    { start: start - first.start, end: end - first.start },
    { panes, width, height, onProgress, signal }
  );
}

/**
 * AAC, copied as it is when the source has it. Where it has to be encoded
 * and the browser can't (Chrome on Linux, say), Opus: else the audio would be
 * left out of the clip without a word.
 */
const clipAudioCodec = async (track: InputAudioTrack) =>
  (await track.getCodec()) === 'aac'
    ? 'aac'
    : ((await getFirstEncodableAudioCodec(['aac', 'opus'])) ?? 'aac');

/**
 * `trim` of `input` into an MP4 (H.264 and AAC) of `width` × `height`, each
 * of its panes filled with a crop of the picture. Disposes of `input`.
 */
async function cut(
  input: Input,
  trim: { start: number; end: number },
  { panes, width, height, onProgress, signal }: CutOptions
): Promise<Blob> {
  const target = new BufferTarget();
  const output = new Output({
    format: new Mp4OutputFormat({ fastStart: 'in-memory' }),
    target
  });

  try {
    const conversion = await Conversion.init({
      input,
      output,
      trim,
      video: async track => {
        const common = {
          codec: 'avc' as const,
          quality: QUALITY_HIGH,
          forceTranscode: true
        };
        if (panes.length > 1) {
          return { ...common, ...stacked(panes, width, height) };
        }
        const frameW = await track.getDisplayWidth();
        const frameH = await track.getDisplayHeight();
        const { crop } = panes[0];
        return {
          ...common,
          crop: {
            left: Math.round(crop.x * frameW),
            top: Math.round(crop.y * frameH),
            width: Math.round(crop.width * frameW),
            height: Math.round(crop.height * frameH)
          },
          width,
          height,
          fit: 'fill'
        };
      },
      audio: async track => ({
        codec: await clipAudioCodec(track)
      }),
      showWarnings: false
    });
    if (!conversion.isValid) {
      throw new Error('Este navegador no puede codificar el clip');
    }
    conversion.onProgress = progress => onProgress?.(progress);
    const cancel = () => void conversion.cancel();
    signal.addEventListener('abort', cancel);
    try {
      await conversion.execute();
    } finally {
      signal.removeEventListener('abort', cancel);
    }
  } finally {
    input.dispose();
  }
  if (!target.buffer) throw new Error('El clip salió vacío');
  return new Blob([target.buffer], { type: 'video/mp4' });
}

/** A stretch of a tile, recorded off the screen to cut clips from. */
export type ClipRecording = {
  /** An MP4 whose time 0 is when it started. */
  blob: Blob;
  /** When it started, in unix seconds. */
  startedAt: number;
};

/** Cuts `start`–`end` (seconds into it) out of a recording: see `cut`. */
export const exportRecordingClip = ({
  recording,
  start,
  end,
  ...options
}: CutOptions & { recording: ClipRecording; start: number; end: number }) =>
  cut(
    new Input({ source: new BlobSource(recording.blob), formats: ALL_FORMATS }),
    { start, end },
    options
  );

/**
 * How big a recording gets. Past it, the picture is scaled down to fit: as
 * sharp as a clip at 1080p can use, and still light enough to encode live.
 */
const RECORD_LONG_SIDE = 1920;
const RECORD_SHORT_SIDE = 1080;

/** A recording under way. */
export type Recorder = {
  startedAt: number;
  /** Rejects when the recording fails partway. Never resolves. */
  failed: Promise<never>;
  /** Ends it, and the capture with it. */
  stop: () => Promise<ClipRecording>;
  /** Ends it, keeping nothing. */
  cancel: () => void;
};

/**
 * Records a capture of the screen to an MP4 in memory, as it plays: H.264 at
 * `size` (scaled down to fit, as the encoder takes it, even) and the audio
 * when there is any. It is cut again on export, so it is kept seekable, with
 * frequent key frames, rather than small.
 *
 * Should the picture change size partway, a tile leaving the full screen,
 * each frame is fitted to the first one's size.
 */
export async function recordStream(
  stream: MediaStream,
  size: { width: number; height: number }
): Promise<Recorder> {
  const [videoTrack] = stream.getVideoTracks();
  const [audioTrack] = stream.getAudioTracks();
  const stopTracks = () => stream.getTracks().forEach(track => track.stop());
  if (!videoTrack) {
    stopTracks();
    throw new Error('La captura llegó sin imagen');
  }

  const scale = Math.min(
    1,
    RECORD_LONG_SIDE / Math.max(size.width, size.height),
    RECORD_SHORT_SIDE / Math.min(size.width, size.height)
  );
  const even = (n: number) => Math.max(2, Math.round((n * scale) / 2) * 2);

  const target = new BufferTarget();
  const output = new Output({
    format: new Mp4OutputFormat({ fastStart: 'in-memory' }),
    target
  });
  const video = new MediaStreamVideoTrackSource(
    videoTrack as MediaStreamVideoTrack,
    {
      codec: 'avc',
      quality: QUALITY_HIGH,
      keyFrameInterval: 1,
      sizeChangeBehavior: 'contain',
      transform: { width: even(size.width), height: even(size.height) }
    }
  );
  output.addVideoTrack(video);
  // AAC as the clips have it; where the browser can't encode it, Opus.
  const audioCodec =
    audioTrack && (await getFirstEncodableAudioCodec(['aac', 'opus']));
  const audio =
    audioTrack && audioCodec
      ? new MediaStreamAudioTrackSource(
          audioTrack as MediaStreamAudioTrack,
          { codec: audioCodec, quality: QUALITY_HIGH }
        )
      : undefined;
  if (audio) output.addAudioTrack(audio);

  try {
    await output.start();
  } catch (error) {
    stopTracks();
    throw error;
  }
  const startedAt = Date.now() / 1000;
  const failed = Promise.race([
    video.errorPromise,
    audio?.errorPromise ?? new Promise<void>(() => {})
  ]) as Promise<never>;

  return {
    startedAt,
    failed,
    stop: async () => {
      try {
        await output.finalize();
      } finally {
        stopTracks();
      }
      if (!target.buffer) throw new Error('La grabación salió vacía');
      return {
        blob: new Blob([target.buffer], { type: 'video/mp4' }),
        startedAt
      };
    },
    cancel: () => {
      stopTracks();
      void output.cancel();
    }
  };
}
