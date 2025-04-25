import Image from 'next/image';
import {
  initialLayout,
  twoBigLayout
} from '../../_pages/monitor/predefinedLayouts';
import {
  DisplayConfig,
  DisplayMode,
  GridSize,
  SourceNode
} from '../../_pages/monitor/types';
import {
  defaultDisplayConfig,
  useDisplayConfig
} from '../../hooks/useDisplayConfig';
import { SourceType } from '../../sources';
import { uuid } from '../../utils/uuid';
import { SourceAccordionList } from './SourceAccordionList';
import { SourceSlider } from './SourceSlider';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScreenOptions } from '../ScreenOptions/ScreenOptions';

type PossibleLayout = {
  name?: string;
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

type PossibleChannels = {
  name: string;
  nodes: SourceNode[];
};

const _defaultChannels: PossibleChannels[] = [
  {
    name: 'Panamericanos C13',
    nodes: [
      '13gopan10',
      '13gopan1',
      '13gopan2',
      '13gopan3',
      '13gopan4',
      '13gopan5',
      '13gopan6',
      '13gopan7',
      '13gopan8',
      '13gopan9'
    ].map(slug => ({ sourceSlug: slug, uuid: uuid() }))
  },
  {
    name: 'Panamericanos TVN',
    nodes: [
      'tvn-stgo2023-1',
      'tvn-stgo2023-2',
      'tvn-stgo2023-3',
      'tvn-stgo2023-4',
      'tvn-stgo2023-5',
      'tvn-stgo2023-6',
      'tvn-stgo2023-7',
      'tvn-stgo2023-8',
      'tvn-stgo2023-9'
    ].map(slug => ({ sourceSlug: slug, uuid: uuid() }))
  },
  {
    name: 'Panamericanos CHV',
    nodes: [
      'chv-stgo2023-1',
      'chv-stgo2023-2',
      'chv-stgo2023-3',
      'chv-stgo2023-4',
      'chv-stgo2023-5',
      'chv-stgo2023-6',
      'chv-stgo2023-7'
    ].map(slug => ({ sourceSlug: slug, uuid: uuid() }))
  }
];

type Props = {
  selectedSourceSlug: string | undefined;
  onSelect: (source: SourceType) => void;
  onSourceSwap?: () => void;
  onSizeChange: (size: GridSize) => void;
  onSourceAdd?: () => void;
  onPromote?: () => void;
  onModeChange?: (selectedMode: DisplayMode) => void;
  onShare?: () => void;
  mode: DisplayMode;
  size: GridSize;
};

export const MonitorPanel = ({
  onSelect,
  selectedSourceSlug,
  onSourceSwap,
  onSizeChange,
  onSourceAdd,
  onModeChange,
  onPromote,
  onShare,
  mode,
  size
}: Props) => {
  const [, setDisplayConfig] = useDisplayConfig();

  return (
    <Tabs defaultValue="sources">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="sources">Canales</TabsTrigger>
        <TabsTrigger value="layouts">Layouts</TabsTrigger>
      </TabsList>
      <TabsContent value="sources">
        <SourceAccordionList
          onSelect={onSelect}
          selectedSourceSlug={selectedSourceSlug}
        />
      </TabsContent>
      <TabsContent value="layouts">
        <Card className="bg-neutral-800">
          <CardHeader>
            <CardTitle>Layouts</CardTitle>
            <CardDescription>Disposiciones de pantalla</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3">
              {possibleLayouts.map(layout => (
                <Button
                  variant="unstyled"
                  key={layout.name}
                  onClick={() => setDisplayConfig(layout.config)}
                  className="h-full w-full"
                >
                  <Image
                    alt=""
                    src={`/img/layout/${layout.imgName}`}
                    width="320"
                    height="180"
                    className=""
                  />
                </Button>
              ))}
            </div>
            <ScreenOptions
              onSizeChange={onSizeChange}
              onSourceAdd={onSourceAdd}
              onModeChange={onModeChange}
              onPromote={onPromote}
              onShare={onShare}
              mode={mode}
              size={size}
            />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
