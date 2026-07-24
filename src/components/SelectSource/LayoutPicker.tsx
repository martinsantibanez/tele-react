import { Button } from '@/components/ui/button';
import { YoutubeIcon } from 'lucide-react';
import Image from 'next/image';
import { useDisplayConfig } from '../../hooks/useDisplayConfig';
import { possibleLayouts } from './layoutOptions';

export function LayoutPicker() {
  const [, setDisplayConfig] = useDisplayConfig();

  return (
    <div className="flex flex-wrap items-center gap-2">
      {possibleLayouts.map(layout => (
        <Button
          variant="unstyled"
          key={layout.name}
          onClick={() => setDisplayConfig(layout.config)}
          className="h-auto w-auto p-0"
        >
          {layout.imgName ? (
            <Image
              alt={layout.name}
              src={`/img/layout/${layout.imgName}`}
              width="160"
              height="90"
            />
          ) : (
            <div className="flex h-[90px] w-[160px] items-center justify-center rounded-sm bg-gray-900">
              <YoutubeIcon size={48} className="text-red-500" />
            </div>
          )}
        </Button>
      ))}
    </div>
  );
}
