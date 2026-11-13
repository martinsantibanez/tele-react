import { CLOCK_SOURCE_SLUG } from '../../sources/relojes';
import { SourceNode } from '../../types/Monitor';

export const defaultGrid: SourceNode[] = [
  {
    sourceSlug: 'custom_24-horas',
    uuid: '72a3557a-d7f6-4af5-94b1-e59925c2be12',
    activeSignal: 'm3u8'
  },
  {
    sourceSlug: 'custom_t13',
    uuid: '2bbc3ccd-7c5c-49a0-9ffc-7ec5933f4d1f',
    activeSignal: 'm3u8'
  },
  {
    sourceSlug: 'custom_chilevision',
    uuid: 'd26245d4-4aab-429c-b674-dcc8d1a8a7c8'
  },
  {
    sourceSlug: 'custom_meganoticias',
    uuid: 'ff47f8e4-be38-4b03-9f1b-cb03061b70ec',
    activeSignal: 'm3u8'
  },
  {
    sourceSlug: 'custom_mediabanco-cl',
    uuid: '35376c19-bdf9-4f58-9656-d2dd38eb9207',
    source: {
      slug: 'custom_mediabanco-cl',
      name: 'Mediabanco Chile',
      imageUrl:
        'https://www.mediabanco.com/wp-content/uploads/2021/11/senal-logo2-1.png',
      iframeSrc:
        'https://directorcloud.grupoz.cl/storage/players/9/sheduler_d3a8114f4939915baety698ytfeernbk.html',
      m3u8Url:
        'https://scl.edge.grupoz.cl/mediabanco_prueba/live/playlist.m3u8',
      inputs: [
        {
          iframeSrc: 'https://live.grupoz.cl/b45b976a3814f9ac1b41dd6c3a1fe273'
        },
        { iframeSrc: 'https://rudo.video/live/mediabanco' },
        { iframeSrc: 'https://rudo.video/live/mediabanco2' }
      ]
    },
    activeSignal: 'm3u8'
  },
  {
    sourceSlug: CLOCK_SOURCE_SLUG,
    uuid: '75749ac2-129d-4b14-9f77-492593ba1fc4'
  }
];
