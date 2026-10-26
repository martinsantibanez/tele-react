'use client';
import { ExternalLink, Loader2, RotateCw } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useRef } from 'react';
import { Button } from '../../../../components/ui/button';
import { useZappingActivation } from '../../../hooks/useZappingConfig';
import { useIsMobile } from '../../../hooks/useViewport';

const mmss = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

/**
 * Connects the app to a Zapping account by pairing it as a device: we show a
 * code, the user enters it at zapping.com while logged in, and the backend
 * hands us the durable loginToken.
 *
 * With `autoFocus`, each state's main button takes the focus as it appears, so
 * a remote's D-pad always has somewhere to start from.
 */
export function ZappingConnect({ autoFocus }: { autoFocus?: boolean }) {
  const {
    activation,
    linkUrl,
    isExpired,
    isRequesting,
    secondsLeft,
    error,
    start,
    cancel
  } = useZappingActivation();
  // The phone is what the code is scanned with, so it gets no code to scan.
  const isMobile = useIsMobile();

  // React only autofocuses form controls, so the link is focused by hand, once
  // per code: the countdown re-renders every second.
  const linkRef = useRef<HTMLAnchorElement>(null);
  const code = activation?.code;
  useEffect(() => {
    if (autoFocus && code) linkRef.current?.focus();
  }, [autoFocus, code]);

  return (
    <div className="grid gap-3">
      {activation ? (
        <div className="grid gap-2">
          <p className="text-sm text-muted-foreground">
            1. Entra a <b>zapping.com/smart</b> e inicia sesión.
            <br />
            2. Escribe este código:
          </p>
          <div className="text-center font-mono text-3xl font-bold tracking-[0.3em]">
            {activation.code}
          </div>
          {!isMobile && linkUrl && (
            <div className="grid justify-items-center gap-1">
              {/* The link carries the code, so scanning it lands on the page
                  with the code already filled in. Dark on white, with a quiet
                  zone around it, whatever the theme: phones read that best. */}
              <div className="rounded-md bg-white p-2">
                <QRCodeSVG value={linkUrl} size={132} marginSize={1} />
              </div>
              <span className="text-xs text-muted-foreground">
                O escanéalo con el celular
              </span>
            </div>
          )}
          <Button asChild variant="secondary">
            <a
              href={linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              ref={linkRef}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Abrir zapping.com/smart
            </a>
          </Button>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center">
              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
              Esperando confirmación...
            </span>
            <span>Expira en {mmss(secondsLeft)}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={cancel}>
            Cancelar
          </Button>
        </div>
      ) : (
        <div className="grid gap-2">
          <p className="text-sm text-muted-foreground">
            Vincula tu cuenta de Zapping con un código, igual que en un Smart TV.
            Funciona desde el celular.
          </p>
          {isExpired && (
            <p className="text-xs text-destructive">
              El código expiró. Pide uno nuevo.
            </p>
          )}
          {error && <p className="text-xs text-destructive">{error}</p>}
          <Button
            onClick={start}
            disabled={isRequesting}
            autoFocus={autoFocus}
          >
            {isRequesting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              isExpired && <RotateCw className="mr-2 h-4 w-4" />
            )}
            {isExpired ? 'Pedir otro código' : 'Vincular cuenta'}
          </Button>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Tu token se guarda solo en este navegador y se usa únicamente para
        pedirle el stream a Zapping: nunca se envía ni se guarda. Puedes revisar
        el código en{' '}
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
  );
}
