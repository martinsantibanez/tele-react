'use client';

const sections: { title: string; keys: [string, string][] }[] = [
  {
    title: 'Monitor',
    keys: [
      ['E', 'Abrir o cerrar el selector'],
      ['1 – 9', 'Destacar pantalla (⇧ para la 10 a la 18)'],
      ['Enter', 'Destacar / pantalla completa / cerrar selector'],
      ['Mantener Enter', 'Marcar para intercambiar'],
      ['Esc', 'Volver a la grilla / abrir o cerrar el selector'],
      ['G', 'Pantalla completa'],
      ['M', 'Silenciar']
    ]
  },
  {
    title: 'Pantalla destacada',
    keys: [['← → ↑ ↓', 'Destacar la anterior / siguiente']]
  },
  {
    title: 'Pantalla completa (Zapping)',
    keys: [
      ['← →', 'Retroceder / adelantar 5 s'],
      ['J / L', 'Retroceder / adelantar 10 s'],
      ['C', 'Crear un clip (también ✂ en la barra del video)'],
      ['I / O', 'Marcar inicio / fin del clip y editarlo']
    ]
  },
  {
    title: 'Pantalla completa (YouTube)',
    keys: [['C', 'Grabar un clip / terminar y editarlo (también ✂ arriba)']]
  },
  {
    title: 'Editor de clips',
    keys: [
      ['Espacio', 'Reproducir / pausar'],
      ['I / O', 'Marcar inicio / fin'],
      ['← →', 'Retroceder / adelantar 1 s (⇧ 5 s)'],
      [', .', 'Cuadro anterior / siguiente'],
      ['Inicio / Fin', 'Ir al inicio / fin del clip'],
      ['+ / −', 'Acercar / alejar la barra del clip (Ctrl + rueda en ambas)'],
      ['R', 'Traer lo último de la señal (Zapping)'],
      ['Esc', 'Cerrar']
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
