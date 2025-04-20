import {
  defaultDisplayConfig,
  useDisplayConfig
} from '../../hooks/useDisplayConfig';
import { useCleanLocalStorage } from '../../pages/index.page';
import {
  initialLayout,
  twoBigLayout
} from '../../pages/monitor/predefinedLayouts';
import {
  DisplayConfig,
  DisplayMode,
  SourceNode
} from '../../pages/monitor/types';
import { SourceType } from '../../sources';
import { uuid } from '../../utils/uuid';
import { SourceAccordionListNew } from './SourceListNew';

type Props = {
  selectedSourceSlug: string | undefined;
  onSelect: (source: SourceType) => void;
};

type PossibleLayout = {
  name?: string;
  config: DisplayConfig;
  imgName: string;
};

const possibleLayouts: PossibleLayout[] = [
  {
    config: defaultDisplayConfig,
    imgName: 'layout1.png'
  },
  {
    config: {
      layout: initialLayout,
      mode: DisplayMode.Grid,
      grid: { size: 3 }
    },
    imgName: 'layout2.png'
  },
  {
    config: {
      layout: initialLayout,
      mode: DisplayMode.Grid,
      grid: { size: 2 }
    },
    imgName: 'layout3.png'
  },
  {
    config: {
      mode: DisplayMode.Layout,
      layout: twoBigLayout,
      grid: { size: 1 }
    },
    imgName: 'layout4.png'
  },
  {
    config: {
      layout: initialLayout,
      mode: DisplayMode.Grid,
      grid: { size: 4 }
    },
    imgName: 'layout5.png'
  }
];

type PossibleChannels = {
  name: string;
  nodes: SourceNode[];
};

const _defaultChannels: PossibleChannels[] = [
  {
    name: 'Panamericanos C13',
    nodes: [
      '13gopan10',
      '13gopan1',
      '13gopan2',
      '13gopan3',
      '13gopan4',
      '13gopan5',
      '13gopan6',
      '13gopan7',
      '13gopan8',
      '13gopan9'
    ].map(slug => ({ sourceSlug: slug, uuid: uuid() }))
  },
  {
    name: 'Panamericanos TVN',
    nodes: [
      'tvn-stgo2023-1',
      'tvn-stgo2023-2',
      'tvn-stgo2023-3',
      'tvn-stgo2023-4',
      'tvn-stgo2023-5',
      'tvn-stgo2023-6',
      'tvn-stgo2023-7',
      'tvn-stgo2023-8',
      'tvn-stgo2023-9'
    ].map(slug => ({ sourceSlug: slug, uuid: uuid() }))
  },
  {
    name: 'Panamericanos CHV',
    nodes: [
      'chv-stgo2023-1',
      'chv-stgo2023-2',
      'chv-stgo2023-3',
      'chv-stgo2023-4',
      'chv-stgo2023-5',
      'chv-stgo2023-6',
      'chv-stgo2023-7'
    ].map(slug => ({ sourceSlug: slug, uuid: uuid() }))
  }
];

export const SelectSource = ({ onSelect, selectedSourceSlug }: Props) => {
  const [, setDisplayConfig] = useDisplayConfig();
  // const [selectedSources, setSelectedSources] = useSavedGrid();
  const cleanLocalStorage = useCleanLocalStorage();

  return (
    <SourceAccordionListNew
      onSelect={onSelect}
      selectedSourceSlug={selectedSourceSlug}
    />
  );

  // return (
  //   <Tabs defaultActiveKey="list">
  //     <Tab eventKey="list" title="Canales">
  //       <SourceAccordionList
  //         onSelect={onSelect}
  //         selectedSourceSlug={selectedSourceSlug}
  //       />
  //     </Tab>
  //     <Tab eventKey="layouts" title="Layouts">
  //       {/* <Card className="mb-3">
  //         <Card.Header>Grupos de Canales</Card.Header>
  //         <Card.Body className="d-flex flex-wrap">
  //           <ListGroup>
  //             {defaultChannels.map(channels => (
  //               <ListGroup.Item
  //                 key={channels.name}
  //                 action
  //                 onClick={() => setSelectedSources(channels.nodes)}
  //               >
  //                 {channels.name}
  //               </ListGroup.Item>
  //             ))}
  //             <ListGroup.Item
  //               action
  //               href="https://results-santiago2023.org/#/schedule/daily"
  //               target="_blank"
  //               rel="noopener noreferrer"
  //             >
  //               Resultados Panamericanos
  //             </ListGroup.Item>
  //           </ListGroup>
  //         </Card.Body>
  //       </Card> */}
  //       <Card className="mb-3">
  //         <Card.Header>Layouts</Card.Header>
  //         <Card.Body className="d-flex flex-wrap">
  //           <ListGroup>
  //             {possibleLayouts.map(layout => (
  //               <ListGroup.Item
  //                 key={layout.name}
  //                 action
  //                 onClick={() => setDisplayConfig(layout.config)}
  //               >
  //                 <Image
  //                   alt=""
  //                   src={`/img/layout/${layout.imgName}`}
  //                   width="160"
  //                   height="90"
  //                 />
  //               </ListGroup.Item>
  //             ))}
  //           </ListGroup>
  //         </Card.Body>
  //       </Card>

  //       <SavedSources />
  //       <Card>
  //         <Card.Body className="d-flex flex-wrap">
  //           <Button onClick={() => cleanLocalStorage()}>Limpiar todo</Button>
  //         </Card.Body>
  //       </Card>
  //     </Tab>
  //   </Tabs>
  // );
};
