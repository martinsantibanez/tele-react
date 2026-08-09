'use client';

import { SavedScreensBar } from './SavedScreensBar';

type Props = {
  className?: string;
};

/** The strip under the monitor, where the saved screens live. */
export const ControlBar = ({ className = '' }: Props) => (
  <div
    className={`relative flex items-center justify-center overflow-hidden border-t border-gray-800 ${className}`}
  >
    <SavedScreensBar />
  </div>
);
