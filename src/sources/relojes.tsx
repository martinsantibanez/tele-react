import { SourcesMap } from '.';
import { BsClockFill } from 'react-icons/bs';
import { WallClock } from '../components/Monitor/WallClock';

export const CLOCK_SOURCE_SLUG = 'RELOJ';

export const relojesSources: SourcesMap = {
  [CLOCK_SOURCE_SLUG]: {
    slug: CLOCK_SOURCE_SLUG,
    name: 'Reloj',
    titleIcons: [<BsClockFill key="clock" />],
    component: () => <WallClock />
  }
};
