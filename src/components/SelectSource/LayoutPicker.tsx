import { Button } from '@/components/ui/button';
import Image from 'next/image';
import {
  defaultDisplayConfig,
  useDisplayConfig
} from '../../hooks/useDisplayConfig';
import { DisplayConfig, DisplayMode } from '../../types/Monitor';
import { initialLayout, twoBigLayout } from '../Monitor/predefinedLayouts';

type PossibleLayout = {
  config: DisplayConfig;
  imgName: string;
};

const possibleLayouts: PossibleLayout[] = [
  {
    config: defaultDisplayConfig,
    imgName: 'layout1.png'
  },
  {
    config: {
      layout: initialLayout,
      mode: DisplayMode.Grid,
      grid: { size: 3 }
    },
    imgName: 'layout2.png'
  },
  {
    config: {
      layout: initialLayout,
      mode: DisplayMode.Grid,
      grid: { size: 2 }
    },
    imgName: 'layout3.png'
  },
  {
    config: {
      mode: DisplayMode.Layout,
      layout: twoBigLayout,
      grid: { size: 1 }
    },
    imgName: 'layout4.png'
  },
  {
    config: {
      layout: initialLayout,
      mode: DisplayMode.Grid,
      grid: { size: 4 }
    },
    imgName: 'layout5.png'
  }
];

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
            alt=""
            src={`/img/layout/${layout.imgName}`}
            width="160"
            height="90"
          />
        </Button>
      ))}
    </div>
  );
}
