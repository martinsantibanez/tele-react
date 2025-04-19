import { BsFullscreen, BsPaintBucket } from 'react-icons/bs';
import { SourcesMap } from '.';

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
      <img
        className="embed-responsive-item w-full h-full"
        src="/imagenes/SinSenal.png"
        alt="Sin señal"
      />
    )
  }
};
