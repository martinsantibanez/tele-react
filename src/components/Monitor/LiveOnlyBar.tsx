'use client';
import { Eye, EyeOff, Plus, Radio } from 'lucide-react';

type Props = {
  /** The screen's live-only tiles, on air or not. */
  total: number;
  onAir: number;
  showOffAir: boolean;
  onToggleShowOffAir: () => void;
  onAdd: () => void;
};

/**
 * The grid's live-only extras, from the picker: how many there are and how
 * many are on, a switch to draw the ones off air so they can be picked and
 * changed, and a way to add one without giving up a tile of the grid.
 */
export function LiveOnlyBar({
  total,
  onAir,
  showOffAir,
  onToggleShowOffAir,
  onAdd
}: Props) {
  const button =
    'flex h-6 items-center gap-1 rounded px-2 text-[11px] font-medium transition-colors';
  return (
    <div className="mt-2 flex flex-none items-center gap-2 rounded border border-gray-800 px-2 py-1.5 text-xs">
      <Radio size={14} className="flex-none text-red-500" aria-hidden />
      <div className="min-w-0 flex-1">
        <div className="font-semibold text-gray-200">Solo en vivo</div>
        <div className="truncate text-[11px] text-gray-400">
          {total
            ? `${total} ${total === 1 ? 'canal' : 'canales'} · ${onAir} al aire`
            : 'Canales que se suman al estar en vivo'}
        </div>
      </div>
      {total > 0 && (
        <button
          type="button"
          onClick={onToggleShowOffAir}
          aria-pressed={showOffAir}
          title={
            showOffAir
              ? 'Ocultar los que están fuera del aire'
              : 'Mostrar los que están fuera del aire, para cambiarlos'
          }
          className={`${button} ${
            showOffAir ? 'bg-white text-black' : 'bg-gray-800 hover:bg-gray-700'
          }`}
        >
          {showOffAir ? <EyeOff size={12} /> : <Eye size={12} />}
          {showOffAir ? 'Ocultar' : 'Mostrar'}
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
