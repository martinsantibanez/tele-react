import { useHotkeys } from 'react-hotkeys-hook';
import { Button } from '../../../components/ui/button';
import { useCustomSources } from '../../hooks/useCustomSources';
import { SourceType } from '../../sources';
import { ZappingConfig, zappingSources } from './ZappingSelector/ZappingConfig';
import { canalesZapping } from './ZappingSelector/canales';
import screenfull from 'screenfull';

type Props = {
  selectedSourceSlug: string | undefined;
  onSelect: (source: SourceType) => void;
  onSourceSwap?: () => void;
};

const sources = zappingSources;

export function SourceSlider({
  onSelect,
  selectedSourceSlug,
  onSourceSwap
}: Props) {
  const selectedIndex = sources.findIndex(
    src => src.slug === selectedSourceSlug
  );

  const { createSource } = useCustomSources();

  const next = () => {
    updateSelectedChannel(
      Math.min(selectedIndex + 1, zappingSources.length - 1)
    );
  };

  const prev = () => {
    updateSelectedChannel(Math.max(selectedIndex - 1, 0));
  };

  const updateSelectedChannel = (index: number) => {
    const source = zappingSources[index];
    createSource(source);
    onSelect(source);
  };

  useHotkeys('left', () => prev(), { preventDefault: true });
  useHotkeys('right', () => next(), { preventDefault: true });
  useHotkeys('enter', () => (onSourceSwap ? onSourceSwap() : undefined), {
    preventDefault: true
  });
  useHotkeys('f', () => {
    if (screenfull.isEnabled) screenfull.toggle();
  });

  const startIndex = Math.max(selectedIndex - 2, 0);
  const endIndex = Math.min(zappingSources.length - 1, selectedIndex + 2);
  return (
    <div className="w-full h-full flex flex-col justify-center">
      <div className="flex justify-between items-center">
        <Button
          onClick={() => prev()}
          variant="ghost"
          className="h-full"
          disabled={selectedIndex === 0}
        >
          {'<'}
        </Button>
        {zappingSources.map((canal, canalIndex) => {
          if (canalIndex < startIndex || canalIndex > endIndex) return null;
          const isActive = canal.slug === selectedSourceSlug;
          const image = Object.values(canalesZapping)[canalIndex].image;
          const img = `https://davinci.zappingtv.com/gato/media/62/canales/white/${image}.png`;

          return (
            <div
              className={isActive ? 'bg-gray-800' : ''}
              onClick={() => {
                updateSelectedChannel(canalIndex);
              }}
              key={`zp_${canal.slug}`}
            >
              <div className="flex flex-col items-center gap-4 p-6">
                <img src={img} />
                {/* <div className="space-y-1"> */}
                {/* <h2 className="text-lg font-semibold">{canal.name}</h2> */}
                {/* </div> */}
              </div>
            </div>
          );
        })}
        <Button
          onClick={() => next()}
          variant="ghost"
          className="h-full"
          disabled={selectedIndex === zappingSources.length - 1}
        >
          {'>'}
        </Button>
      </div>
      <div className="flex">
        <div className="mt-3 flex flex-col mw-300 mr-6">
          <div>Keyboard shortcuts</div>
          <div className="flex flex-row gap-3">
            <div>
              <span className="font-bold text-xl">E</span> Toggle Edit Mode
            </div>
            <div>
              <span className="font-bold text-xl">Arrows</span> Preview
              Next/Previous source
            </div>
            <div>
              <span className="font-bold text-xl">Enter</span> Swap sources
            </div>
            <div>
              <span className="font-bold text-xl">F</span> Toggle Full Screen
            </div>
          </div>
          <ZappingConfig />
        </div>
      </div>
    </div>
  );
}
