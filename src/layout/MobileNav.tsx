'use client';
import { PropsWithChildren } from 'react';

type Props = {
  /** Whether the picker is unfolded above the bar. */
  isOpen: boolean;
};

/**
 * The picker sheet on a phone: folded away until the floating edit button
 * opens it, then unfolds from the bottom.
 *
 * It sits in the column rather than over it, so opening the picker shrinks the
 * monitor instead of covering it — what is playing stays visible, and the tile
 * being pointed at stays tappable.
 */
export function MobileNav({ isOpen, children }: PropsWithChildren<Props>) {
  if (!isOpen || !children) return null;
  return (
    <div
      className="z-30 flex min-h-0 flex-none flex-col overflow-hidden border-t border-gray-800 bg-background px-2 pt-2"
      // Clear of the home indicator and the gesture area, on the phones that
      // have them; zero everywhere else.
      style={{
        height: '50dvh',
        paddingBottom: 'max(0.25rem, env(safe-area-inset-bottom))'
      }}
    >
      {children}
    </div>
  );
}
