'use client';

const sections: { title: string; keys: [string, string][] }[] = [
  {
    title: 'Monitor',
    keys: [
      ['E', 'Abrir o cerrar el selector'],
      ['1 – 9', 'Elegir pantalla (⇧ para la 10 a la 18)'],
      ['Enter', 'Pantalla completa / cerrar selector'],
      ['Mantener Enter', 'Marcar para intercambiar'],
      ['Esc', 'Abrir o cerrar el selector'],
      ['G', 'Pantalla completa'],
      ['M', 'Silenciar']
    ]
  },
  {
    title: 'Selector',
    keys: [
      ['← →', 'Cambiar categoría'],
      ['↑ ↓', 'Cambiar canal, pantalla o distribución'],
      ['/', 'Buscar canal'],
      ['F', 'Agregar o quitar de favoritos'],
      ['TAB', 'Cambiar señal']
    ]
  },
  {
    title: 'Pantallas guardadas',
    keys: [
      ['Z / X', 'Anterior / siguiente'],
      ['RePág / AvPág', 'Anterior / siguiente'],
      ['S', 'Nueva pantalla'],
      ['R', 'Renombrar'],
      ['⇧D', 'Eliminar']
    ]
  }
];

/**
 * Every keyboard shortcut, unfolded under the picker by F1. It stays out of
 * the way of the keys it lists, so they can be tried while it is open. The
 * keys that belong to a control are also written on it.
 */
export function ShortcutsHelp() {
  return (
    <div className="flex flex-col gap-2">
      {sections.map(section => (
        <div key={section.title} className="flex flex-col gap-1">
          <div className="text-[10px] font-semibold tracking-wide text-gray-400 uppercase">
            {section.title}
          </div>
          {section.keys.map(([keys, label]) => (
            <div key={keys + label} className="leading-tight">
              <span className="font-bold">{keys}</span> {label}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
