'use client';
import { useEffect, useState } from 'react';
import { SourceType } from '../../sources';

type Props = {
  source: SourceType;
};

/**
 * The channel's mark, sat beside the tile's shortcut number so the two read as
 * one badge — both are arranging aids, up only while the screen is being edited.
 * Fills the height of the badge, which the caller sizes against the tile. Kept
 * translucent over the video, with a drop shadow so white logos stay legible
 * over a bright frame.
 */
export function SourceLogo({ source }: Props) {
  // Plenty of feed logos 404; a broken-image glyph and its alt text over the
  // video is worse than no badge at all, so a failed load drops the whole thing.
  const [broken, setBroken] = useState(false);
  const url = source.logoUrl ?? source.imageUrl;
  useEffect(() => setBroken(false), [url]);

  const logo = broken ? undefined : url;
  const hasIcons = !logo && !!source.titleIcons?.length;
  if (!logo && !hasIcons) return null;

  return (
    <div className="pointer-events-none flex h-full min-w-0 items-center opacity-70 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
      {logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logo}
          alt=""
          onError={() => setBroken(true)}
          className="h-full w-auto max-w-full object-contain object-left"
        />
      ) : (
        // The `!important` overrides neutralise the inline sizing baked into
        // each source's titleIcons so they scale to the badge, not past it.
        <div className="flex h-full max-w-full items-center gap-0.5 [&_img]:!max-h-full [&_img]:!max-w-none [&_img]:!w-auto [&_img]:!object-contain [&_svg]:!h-full [&_svg]:!w-auto">
          {source.titleIcons}
        </div>
      )}
    </div>
  );
}
