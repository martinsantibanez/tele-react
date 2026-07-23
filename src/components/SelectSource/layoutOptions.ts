import { defaultDisplayConfig } from '../../hooks/useDisplayConfig';
import { DisplayConfig, DisplayMode } from '../../types/Monitor';
import { initialLayout, twoBigLayout } from '../Monitor/predefinedLayouts';

export type PossibleLayout = {
  name: string;
  config: DisplayConfig;
  imgName: string;
};

export const possibleLayouts: PossibleLayout[] = [
  {
    name: '1 + 5',
    config: defaultDisplayConfig,
    imgName: 'layout1.png'
  },
  {
    name: 'Grid 3',
    config: {
      layout: initialLayout,
      mode: DisplayMode.Grid,
      grid: { size: 3 }
    },
    imgName: 'layout2.png'
  },
  {
    name: 'Grid 2',
    config: {
      layout: initialLayout,
      mode: DisplayMode.Grid,
      grid: { size: 2 }
    },
    imgName: 'layout3.png'
  },
  {
    name: '2 grandes',
    config: {
      mode: DisplayMode.Layout,
      layout: twoBigLayout,
      grid: { size: 1 }
    },
    imgName: 'layout4.png'
  },
  {
    name: 'Grid 4',
    config: {
      layout: initialLayout,
      mode: DisplayMode.Grid,
      grid: { size: 4 }
    },
    imgName: 'layout5.png'
  }
];

export const findLayoutIndex = (config: DisplayConfig) =>
  possibleLayouts.findIndex(
    layout =>
      layout.config.mode === config.mode &&
      layout.config.grid.size === config.grid.size &&
      JSON.stringify(layout.config.layout) === JSON.stringify(config.layout)
  );
