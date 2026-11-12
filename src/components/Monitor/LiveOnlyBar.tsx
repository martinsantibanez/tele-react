'use client';
import { Eye, EyeOff, Plus, Radio } from 'lucide-react';
import { LiveOnlyView } from '../../context/TeleContext';

type Props = {
  /** The screen's live-only tiles, on air or not. */
  total: number;
  onAir: number;
  view: LiveOnlyView;
  onCycleView: () => void;
  onAdd: () => void;
};

/**
 * The grid's live-only extras, from the picker: how many there are and how
 * many are on, a switch that cycles through drawing them all (the ones off
 * air too, so they can be picked and changed), only the ones on air, or none,
 * and a way to add one without giving up a tile of the grid.
 */
const VIEWS: Record<
  LiveOnlyView,
  { label: string; title: string; icon: typeof Eye; className: string }
> = {
  all: {
    label: 'Todos',
    title: 'Se ven todos, también los fuera del aire. Siguiente: solo en vivo',
    icon: Eye,
    className: 'bg-white text-black'
  },
  live: {
    label: 'En vivo',
    title: 'Se ven los que están al aire. Siguiente: ocultarlos todos',
    icon: Radio,
    className: 'bg-red-600 text-white hover:bg-red-500'
  },
  hide: {
    label: 'Ocultos',
    title: 'No se ve ninguno, ni al aire. Siguiente: verlos todos',
    icon: EyeOff,
    className: 'bg-gray-800 text-gray-400 hover:bg-gray-700'
  }
};

export function LiveOnlyBar({
  total,
  onAir,
  view,
  onCycleView,
  onAdd
}: Props) {
  const current = VIEWS[view];
  const Icon = current.icon;
  const button =
    'flex h-6 items-center gap-1 rounded px-2 text-[11px] font-medium transition-colors';
  return (
    <div className="mt-2 flex flex-none items-center gap-2 rounded border border-gray-800 px-2 py-1.5 text-xs">
      <Radio size={14} className="flex-none text-red-500" aria-hidden />
      <div className="min-w-0 flex-1">
        <div className="font-semibold text-gray-200">Solo en vivo</div>
        <div className="truncate text-[11px] text-gray-400">
          {total
            ? `${total} ${total === 1 ? 'canal' : 'canales'} · ${onAir} al aire${
                view === 'hide' ? ' · ocultos' : ''
              }`
            : 'Canales que se suman al estar en vivo'}
        </div>
      </div>
      {total > 0 && (
        <button
          type="button"
          onClick={onCycleView}
          title={current.title}
          aria-label={`Solo en vivo: ${current.label}. ${current.title}`}
          className={`${button} ${current.className}`}
        >
          <Icon size={12} />
          {current.label}
        </button>
      )}
      <button
        type="button"
        onClick={onAdd}
        title="Agrega una pantalla que solo aparece mientras su canal está en vivo"
        className={`${button} bg-gray-800 hover:bg-gray-700`}
      >
        <Plus size={12} />
        Agregar
      </button>
    </div>
  );
}
