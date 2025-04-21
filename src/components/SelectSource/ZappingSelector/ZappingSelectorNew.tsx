'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useHotkeys } from 'react-hotkeys-hook';
import { z } from 'zod';
import { Button } from '../../../../components/ui/button';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Form
} from '../../../../components/ui/form';
import { Input } from '../../../../components/ui/input';
import { useCustomSources } from '../../../hooks/useCustomSources';
import { useZappingConfig } from '../../../hooks/useZappingConfig';
import { SourceType } from '../../../sources';
import { canalesZapping } from './canales';

const arrayCanales = Object.values(canalesZapping);
const zappingSources = arrayCanales.map(canal => {
  const source: SourceType = {
    slug: `custom_zapping_${canal.id}`,
    zappingChannel: canal.url,
    name: canal.name
  };
  return source;
});

const formSchema = z.object({
  jsonInput: z.string()
});

type Props = {
  onSourceSelect: (source: SourceType) => void;
  selectedSourceSlug: string | undefined;
};

export function ZappingSelectorNew({
  onSourceSelect,
  selectedSourceSlug
}: Props) {
  const { setZappingConfig } = useZappingConfig();
  const [jsonInput, setJsonInput] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(2);

  const { createSource } = useCustomSources();

  const updateSelectedChannel = (sourceIndex: number) => {
    setSelectedIndex(sourceIndex);
    const source = zappingSources[selectedIndex];
    createSource(source);
    onSourceSelect(source);
  };

  const next = () => {
    setSelectedIndex(prevIndex =>
      Math.min(prevIndex + 1, arrayCanales.length - 1)
    );
  };

  const prev = () => {
    setSelectedIndex(prevIndex => Math.max(prevIndex - 1, 0));
  };
  // const handleKeyDown = (event: React.KeyboardEvent) => {
  //   if (event.key === 'ArrowUp') {
  //     setSelectedIndex(prevIndex => Math.max(prevIndex - 1, 0));
  //   } else if (event.key === 'ArrowDown') {
  //     setSelectedIndex(prevIndex =>
  //       Math.min(prevIndex + 1, arrayCanales.length - 1)
  //     );
  //   }
  // };

  const startIndex = Math.max(selectedIndex - 2, 0);
  const endIndex = Math.min(arrayCanales.length - 1, selectedIndex + 2);

  useHotkeys('left', () => prev(), { preventDefault: true });
  useHotkeys('right', () => next(), { preventDefault: true });
  useHotkeys('enter', () => updateSelectedChannel(selectedIndex), {
    preventDefault: true
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      jsonInput: ''
    }
  });

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log('values', values);
    const tokenValue = values.jsonInput.replaceAll("'", '');
    console.log({ tokenValue });
    setZappingConfig({ token: tokenValue });
  }

  return (
    <div className="flex flex-col">
      <div>
        <Button
          onClick={() => prev()}
          variant="outline"
          disabled={selectedIndex === 0}
        >
          {'<'}
        </Button>
        {zappingSources.map((canal, canalIndex) => {
          if (canalIndex < startIndex || canalIndex > endIndex) return null;

          const isActive = canalIndex === selectedIndex;
          return (
            <Button
              onClick={() => updateSelectedChannel(canalIndex)}
              variant={isActive ? 'secondary' : 'outline'}
              key={`zapping_${canal.slug}`}
            >
              {canal.name}
            </Button>
          );
        })}
        <Button
          onClick={() => next()}
          variant="outline"
          disabled={selectedIndex === arrayCanales.length - 1}
        >
          {'>'}
        </Button>
      </div>
      <div>
        <div>
          Pega esto en la consola en{' '}
          <a
            href="https://app.zappingtv.com/player/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: 'underline' }}
          >
            Zapping
          </a>
          <pre>{`window.sessionStorage.playToken`}</pre>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit, e => console.log(e))}>
              <FormField
                control={form.control}
                name="jsonInput"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Introduce el resultado:</FormLabel>
                    <FormControl>
                      <Input placeholder="token..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Submit</Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
