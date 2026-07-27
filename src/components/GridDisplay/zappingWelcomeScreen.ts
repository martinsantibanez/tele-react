import { DisplayMode, ScreenType } from '../../types/Monitor';

/**
 * Screen applied the moment a Zapping account gets linked: the open channels
 * people actually pair for, in the 1-big-plus-5 layout. Only the slugs live
 * here — the sources themselves come from the Zapping catalogue (see
 * `useZappingWelcomeScreen`).
 */
export const zappingWelcomeScreen: ScreenType = {
  sources: [
    {
      sourceSlug: 'custom_zapping_5',
      uuid: '49572de6-f374-429a-9847-27b27b29a73d'
    },
    {
      sourceSlug: 'custom_zapping_4',
      uuid: '52ae39e9-7d24-43cc-bda9-cd4c1ce4742e'
    },
    {
      sourceSlug: 'custom_zapping_6',
      uuid: '758768dd-c03b-4848-970c-df389218cf2a'
    },
    {
      sourceSlug: 'custom_zapping_3',
      uuid: '7a2e6b7d-835d-45b4-b648-2c6e37e79994'
    },
    {
      sourceSlug: 'custom_zapping_225',
      uuid: 'e15622f4-51fa-49e4-b27d-944b4a24979d'
    },
    {
      sourceSlug: 'custom_zapping_6381',
      uuid: 'd1d4ad46-10a1-468e-b520-f0273e92dd46'
    }
  ],
  config: {
    mode: DisplayMode.Layout,
    layout: [
      { cols: 8, rows: 6 },
      { cols: 4, rows: 3 },
      { cols: 4, rows: 3 },
      { cols: 4, rows: 3 },
      { cols: 4, rows: 3 },
      { cols: 4, rows: 3 }
    ],
    grid: { size: 3 }
  }
};
