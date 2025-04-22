'use client';
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
import { useZappingConfig } from '../../../hooks/useZappingConfig';
import { SourceType } from '../../../sources';
import { canalesZapping } from './canales';
import { useState } from 'react';

const arrayCanales = Object.values(canalesZapping);
export const zappingSources = arrayCanales.map(canal => {
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

type Props = {};

export function ZappingConfig({}: Props) {
  const { setZappingConfig } = useZappingConfig();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      jsonInput: ''
    }
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const tokenValue = values.jsonInput.replaceAll("'", '');
    setZappingConfig({ token: tokenValue });
  }

  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mt-3">
      <Button onClick={() => setIsOpen(v => !v)} variant="ghost">
        Configurar Zapping
      </Button>
      {isOpen && (
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
      )}
    </div>
  );
}
