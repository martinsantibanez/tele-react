import { BsCameraFill } from 'react-icons/bs';
import { SourcesMap } from '.';

const cameraIcon = <BsCameraFill key="camara" />;
export const camarasSources: SourcesMap = {
  PLAZAITALIA_CIMA: {
    slug: 'PLAZAITALIA_CIMA',
    flag: 'cl',
    titleIcons: [cameraIcon],
    name: 'PLAZA DIGNIDAD',
    youtubeChannelId: 'UC4GOcOKkEefz5NamN4WyMFg'
  },
  LEDRIUM_1: {
    slug: 'LEDRIUM_1',
    flag: 'cl',
    titleIcons: [cameraIcon],
    name: 'PROVIDENCIA (Ledrium)',
    youtubeVideoId: 'ERHmlO0orUk'
  },
  OSORNO: {
    slug: 'OSORNO',
    flag: 'cl',
    titleIcons: [cameraIcon],
    name: 'OSORNO PLAZA ARMAS',
    youtubeChannelId: 'UCD7sqegDNyZxmdnCj6xqH6g'
  },
  VALPARAISO: {
    slug: 'VALPARAISO',
    name: 'VALPARAISO',
    flag: 'cl',
    titleIcons: [cameraIcon],
    youtubeChannelId: 'UCqSSE82uHv1rkR3Tj9lTx1w'
  },
  OSORNO_2: {
    slug: 'OSORNO_2',
    name: 'Camara Osorno 2',
    m3u8Url: 'http://216.155.78.8:19026/hls/live.stream.m3u8'
  },
  // TODO: skylinewebcams
  // Camara_PuntaArenas: {
  //   slug: 'Camara_PuntaArenas',
  //   name: 'Camara PuntaArenas',
  //   m3u8Url:
  //     'https://hd-auth.skylinewebcams.com/live.m3u8?a=rr7gb7l899dq265js09vdcoc20'
  // },
  'glaseado-1': {
    slug: 'glaseado-1',
    name: '📷 glaseado.cl, Huayquique',
    iframeSrc:
      'https://g3.ipcamlive.com/player/player.php?alias=huayquique&autoplay=1',
    fuente: 'https://www.glaseado.cl/surf-cams/huayquique/',
    flag: 'cl'
  },
  'glaseado-2': {
    slug: 'glaseado-2',
    name: '📷 glaseado.cl, Las Urracas',
    iframeSrc:
      'https://g3.ipcamlive.com/player/player.php?alias=lasurracas&autoplay=1',
    fuente: 'https://www.glaseado.cl/surf-cams/las-urracas/',
    flag: 'cl'
  },
  'glaseado-3': {
    slug: 'glaseado-3',
    name: '📷 glaseado.cl, La Punta',
    iframeSrc:
      'https://g3.ipcamlive.com/player/player.php?alias=lapunta&autoplay=1',
    fuente: 'https://www.glaseado.cl/surf-cams/la-punta/',
    flag: 'cl'
  },
  PARQUEMET_CUMBRE: {
    slug: 'PARQUEMET_CUMBRE',
    name: 'PARQUEMET CUMBRE',
    flag: 'cl',
    titleIcons: [cameraIcon],
    iframeSrc:
      'https://g1.ipcamlive.com/player/player.php?alias=5a7084c9e0136&autoplay=true'
  },
  PARQUEMET_TERRAZA: {
    slug: 'PARQUEMET_TERRAZA',
    flag: 'cl',
    titleIcons: [cameraIcon],
    name: 'PARQUEMET TERRAZA',
    iframeSrc:
      'https://g1.ipcamlive.com/player/player.php?alias=5a7085fe914c0&autoplay=true'
  },
  Times_Square_4_1560_BROADWAY: {
    slug: 'Times_Square_4_1560_BROADWAY',
    flag: 'us',
    titleIcons: [cameraIcon],
    youtubeVideoId: 'rZjblGbbCmE',
    name: 'TIMES SQUARE: 1540 BROADWAY'
  },
  // EEUU

  CAPITOLIO_EEUU_1: {
    slug: 'CAPITOLIO_EEUU_1',
    flag: 'us',
    titleIcons: [cameraIcon],
    name: 'CAPITOLIO EEUU',
    m3u8Url: 'https://capcam-f.akamaihd.net/i/capcam_1@76463/master.m3u8'
  },

  'times-square': {
    slug: 'times-square',
    name: '📷 Times Square Live 4K',
    youtubeChannelId: 'UC6qrG3W8SMK0jior2olka3g',
    flag: 'us'
  },
  'puente-brooklyn': {
    slug: 'puente-brooklyn',
    name: '📷 St. George Tower',
    youtubeVideoId: 'KGuCGd726RA',
    fuente: 'https://www.youtube.com/channel/UCp1ojgNJ8mNWdMDsdcMRA2Q',
    flag: 'us'
  },
  'bryant-park': {
    slug: 'bryant-park',
    name: '📷 Bryant Park NYC',
    youtubeChannelId: 'UC6AlfoRUeH4B1an_R5YSSTw',
    flag: 'us'
  },
  'george-washington-bridge': {
    slug: 'george-washington-bridge',
    name: '📷 Fort Lee Today On Demand',
    youtubeChannelId: 'UChQ5P-kHBZpH20EnXm9X0YQ',
    flag: 'us'
  },
  'washington-dc': {
    slug: 'washington-dc',
    name: '📷 Washington DC, US Capitol',
    youtubeVideoId: '_RAjp7A3VDw',
    fuente: 'https://www.youtube.com/channel/UCRj7u6fmW8RYQl98hcwbwng',
    flag: 'us'
  },
  'las-vegas': {
    slug: 'las-vegas',
    name: '📷 Las Vegas, Treasure Island',
    youtubeVideoId: 'CUyy8rBnuzY',
    fuente: 'https://www.youtube.com/channel/UCRj7u6fmW8RYQl98hcwbwng',
    flag: 'us'
  },
  'san-diego': {
    slug: 'san-diego',
    name: '📷 San Diego, Down Town + Airport',
    youtubeVideoId: 'fcGDU86DuSo',
    fuente: 'https://www.youtube.com/channel/UCRj7u6fmW8RYQl98hcwbwng',
    flag: 'us'
  },

  NYC_Brooklyn_Bridge: {
    slug: 'NYC_Brooklyn_Bridge',
    flag: 'us',
    titleIcons: [cameraIcon],
    name: 'NYC BROOKLYN BRIDGE',
    youtubeVideoId: 'KGuCGd726RA'
  },
  Lower_Manhattan_New_York_Harbor: {
    slug: 'Lower_Manhattan_New_York_Harbor',
    flag: 'us',
    titleIcons: [cameraIcon],
    name: 'NYC LOWER MANHATTAN',
    youtubeVideoId: 'Vj0XKu6AoOw'
  },
  Times_Square_1: {
    slug: 'Times_Square_1',
    flag: 'us',
    titleIcons: [cameraIcon],
    youtubeVideoId: 'AdUw5RdyZxI',
    name: 'TIMES SQUARE'
  },
  Times_Square_2_DUFFY_SQUARE: {
    slug: 'Times_Square_2_DUFFY_SQUARE',
    flag: 'us',
    titleIcons: [cameraIcon],
    youtubeChannelId: 'mNawBricEYw',
    name: 'TIMES SQUARE: DUFFY SQUARE'
  },
  Times_Square_3_EXPRESS_VIEW: {
    slug: 'Times_Square_3_EXPRESS_VIEW',
    flag: 'us',
    titleIcons: [cameraIcon],
    youtubeChannelId: '6dtpPYTQaSQ',
    name: 'TIMES SQUARE: EXPRESS VIEW'
  },
  Casa_Blanca: {
    slug: 'Casa_Blanca',
    youtubeChannelId: 'GGsBUm8uar0',
    flag: 'us',
    titleIcons: [cameraIcon],
    name: 'CASA BLANCA'
  },
  WHITE_HOUSE_1: {
    slug: 'WHITE_HOUSE_1',
    flag: 'us',
    titleIcons: [cameraIcon],
    name: 'WHITE HOUSE',
    youtubeVideoId: 'T5zRi2J0uYg'
  },
  Times_Square_2: {
    slug: 'Times_Square_2',
    flag: 'us',
    titleIcons: [cameraIcon],
    name: 'TIMES SQUARE: EXPRESS VIEW',
    youtubeVideoId: 'OBmXqlPxtAQ'
  },
  Times_Square_3: {
    slug: 'Times_Square_3',
    flag: 'us',
    titleIcons: [cameraIcon],
    name: 'TIMES SQUARE: 1560 BROADWAY',
    youtubeVideoId: '4qyZLflp-sI'
  },
  LasVegas_1: {
    slug: 'LasVegas_1',
    flag: 'us',
    titleIcons: [cameraIcon],
    name: 'LAS VEGAS',
    youtubeChannelId: 'oy3tQ5Hacm8'
  },
  VolcanLaPalma: {
    slug: 'VolcanLaPalma',
    flag: 'es',
    titleIcons: [cameraIcon],
    name: 'VOLCAN LA PALMA',
    m3u8Url: 'https://rtvc-oca1.flumotion.com/playlist.m3u8'
  },
  // Argentina
  Four_Seasons_Hotel_Buenos_Aires: {
    slug: 'Four_Seasons_Hotel_Buenos_Aires',
    flag: 'ar',
    titleIcons: [cameraIcon],
    name: 'FOUR SEASONS HOTEL BS.As',
    youtubeChannelId: 'if91GyWP3zQ'
  },
  Ushuaia: {
    slug: 'Ushuaia',
    flag: 'ar',
    titleIcons: [cameraIcon],
    name: 'USHUAIA',
    youtubeChannelId: 'UC6NTD1HmdaZMbe9K5qADOvw'
  },

  obelisco: {
    slug: 'obelisco',
    name: '📷 FourSeasons BuenosAires',
    youtubeChannelId: 'UCCkRwmztPEvut3gpsgmCmzw',
    flag: 'ar'
  },
  'puente-gral-belgrano': {
    slug: 'puente-gral-belgrano',
    name: '📷 SISE Argentina',
    youtubeChannelId: 'UC2RkL2eATR1V6H8g4eNfA5Q',
    flag: 'ar'
  },
  // Peru
  'av-angamos': {
    slug: 'av-angamos',
    name: '📷 Av Angamos',
    youtubeChannelId: 'jQcotlKaPYY',
    fuente: 'https://www.youtube.com/channel/UCP9nvEUj8EN-wuOQajPQbAw',
    flag: 'pe'
  },
  'av-la-marina': {
    slug: 'av-la-marina',
    name: '📷 Av La Marina',
    youtubeChannelId: 'Arq2BUHYz9Y',
    fuente: 'https://www.youtube.com/channel/UCP9nvEUj8EN-wuOQajPQbAw',
    flag: 'pe'
  },

  // Francia
  'eiffel-tower': {
    slug: 'eiffel-tower',
    name: '📷 Paris, Eiffel Tower',
    youtubeVideoId: 'iZipA1LL_sU',
    fuente: 'https://www.youtube.com/channel/UCRj7u6fmW8RYQl98hcwbwng',
    flag: 'fr'
  },
  // Japon
  RailCam: {
    slug: 'RailCam',
    name: '📷 Aoba traffics',
    youtubeChannelId: 'UCynDLZ-YJnrMLSQvwYi-bUA',
    flag: 'jp'
  },
  'hawaii-livecam': {
    slug: 'hawaii-livecam',
    name: '📷 Aqualink Hawaii',
    youtubeChannelId: 'UCTLF36lXVM7uiR-VolWHv0Q',
    flag: 'jp'
  },
  'daily-seoul': {
    slug: 'daily-seoul',
    name: '📷 Daily Seoul Live Camera - Hangang',
    youtubeChannelId: 'UCQKQTgZJo3PlxA-9V1Z51XA',
    flag: 'kr'
  },
  // aleatorio
  'camaras-aleatorias': {
    slug: 'camaras-aleatorias',
    name: '📷 Boston and Maine Live',
    youtubeVideoId: '0jwaMlVL9ZA',
    fuente: 'https://www.youtube.com/channel/UC8gbWbcNNyb5-NIXvFklkOA'
  },
  namibiacam: {
    slug: 'namibiacam',
    name: '📷 NamibiaCam',
    youtubeChannelId: 'UC9X6gGKDv2yhMoofoeS7-Gg'
  }
};
