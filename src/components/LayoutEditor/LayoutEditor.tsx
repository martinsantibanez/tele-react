'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, ArrowRight, Copy, Monitor as MonitorIcon, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useCustomLayouts, useSaveCustomLayout } from '../../hooks/useCustomLayouts';
import { useActiveScreen } from '../../hooks/useSavedScreens';
import {
  ColValues,
  DisplayMode,
  LayoutType,
  RowValues,
  SourceNode
} from '../../types/Monitor';
import { getSourceShortcutLabel } from '../../utils/sourceShortcut';
import { uuid } from '../../utils/uuid';
import { Layout } from '../Layout/Layout';
import { initialLayout, twoBigLayout } from '../Monitor/predefinedLayouts';
import { LayoutCanvas, tileColor } from './LayoutCanvas';
import {
  clampCols,
  clampRows,
  GRID_CELLS,
  isComplete,
  placeLayout,
  toSourceSnippet
} from './layoutPlacement';

const presets: { name: string; layout: LayoutType }[] = [
  { name: '1 grande + 5', layout: initialLayout },
  { name: '2 grandes + 3', layout: twoBigLayout },
  { name: 'Pantalla única', layout: [{ cols: 12, rows: 9 }] },
  {
    name: '3 columnas',
    layout: [
      { cols: 4, rows: 9 },
      { cols: 4, rows: 9 },
      { cols: 4, rows: 9 }
    ]
  }
];

/** The filler a new tile is cut from: a third of a row, a third of the height. */
const newTile = { cols: 4 as ColValues, rows: 3 as RowValues };

export function LayoutEditor() {
  const router = useRouter();
  const [layout, setLayout] = useState<LayoutType>(initialLayout);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [name, setName] = useState('Mi layout');
  const [showChannels, setShowChannels] = useState(false);
  const [copied, setCopied] = useState<string>();

  const [customLayouts, setCustomLayouts] = useCustomLayouts();
  const saveCustomLayout = useSaveCustomLayout();
  const [activeScreen, setActiveScreen] = useActiveScreen();

  const placement = useMemo(() => placeLayout(layout), [layout]);
  const complete = isComplete(placement);
  const selected = layout[selectedIdx];

  const editTile = (idx: number, cols: ColValues, rows: RowValues) =>
    setLayout(current =>
      current.map((tile, index) => (index === idx ? { cols, rows } : tile))
    );

  const resizeSelected = (dCols: number, dRows: number) => {
    if (!selected) return;
    editTile(
      selectedIdx,
      clampCols((selected.cols ?? 1) + dCols),
      clampRows((selected.rows ?? 1) + dRows)
    );
  };

  const addTile = () => {
    setLayout(current => [...current, { ...newTile }]);
    setSelectedIdx(layout.length);
  };

  const removeTile = (idx: number) => {
    if (layout.length <= 1) return;
    setLayout(current => current.filter((tile, index) => index !== idx));
    setSelectedIdx(current => Math.max(0, Math.min(current, layout.length - 2)));
  };

  const duplicateTile = (idx: number) => {
    setLayout(current => [
      ...current.slice(0, idx + 1),
      { ...current[idx] },
      ...current.slice(idx + 1)
    ]);
    setSelectedIdx(idx + 1);
  };

  // Order is everything here: the tiles are packed in the order they are
  // written, so moving one along the list is how a shape is rearranged.
  const moveTile = (idx: number, delta: number) => {
    const target = idx + delta;
    if (target < 0 || target >= layout.length) return;
    setLayout(current => {
      const next = [...current];
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
    setSelectedIdx(target);
  };

  const loadLayout = (next: LayoutType, nextName?: string) => {
    setLayout(next.map(tile => ({ ...tile })));
    setSelectedIdx(0);
    if (nextName) setName(nextName);
  };

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(undefined), 1500);
  };

  /**
   * Puts the layout on air. The screen keeps whatever channels it has; a layout
   * with more tiles than the screen has channels gets the rest as bars, so no
   * tile comes up empty.
   */
  const useOnMonitor = () => {
    setActiveScreen(screen => {
      const sources: SourceNode[] = [...screen.sources];
      while (sources.length < layout.length)
        sources.push({ sourceSlug: 'Barras', uuid: uuid() });
      return {
        ...screen,
        config: { ...screen.config, mode: DisplayMode.Layout, layout },
        sources
      };
    });
    router.push('/');
  };

  useHotkeys('left', () => resizeSelected(-1, 0), [selected, selectedIdx]);
  useHotkeys('right', () => resizeSelected(1, 0), [selected, selectedIdx]);
  useHotkeys('up', () => resizeSelected(0, -1), [selected, selectedIdx]);
  useHotkeys('down', () => resizeSelected(0, 1), [selected, selectedIdx]);
  useHotkeys('shift+left', () => moveTile(selectedIdx, -1), [layout, selectedIdx]);
  useHotkeys('shift+right', () => moveTile(selectedIdx, 1), [layout, selectedIdx]);
  useHotkeys('backspace,delete', () => removeTile(selectedIdx), [layout, selectedIdx]);
  useHotkeys('a', () => addTile(), [layout]);

  const stepper = (
    label: string,
    value: number,
    max: number,
    onChange: (value: number) => void
  ) => (
    <div className="flex items-center justify-between gap-2">
      <span className="text-sm text-gray-300">{label}</span>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="size-7"
          onClick={() => onChange(value - 1)}
          disabled={value <= 1}
        >
          −
        </Button>
        <span className="w-6 text-center text-sm tabular-nums">{value}</span>
        <Button
          variant="outline"
          size="icon"
          className="size-7"
          onClick={() => onChange(value + 1)}
          disabled={value >= max}
        >
          +
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen flex-col bg-neutral-950 text-white">
      <header className="flex flex-none items-center gap-3 border-b border-gray-800 px-4 py-3">
        <Link href="/" className="text-sm text-gray-400 hover:text-white">
          ← Monitor
        </Link>
        <h1 className="text-lg font-semibold">Editor de layouts</h1>
        <span className="text-xs text-gray-500">
          prueba de concepto — dibuja un layout sobre la grilla de 12×9
        </span>
      </header>

      <div className="flex min-h-0 flex-1">
        <main className="flex min-h-0 min-w-0 flex-1 flex-col items-center justify-center gap-4 p-6">
          {/* The board is a television: as large as the room allows, always
              16:9. Measured against this box rather than the page, the way the
              monitor itself is. */}
          <div
            className="flex min-h-0 w-full flex-1 flex-col justify-center"
            style={{ containerType: 'size' }}
          >
            <div
              className="min-h-0 flex-none self-center"
              style={{
                aspectRatio: 16 / 9,
                width: `min(100cqw, calc(100cqh * ${16 / 9}))`
              }}
            >
              {showChannels ? (
                <Layout
                  layout={layout}
                  sources={activeScreen.sources}
                  editingSourceIdx={selectedIdx}
                  onEdit={setSelectedIdx}
                  onRemove={removeTile}
                />
              ) : (
                <LayoutCanvas
                  layout={layout}
                  placement={placement}
                  selectedIdx={selectedIdx}
                  onSelect={setSelectedIdx}
                  onResize={editTile}
                />
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-gray-400">
            <span
              className={complete ? 'text-emerald-400' : 'text-yellow-400'}
            >
              {complete
                ? '✓ El layout cubre el monitor completo'
                : placement.overflowing.length
                  ? `⚠ ${placement.overflowing.length} pantalla(s) quedan fuera de las 9 filas`
                  : `⚠ Quedan ${placement.empty} celdas sin cubrir`}
            </span>
            <span>
              {placement.filled}/{GRID_CELLS} celdas · {layout.length} pantallas
              · {placement.rowsUsed} filas
            </span>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showChannels}
                onChange={event => setShowChannels(event.target.checked)}
              />
              Ver con los canales de la pantalla activa
            </label>
          </div>

          <div className="text-xs text-gray-500">
            Flechas: redimensionar · ⇧Flechas: reordenar · A: agregar · Supr:
            quitar · arrastra la esquina de una pantalla
          </div>
        </main>

        <aside className="flex w-[340px] flex-none flex-col gap-5 overflow-y-auto border-l border-gray-800 p-4">
          <section className="flex flex-col gap-2">
            <h2 className="text-sm font-semibold text-gray-300">Pantallas</h2>
            {layout.map((tile, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedIdx(idx)}
                className={`flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 ${
                  idx === selectedIdx ? 'bg-white/10' : 'hover:bg-white/5'
                }`}
              >
                <span
                  className="flex size-6 flex-none items-center justify-center rounded text-xs font-bold"
                  style={{ backgroundColor: tileColor(idx) }}
                >
                  {getSourceShortcutLabel(idx)}
                </span>
                <span className="flex-1 text-sm tabular-nums text-gray-300">
                  {tile.cols}×{tile.rows}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  title="Mover antes"
                  onClick={() => moveTile(idx, -1)}
                  disabled={idx === 0}
                >
                  <ArrowLeft />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  title="Mover después"
                  onClick={() => moveTile(idx, 1)}
                  disabled={idx === layout.length - 1}
                >
                  <ArrowRight />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  title="Quitar"
                  onClick={() => removeTile(idx)}
                  disabled={layout.length <= 1}
                >
                  <Trash2 />
                </Button>
              </div>
            ))}
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" onClick={addTile}>
                <Plus /> Agregar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => duplicateTile(selectedIdx)}
              >
                Duplicar
              </Button>
            </div>
          </section>

          {selected && (
            <section className="flex flex-col gap-2 rounded-md border border-gray-800 p-3">
              <h2 className="text-sm font-semibold text-gray-300">
                Pantalla {getSourceShortcutLabel(selectedIdx)}
              </h2>
              {stepper('Ancho (columnas)', selected.cols ?? 1, 12, value =>
                editTile(
                  selectedIdx,
                  clampCols(value),
                  clampRows(selected.rows ?? 1)
                )
              )}
              {stepper('Alto (filas)', selected.rows ?? 1, 9, value =>
                editTile(
                  selectedIdx,
                  clampCols(selected.cols ?? 1),
                  clampRows(value)
                )
              )}
            </section>
          )}

          <section className="flex flex-col gap-2">
            <h2 className="text-sm font-semibold text-gray-300">
              Empezar desde
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {presets.map(preset => (
                <Button
                  key={preset.name}
                  variant="outline"
                  size="sm"
                  onClick={() => loadLayout(preset.layout, preset.name)}
                >
                  {preset.name}
                </Button>
              ))}
            </div>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-sm font-semibold text-gray-300">Guardar</h2>
            <Input
              value={name}
              onChange={event => setName(event.target.value)}
              placeholder="Nombre del layout"
            />
            <Button onClick={() => saveCustomLayout(name, layout)}>
              Guardar layout
            </Button>
            {!!customLayouts.length && (
              <div className="flex flex-col gap-1">
                {customLayouts.map(entry => (
                  <div key={entry.id} className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1 justify-start"
                      onClick={() => loadLayout(entry.layout, entry.name)}
                    >
                      {entry.name}
                      <span className="ml-auto text-xs text-gray-500">
                        {entry.layout.length} pantallas
                      </span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      title="Borrar"
                      onClick={() =>
                        setCustomLayouts(saved =>
                          saved.filter(item => item.id !== entry.id)
                        )
                      }
                    >
                      <Trash2 />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-sm font-semibold text-gray-300">Usar</h2>
            <Button onClick={useOnMonitor}>
              <MonitorIcon /> Usar en el monitor
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => copy(JSON.stringify(layout, null, 2), 'json')}
              >
                <Copy /> {copied === 'json' ? 'Copiado' : 'JSON'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copy(toSourceSnippet(name, layout), 'code')}
              >
                <Copy /> {copied === 'code' ? 'Copiado' : 'Código'}
              </Button>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
