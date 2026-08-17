import { PLACEHOLDER_SOURCE_SLUG } from '../../sources/placeholder';
import { LayoutType, SourceNode } from '../../types/Monitor';
import { uuid } from '../../utils/uuid';

// Layouts are laid out on a 12 cols x 9 rows grid and must tile it completely,
// otherwise the screens only cover part of the monitor.

// 1 big + 5 small
export const initialLayout: LayoutType = [
  {
    cols: 8,
    rows: 6
  },
  {
    cols: 4,
    rows: 3
  },
  {
    cols: 4,
    rows: 3
  },
  {
    cols: 4,
    rows: 3
  },
  {
    cols: 4,
    rows: 3
  },
  {
    cols: 4,
    rows: 3
  }
];

// 2 big on top + 3 small below
export const twoBigLayout: LayoutType = [
  {
    cols: 6,
    rows: 5
  },
  {
    cols: 6,
    rows: 5
  },
  {
    cols: 4,
    rows: 4
  },
  {
    cols: 4,
    rows: 4
  },
  {
    cols: 4,
    rows: 4
  }
];

export const fitSourcesToLayout = (
  sources: SourceNode[],
  layout: LayoutType
): SourceNode[] => {
  const slots = layout.length;
  if (sources.length === slots) return sources;
  if (sources.length > slots) return sources.slice(0, slots);
  return [
    ...sources,
    ...Array.from({ length: slots - sources.length }, () => ({
      sourceSlug: PLACEHOLDER_SOURCE_SLUG,
      uuid: uuid()
    }))
  ];
};
