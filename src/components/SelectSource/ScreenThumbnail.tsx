'use client';
import { YoutubeIcon } from 'lucide-react';
import { useMemo } from 'react';
import { useCustomSources } from '../../hooks/useCustomSources';
import { getSource, SourceType } from '../../sources';
import { DisplayMode, ScreenType, SourceNode } from '../../types/Monitor';

type Props = {
  screen: ScreenType;
  width?: number;
  height?: number;
  className?: string;
};

/**
 * Miniature preview of a saved screen: it reproduces the layout geometry (the
 * same 12x9 grid the real Layout uses, or the NxN grid) and drops each source's
 * logo into its slot, so the thumbnail reflects both the arrangement and which
 * channels sit where — instead of a static picture of an empty layout.
 */
export function ScreenThumbnail({
  screen,
  width = 160,
  height = 90,
  className
}: Props) {
  const { customSources } = useCustomSources();
  const { config, sources = [] } = screen;

  const resolve = (slug?: string): SourceType | undefined => {
    if (!slug) return undefined;
    if (slug.startsWith('custom_'))
      return customSources?.find(src => src.slug === slug);
    return getSource(slug);
  };

  return (
    <div
      className={`overflow-hidden rounded-sm bg-black ${className ?? ''}`}
      style={{ width, height }}
    >
      {config.mode === DisplayMode.Youtube ? (
        // The tiles are derived live at render time, so a saved snapshot has no
        // meaningful arrangement to preview — show what the layout is instead.
        <div className="flex h-full w-full items-center justify-center bg-gray-900">
          <YoutubeIcon size={40} className="text-red-500" />
        </div>
      ) : config.mode === DisplayMode.Grid ? (
        <GridPreview sources={sources} size={config.grid.size} resolve={resolve} />
      ) : (
        <LayoutPreview
          layout={config.layout}
          sources={sources}
          resolve={resolve}
        />
      )}
    </div>
  );
}

type SlotResolver = (slug?: string) => SourceType | undefined;

function GridPreview({
  sources,
  size,
  resolve
}: {
  sources: SourceNode[];
  size: number;
  resolve: SlotResolver;
}) {
  const rows = Math.ceil((sources.length || 1) / size) || 1;
  return (
    <div
      className="grid h-full w-full gap-px"
      style={{
        gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`
      }}
    >
      {sources.map((source, idx) => (
        <Slot key={idx} source={resolve(source.sourceSlug)} />
      ))}
    </div>
  );
}

function LayoutPreview({
  layout,
  sources,
  resolve
}: {
  layout: ScreenType['config']['layout'];
  sources: SourceNode[];
  resolve: SlotResolver;
}) {
  return (
    <div className="grid h-full w-full grid-cols-12 grid-rows-9 gap-px">
      {layout.map((col, idx) => {
        const source = sources[idx];
        if (!source) return null;
        return (
          <div
            key={idx}
            style={{
              gridColumn: col.cols ? `span ${col.cols}` : undefined,
              gridRow: col.rows ? `span ${col.rows}` : undefined
            }}
          >
            <Slot source={resolve(source.sourceSlug)} />
          </div>
        );
      })}
    </div>
  );
}

/**
 * A single tile. Shows the channel logo when we have one; the `!important`
 * overrides neutralise the inline sizing baked into each source's titleIcons so
 * they scale down to the tile instead of overflowing it.
 */
function Slot({ source }: { source?: SourceType }) {
  const label = useMemo(() => source?.name ?? source?.slug, [source]);
  return (
    <div className="flex h-full w-full items-center justify-center overflow-hidden bg-gray-900 p-1">
      {source?.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={source.imageUrl}
          alt={label ?? ''}
          className="max-h-full max-w-full object-contain"
        />
      ) : source?.titleIcons?.length ? (
        <div className="flex max-h-full max-w-full items-center justify-center gap-0.5 [&_img]:!max-h-full [&_img]:!w-auto [&_img]:!object-contain">
          {source.titleIcons}
        </div>
      ) : label ? (
        <span className="truncate text-[8px] font-semibold leading-none text-gray-200">
          {label}
        </span>
      ) : null}
    </div>
  );
}
