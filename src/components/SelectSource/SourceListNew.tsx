import { useHotkeys } from 'react-hotkeys-hook';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { useCustomSources } from '../../hooks/useCustomSources';
import { SourceType } from '../../sources';
import { ZappingConfig, zappingSources } from './ZappingSelector/ZappingConfig';

type Props = {
  selectedSourceSlug: string | undefined;
  onSelect: (source: SourceType) => void;
  onSourceSwap?: () => void;
};

const sources = zappingSources;

export function SourceAccordionListNew({
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

  const startIndex = Math.max(selectedIndex - 2, 0);
  const endIndex = Math.min(zappingSources.length - 1, selectedIndex + 2);
  return (
    <div className="w-full h-full flex flex-col justify-center align-center">
      <div className="flex justify-between">
        <Button
          onClick={() => prev()}
          variant="outline"
          disabled={selectedIndex === 0}
        >
          {'<'}
        </Button>
        {zappingSources.map((canal, canalIndex) => {
          if (canalIndex < startIndex || canalIndex > endIndex) return null;
          const isActive = canal.slug === selectedSourceSlug;

          return (
            <Card
              className={isActive ? 'bg-gray-800' : ''}
              onClick={() => {
                updateSelectedChannel(canalIndex);
              }}
              key={`zp_${canal.slug}`}
            >
              <CardContent className="flex flex-row items-center gap-4 p-6">
                <div className="space-y-1">
                  <h2 className="text-lg font-semibold">{canal.name}</h2>
                </div>
              </CardContent>
            </Card>
          );
        })}
        <Button
          onClick={() => next()}
          variant="outline"
          disabled={selectedIndex === zappingSources.length - 1}
        >
          {'>'}
        </Button>
      </div>
      <div className="flex">
        <div className="mt-3 flex flex-col mw-300 mr-6">
          <div>Keyboard shortcuts</div>
          <div>
            <span className="font-bold text-xl">E</span> Enter/exit edit mode
          </div>
          <div>
            <span className="font-bold text-xl">Arrows</span> Preview
            Next/Previous source
          </div>
          <div>
            <span className="font-bold text-xl">Enter</span> Swap sources
          </div>
        </div>
        <ZappingConfig />
      </div>
    </div>
  );
}
