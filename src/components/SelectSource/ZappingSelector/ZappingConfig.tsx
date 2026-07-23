'use client';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, LogOut } from 'lucide-react';
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
import {
  useZappingLoginToken,
  useZappingSessionStatus,
  useZappingToken
} from '../../../hooks/useZappingConfig';
import { SourceType } from '../../../sources';
import { canalesZapping } from './canales';

const arrayCanales = Object.values(canalesZapping);
export const zappingSources = arrayCanales
  .sort((a, b) => a.number - b.number)
  .map(canal => {
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
  const [loginToken, setZappingLoginToken] = useZappingLoginToken();
  const [sessionStatus, setSessionStatus] = useZappingSessionStatus();
  const [playToken, setPlayToken] = useZappingToken();

  const isStarting = sessionStatus === 'starting';
  const isConnected = Boolean(loginToken || playToken);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      jsonInput: ''
    }
  });
  const applyToken = (token: string | undefined) => {
    if (!token || token === loginToken) return;
    setSessionStatus('starting');
    setZappingLoginToken(token);
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    applyToken(values.jsonInput.replaceAll("'", '').trim());
  };

  const handleImportToken = () => {
    applyToken(window.sessionStorage.getItem('loginToken') || undefined);
  };

  /**
   * Drops the stored credential, which unmounts the heartbeat loop in
   * `useZappingSession`, and clears the live token so nothing keeps playing.
   */
  const handleDisconnect = () => {
    setZappingLoginToken(undefined);
    setPlayToken(undefined);
    setSessionStatus('idle');
    form.reset();
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
                Inicia sesión en{' '}
                <a
                  href="https://app.zapping.com/webplayer"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: 'underline' }}
                >
                  Zapping
                </a>
                , reproduce un canal, y copia esto en la consola (F12):
                <pre>{`window.sessionStorage.loginToken`}</pre>
                Pega el resultado a continuación (se renueva solo):
              </p>
              <p className="text-xs text-muted-foreground">
                Tu token se guarda solo en este navegador y se usa únicamente
                para pedirle el stream a Zapping: nunca se envía ni se guarda.
                Puedes revisar el código en{' '}
                <a
                  href="https://github.com/martinsantibanez/tele-react"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: 'underline' }}
                >
                  GitHub
                </a>
                .
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
                            type="password"
                            {...field}
                            className="col-span-2 h-8"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex items-center justify-end gap-2">
                    {sessionStatus === 'error' && (
                      <span className="text-xs text-destructive">
                        No se pudo iniciar la sesión
                      </span>
                    )}
                    {sessionStatus === 'ready' && (
                      <span className="text-xs text-muted-foreground">
                        Sesión lista
                      </span>
                    )}
                    <Button type="submit" disabled={isStarting}>
                      {isStarting && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {isStarting ? 'Conectando...' : 'Guardar'}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      <Button
        variant="outline"
        onClick={() => handleImportToken()}
        disabled={isStarting}
      >
        {isStarting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isStarting ? 'Conectando...' : 'Importar'}
      </Button>
      {isConnected && (
        <Button
          variant="outline"
          onClick={handleDisconnect}
          title="Borrar el token guardado en este navegador"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Desconectar
        </Button>
      )}
    </>
  );
}
