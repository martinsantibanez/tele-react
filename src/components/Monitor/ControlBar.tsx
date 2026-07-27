'use client';

import { DisplayMode, GridSize } from '../../types/Monitor';
import { ScreenOptions } from '../ScreenOptions/ScreenOptions';
import { LayoutsPanel } from '../SelectSource/LayoutsPanel';

type Props = {
  className?: string;
  mode: DisplayMode;
  size: GridSize;
  onModeChange: (mode: DisplayMode) => void;
  onSizeChange: (size: GridSize) => void;
  /** Left out when the mode has no grid to add a screen to. */
  onSourceAdd?: () => void;
};

/**
 * Everything under the monitor: how it is arranged on the left, and on the
 * right the layouts and saved screens to arrange it with.
 */
export const ControlBar = ({
  className = '',
  mode,
  size,
  onModeChange,
  onSizeChange,
  onSourceAdd
}: Props) => (
  <div
    className={`flex flex-row items-start gap-3 overflow-hidden border-t border-gray-800 p-2 ${className}`}
  >
    <ScreenOptions
      mode={mode}
      size={size}
      onModeChange={onModeChange}
      onSizeChange={onSizeChange}
      onSourceAdd={onSourceAdd}
    />
    <div className="flex min-w-0 flex-1 flex-col">
      <LayoutsPanel />
    </div>
  </div>
);
