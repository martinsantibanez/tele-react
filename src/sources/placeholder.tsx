import { SourcesMap } from '.';
import { BsFullscreen, BsPaintBucket } from 'react-icons/bs';

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
    component: (
      <img
        className="embed-responsive-item w-100 h-100"
        src="/imagenes/SinSenal.png"
        alt="Sin señal"
      />
    )
  }
};
