import { Button } from '@/components/ui/button';
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
          key={layout.imgName}
          onClick={() => setDisplayConfig(layout.config)}
          className="h-auto w-auto p-0"
        >
          <Image
            alt={layout.name}
            src={`/img/layout/${layout.imgName}`}
            width="160"
            height="90"
          />
        </Button>
      ))}
    </div>
  );
}
