'use client';
import { CheckCircle2, Youtube } from 'lucide-react';
import { PropsWithChildren, ReactNode, useEffect, useRef } from 'react';
import { Button } from '../../../components/ui/button';
import {
  SetupStep,
  useConnectedProviders,
  useSetupSteps,
  useSetupWizard
} from '../../hooks/useSetupWizard';
import { useYoutubeAuth } from '../../hooks/useYoutubeAuth';
import { ZappingConnect } from '../SelectSource/ZappingSelector/ZappingConnect';
import { ZappingLogo } from '../SelectSource/ZappingSelector/ZappingLogo';

const Connected = ({ label }: { label: string }) => (
  <div className="flex items-center gap-2 rounded-md border border-green-700/50 bg-green-900/20 p-3 text-sm">
    <CheckCircle2 className="h-5 w-5 text-green-500" />
    {label}
  </div>
);

const StepHeader = ({
  icon,
  title,
  children
}: PropsWithChildren<{ icon: ReactNode; title: string }>) => (
  <div className="grid gap-2">
    <h1 className="flex items-center gap-3 text-2xl font-semibold">
      {icon}
      {title}
    </h1>
    <p className="text-muted-foreground">{children}</p>
  </div>
);

function ZappingStep() {
  const { zapping } = useConnectedProviders();
  return (
    <>
      <StepHeader
        icon={<ZappingLogo size={28} aria-hidden />}
        title="Conecta Zapping"
      >
        Los canales de TV chilena en alta calidad, con tu cuenta de Zapping.
      </StepHeader>
      {zapping ? (
        <Connected label="Cuenta de Zapping conectada" />
      ) : (
        <ZappingConnect autoFocus />
      )}
    </>
  );
}

function YoutubeStep() {
  const { isConnected, connect } = useYoutubeAuth();
  return (
    <>
      <StepHeader
        icon={<Youtube className="h-7 w-7" aria-hidden />}
        title="Conecta YouTube"
      >
        Mira en vivo los canales a los que estás suscrito, apenas empiezan a
        transmitir.
      </StepHeader>
      {isConnected ? (
        <Connected label="Cuenta de YouTube conectada" />
      ) : (
        <div className="grid gap-2">
          <Button onClick={connect} autoFocus>
            <Youtube className="mr-2 h-4 w-4" />
            Conectar con YouTube
          </Button>
          <p className="text-xs text-muted-foreground">
            Solo pedimos permiso de lectura (<code>youtube.readonly</code>).{' '}
            <a href="/privacy" className="underline underline-offset-2">
              Política de privacidad
            </a>
          </p>
        </div>
      )}
    </>
  );
}

/**
 * First-run setup: offers Zapping and YouTube one after the other (Zapping
 * alone on a TV, see `useSetupSteps`). Connecting
 * either swaps the open-web TV catalogue for the real streams; skipping both
 * keeps it, which is the only way the TV tab stays around.
 */
function SetupWizard({
  step,
  setStep,
  finish
}: Pick<ReturnType<typeof useSetupWizard>, 'setStep' | 'finish'> & {
  step: SetupStep;
}) {
  const providers = useConnectedProviders();
  const { any } = providers;
  const steps = useSetupSteps();
  const index = Math.max(steps.indexOf(step), 0);
  const isLast = index === steps.length - 1;
  const next = () => (isLast ? finish() : setStep(steps[index + 1]));

  // While a step is still to connect, its own button has the focus (see the
  // steps); once it is, moving on is all that's left, so the focus goes there
  // instead of being dropped with the button that just went away.
  const nextRef = useRef<HTMLButtonElement>(null);
  const stepConnected = providers[steps[index]];
  useEffect(() => {
    if (stepConnected) nextRef.current?.focus();
  }, [index, stepConnected]);

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background p-4">
      <div className="grid w-full max-w-md gap-6">
        <div
          className="flex items-center gap-2"
          aria-label={`Paso ${index + 1} de ${steps.length}`}
        >
          {steps.map((s, i) => (
            <span
              key={s}
              className={`h-1.5 flex-1 rounded-full ${
                i <= index ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>

        {steps[index] === 'zapping' ? <ZappingStep /> : <YoutubeStep />}

        <div className="flex items-center justify-between gap-2">
          {any ? (
            <span />
          ) : (
            <Button variant="ghost" onClick={finish}>
              Continuar sin conectar
            </Button>
          )}
          {/* On the last step with nothing linked, finishing *is* continuing
              without — one button says it. */}
          {(!isLast || any) && (
            <Button
              ref={nextRef}
              variant={any ? 'default' : 'outline'}
              onClick={next}
            >
              {isLast ? 'Listo' : 'Siguiente'}
            </Button>
          )}
        </div>
        {!any && (
          <p className="text-xs text-muted-foreground">
            Sin conectar nada verás los canales de TV abiertos, que son de menor
            calidad.
          </p>
        )}
        {/* Google's OAuth verification wants the policy linked from the home
            page, which is this wizard for anyone new. */}
        <p className="text-center text-xs text-muted-foreground">
          <a href="/privacy" className="underline underline-offset-2">
            Política de privacidad
          </a>
        </p>
      </div>
    </div>
  );
}

/**
 * Stands in for the app while setup is due. Rendering the wizard *instead* of
 * the monitor, rather than over it, keeps a wall of players from loading
 * behind a screen nobody can see yet.
 */
export function SetupGate({ children }: PropsWithChildren) {
  const { step, setStep, finish, pending } = useSetupWizard();
  if (step)
    return <SetupWizard step={step} setStep={setStep} finish={finish} />;
  // Blank rather than the app, so it doesn't flash up and vanish again while
  // it's still being worked out whether the wizard is due.
  if (pending) return <div className="min-h-[100dvh] bg-background" />;
  return <>{children}</>;
}
