'use client';

import { ChevronDown } from 'lucide-react';
import { SavedScreensBar } from './SavedScreensBar';

type Props = {
  className?: string;
  /** Folds the strip away, leaving its floating button over the monitor. */
  onHide?: () => void;
};

/** The strip under the monitor, where the saved screens live. */
export const ControlBar = ({ className = '', onHide }: Props) => (
  <div
    className={`relative flex items-center justify-center overflow-hidden border-t border-gray-800 ${className}`}
  >
    <SavedScreensBar />
    {onHide && (
      <button
        type="button"
        onClick={onHide}
        aria-label="Ocultar pantallas"
        title="Ocultar pantallas (C)"
        className="absolute top-1 right-1 rounded-md p-1.5 text-gray-400 opacity-70 hover:bg-gray-800 hover:text-white hover:opacity-100"
      >
        <ChevronDown size={16} />
      </button>
    )}
  </div>
);
