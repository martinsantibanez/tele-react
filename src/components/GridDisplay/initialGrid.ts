import { v4 as uuidv4 } from 'uuid';
import { SourceNode } from '../../pages/monitor/types';

export const defaultGrid: SourceNode[] = [
  { sourceSlug: '24HTVN_YT', uuid: uuidv4() },
  { sourceSlug: 'T13_YT', uuid: uuidv4() },
  { sourceSlug: 'MEGA', uuid: uuidv4() },
  {
    sourceSlug: 'PLAZAITALIA_CIMA',
    uuid: uuidv4()
  },
  { sourceSlug: 'TVMAS', uuid: uuidv4() },
  { sourceSlug: 'RELOJ_CHILE', uuid: uuidv4() }
];
