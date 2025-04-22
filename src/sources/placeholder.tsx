import { BsFullscreen, BsPaintBucket } from 'react-icons/bs';
import { SourcesMap } from '.';
import { Barras } from '../components/Monitor/SourceOutput/SourceProvider/Barras';

export const placeHolderSources: SourcesMap = {
  Vacio: {
    slug: 'Vacio',
    titleIcons: [<BsFullscreen key="screen" />],
    name: 'VACIO',
    iframeSrc: ''
  },
  Barras: {
    slug: 'Barras',
    titleIcons: [<BsPaintBucket key="screen" />],
    name: 'Barras',
    component: () => (
      <Barras />
    )
  }
};
