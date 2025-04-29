'use client';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '../../../../components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '../../../../components/ui/form';
import { Input } from '../../../../components/ui/input';
import { useZappingToken } from '../../../hooks/useZappingConfig';
import { SourceType } from '../../../sources';
import { canalesZapping } from './canales';

const arrayCanales = Object.values(canalesZapping);
export const zappingSources = arrayCanales.map(canal => {
  const imageName = canal.image;
  const imageUrl = `https://davinci.zappingtv.com/gato/media/62/canales/white/${imageName}.png`;
  const source: SourceType = {
    slug: `custom_zapping_${canal.id}`,
    zappingChannel: canal.url,
    name: canal.name,
    imageUrl
  };
  return source;
});

const formSchema = z.object({
  jsonInput: z.string()
});

export function ZappingConfig() {
  const [, setZappingToken] = useZappingToken();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      jsonInput: ''
    }
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const tokenValue = values.jsonInput.replaceAll("'", '');
    setZappingToken(tokenValue);
  };

  const handleImportToken = () => {
    console.log(window.sessionStorage.getItem('playToken') || undefined);
    setZappingToken(window.sessionStorage.getItem('playToken') || undefined);
  };

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Zapping Config</Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="grid gap-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">Zapping</h4>
              <p className="text-sm text-muted-foreground">
                Copia esto en la consola de tu navegador (F12) en{' '}
                <a
                  href="https://app.zappingtv.com/player/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: 'underline' }}
                >
                  Zapping
                </a>
                :<pre>{`window.sessionStorage.playToken`}</pre>
                Pega el resultado a continuación:
              </p>
            </div>
            <div>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit, e => console.log(e))}
                  className="grid gap-2"
                >
                  {/* <div className="grid grid-cols-3 items-center gap-4"> */}
                  <FormField
                    control={form.control}
                    name="jsonInput"
                    render={({ field }) => (
                      <FormItem className="grid grid-cols-3 items-center gap-4">
                        <FormLabel>Token</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="..."
                            {...field}
                            className="col-span-2 h-8"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="text-right">
                    <Button type="submit">Guardar</Button>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      <Button variant="outline" onClick={() => handleImportToken()}>
        Importar
      </Button>
    </>
  );
}
