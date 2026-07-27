'use client';

type Props = {
  className?: string;
};

export const ControlBar = ({ className = '' }: Props) => (
  <div
    className={`flex items-center justify-center overflow-hidden border-t border-gray-800 ${className}`}
  >
    
  </div>
);
