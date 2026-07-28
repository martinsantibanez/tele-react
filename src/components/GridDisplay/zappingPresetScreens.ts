import type { SavedScreen } from '../../hooks/useSavedScreens';
import { DisplayMode, SourceNode } from '../../types/Monitor';
import { initialLayout } from '../Monitor/predefinedLayouts';

/**
 * The four broadcast channels, as fresh nodes on every call: `Nacionales` and
 * `Vista general` start from the same set but are screens of their own, so
 * neither should hold a reference into the other.
 */
const canalesNacionales = (): SourceNode[] => [
  {
    // TVN
    sourceSlug: 'custom_zapping_5',
    uuid: '49572de6-f374-429a-9847-27b27b29a73d',
    muted: false
  },
  {
    // Mega
    sourceSlug: 'custom_zapping_4',
    uuid: '52ae39e9-7d24-43cc-bda9-cd4c1ce4742e',
    muted: true
  },
  {
    // Chilevisión
    sourceSlug: 'custom_zapping_6',
    uuid: '7a2e6b7d-835d-45b4-b648-2c6e37e79994',
    muted: true
  },
  {
    // Canal 13
    sourceSlug: 'custom_zapping_3',
    uuid: '758768dd-c03b-4848-970c-df389218cf2a',
    muted: true
  }
];
const vistaGeneral = (): SourceNode[] => [
  {
    sourceSlug: 'custom_zapping_52',
    uuid: '49572de6-f374-429a-9847-27b27b29a73d',
    muted: true
  },
  {
    sourceSlug: 'custom_zapping_2391',
    uuid: '7f5f691f-c30d-4dcc-b3c8-a7ad454258de',
    muted: true
  },
  {
    sourceSlug: 'custom_zapping_2551',
    uuid: '7a2e6b7d-835d-45b4-b648-2c6e37e79994',
    muted: true
  },
  {
    sourceSlug: 'custom_zapping_6821',
    uuid: 'bdfc4299-af90-4a2e-838e-3f3d6a8de7f5',
    muted: true
  },
  {
    sourceSlug: 'custom_zapping_5',
    uuid: 'e4e0f24d-f8b7-48f6-9ed9-1957d6dd40f3',
    muted: true
  },
  {
    sourceSlug: 'custom_zapping_6',
    uuid: '134cc3a7-6b84-4738-aa40-285e2f4a7a9c',
    muted: true
  },
  {
    sourceSlug: 'custom_zapping_4',
    uuid: 'b0657757-32d3-475c-ae18-c3f992520152',
    muted: true
  },
  {
    sourceSlug: 'custom_zapping_3',
    uuid: '0f176d7a-8826-4432-a84a-7a156783ab58',
    muted: true
  },
  {
    sourceSlug: 'custom_zapping_142',
    uuid: '52ae39e9-7d24-43cc-bda9-cd4c1ce4742e',
    muted: true
  },
  {
    sourceSlug: 'custom_zapping_202',
    uuid: '758768dd-c03b-4848-970c-df389218cf2a',
    muted: true
  },
  {
    sourceSlug: 'custom_zapping_5361',
    uuid: '571538dd-478d-4ae9-b4bf-958854cb9a89',
    muted: true
  },
  {
    sourceSlug: 'custom_zapping_163',
    uuid: '487a7eac-7286-4ee8-a07d-9328f5f40bce',
    muted: false
  },
  {
    sourceSlug: 'custom_zapping_74',
    uuid: '97435fc0-d545-4ad7-a6d1-3d0ee1bf4d3d',
    muted: true
  },
  {
    sourceSlug: 'custom_zapping_193',
    uuid: 'ed2daa3c-5385-4c88-b7b4-ab11cb6cb287',
    muted: true
  },
  {
    sourceSlug: 'custom_zapping_130',
    uuid: '6a8a66b7-32ed-46e3-b70c-a9cacdd59b93',
    muted: true
  },
  {
    sourceSlug: 'custom_zapping_129',
    uuid: '452edac6-fea0-41d2-8f4a-b8808912f4f2',
    muted: true
  }
];

/**
 * The screens a Zapping account is set up with: the channels people actually
 * pair for, arranged the way they get watched. Only the slugs live here — the
 * sources themselves come from the Zapping catalogue (see
 * `useZappingPresetScreens`).
 *
 * The name is what the seeding upserts on, so renaming one here leaves the old
 * screen behind and adds a second one rather than replacing it.
 *
 * The grid-mode screens carry a layout as well, so switching one of them over
 * to Layout lands on the arrangement it was built for rather than a stray one.
 */
export const zappingPresetScreens: SavedScreen[] = [
  {
    name: 'Noticias',
    screen: {
      config: {
        mode: DisplayMode.Layout,
        layout: initialLayout,
        grid: { size: 3 }
      },
      sources: [
        {
          // 24 Horas
          sourceSlug: 'custom_zapping_52',
          uuid: '49572de6-f374-429a-9847-27b27b29a73d',
          muted: true
        },
        {
          // CNN Chile
          sourceSlug: 'custom_zapping_142',
          uuid: '52ae39e9-7d24-43cc-bda9-cd4c1ce4742e',
          muted: true
        },
        {
          // Bio Bio TV
          sourceSlug: 'custom_zapping_202',
          uuid: '7a2e6b7d-835d-45b4-b648-2c6e37e79994',
          muted: true
        },
        {
          // Meganoticias
          sourceSlug: 'custom_zapping_2551',
          uuid: '758768dd-c03b-4848-970c-df389218cf2a',
          muted: true
        },
        {
          // CHV Noticias, the one left audible.
          sourceSlug: 'custom_zapping_2391',
          uuid: 'e15622f4-51fa-49e4-b27d-944b4a24979d',
          muted: false
        },
        {
          // T13
          sourceSlug: 'custom_zapping_6821',
          uuid: 'd1d4ad46-10a1-468e-b520-f0273e92dd46',
          muted: true
        }
      ]
    }
  },
  {
    name: 'Nacionales',
    screen: {
      config: {
        mode: DisplayMode.Grid,
        layout: initialLayout,
        grid: { size: 2 }
      },
      sources: canalesNacionales()
    }
  },
  {
    name: 'Vista general',
    screen: {
      config: {
        mode: DisplayMode.Grid,
        layout: initialLayout,
        grid: { size: 4 }
      },
      sources: vistaGeneral()
    }
  }
];
