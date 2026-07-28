'use client';
import { ReactNode, useEffect, useState } from 'react';

type Props = {
  src?: string;
  alt?: string;
  className?: string;
  /** Shown when there is no url, or the one we have turns out to be dead. */
  fallback?: ReactNode;
};

/**
 * A channel logo that leaves nothing behind when its url 404s. Plenty of feed
 * logos are dead links, and the browser's broken-image glyph — with the alt
 * text sat next to it — reads as a bug; an empty slot just reads as a channel
 * without a logo.
 */
export function SourceImage({ src, alt = '', className, fallback }: Props) {
  const [broken, setBroken] = useState(false);
  // A new url deserves its own attempt.
  useEffect(() => setBroken(false), [src]);

  if (!src || broken) return <>{fallback ?? null}</>;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setBroken(true)}
    />
  );
}
