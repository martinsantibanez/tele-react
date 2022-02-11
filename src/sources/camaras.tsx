import { BsCamera, BsCameraFill } from "react-icons/bs";
import { SourcesMap } from ".";

const cameraIcon = <BsCameraFill key="camara" />;
export const camarasSources: SourcesMap = {
  PLAZAITALIA_CIMA: {
    slug: "PLAZAITALIA_CIMA",
    flag: "cl",
    titleIcons: [cameraIcon],
    listTitle: "PLAZA ITALIA (Galeria Cima)",
    youtubeChannelId: "UC4GOcOKkEefz5NamN4WyMFg",
    name: "PLAZA DIGNIDAD",
  },
  LEDRIUM_1: {
    slug: "LEDRIUM_1",
    flag: "cl",
    titleIcons: [cameraIcon],
    listTitle: "PROVIDENCIA (Ledrium)",
    youtubeVideoId: "mGxX5PfREPA",
  },
  OSORNO: {
    slug: "OSORNO",
    flag: "cl",
    titleIcons: [cameraIcon],
    listTitle: "OSORNO PLAZA ARMAS",
    name: "OSORNO PLAZA ARMAS",
    youtubeChannelId: "UCD7sqegDNyZxmdnCj6xqH6g",
  },
  VALPARAISO: {
    slug: "VALPARAISO",
    name: "VALPARAISO",
    flag: "cl",
    titleIcons: [cameraIcon],
    listTitle: "VALPARAISO",
    youtubeChannelId: "UCqSSE82uHv1rkR3Tj9lTx1w",
  },
  "glaseado-1": {
    slug: "glaseado-1",
    listTitle: "📷 glaseado.cl, Huayquique",
    iframeSrc:
      "https://g3.ipcamlive.com/player/player.php?alias=huayquique&autoplay=1",
    fuente: "https://www.glaseado.cl/surf-cams/huayquique/",
    flag: "cl",
  },
  "glaseado-2": {
    slug: "glaseado-2",
    listTitle: "📷 glaseado.cl, Las Urracas",
    iframeSrc:
      "https://g3.ipcamlive.com/player/player.php?alias=lasurracas&autoplay=1",
    fuente: "https://www.glaseado.cl/surf-cams/las-urracas/",
    flag: "cl",
  },
  "glaseado-3": {
    slug: "glaseado-3",
    listTitle: "📷 glaseado.cl, La Punta",
    iframeSrc:
      "https://g3.ipcamlive.com/player/player.php?alias=lapunta&autoplay=1",
    fuente: "https://www.glaseado.cl/surf-cams/la-punta/",
    flag: "cl",
  },

  PARQUEMET_CUMBRE: {
    slug: "PARQUEMET_CUMBRE",
    name: "PARQUEMET CUMBRE",
    flag: "cl",
    titleIcons: [cameraIcon],
    listTitle: "PARQUEMET CUMBRE",
    iframeSrc:
      "https://g1.ipcamlive.com/player/player.php?alias=5a7084c9e0136&autoplay=true",
  },
  PARQUEMET_TERRAZA: {
    slug: "PARQUEMET_TERRAZA",
    flag: "cl",
    titleIcons: [cameraIcon],
    listTitle: "PARQUEMET TERRAZA",
    iframeSrc:
      "https://g1.ipcamlive.com/player/player.php?alias=5a7085fe914c0&autoplay=true",
  },
  Times_Square_4_1560_BROADWAY: {
    slug: "Times_Square_4_1560_BROADWAY",
    flag: "us",
    titleIcons: [cameraIcon],
    listTitle: "TIMES SQUARE 4",
    youtubeVideoId: "rZjblGbbCmE",
    name: "TIMES SQUARE: 1540 BROADWAY",
  },
  // EEUU

  CAPITOLIO_EEUU_1: {
    slug: "CAPITOLIO_EEUU_1",
    flag: "us",
    titleIcons: [cameraIcon],
    listTitle: "CAPITOLIO EEUU",
    name: "CAPITOLIO EEUU",
    m3u8Url: "https://capcam-f.akamaihd.net/i/capcam_1@76463/master.m3u8",
  },

  "times-square": {
    slug: "times-square",
    listTitle: "📷 Times Square Live 4K",
    youtubeChannelId: "UC6qrG3W8SMK0jior2olka3g",
    flag: "us",
  },
  "puente-brooklyn": {
    slug: "puente-brooklyn",
    listTitle: "📷 St. George Tower",
    youtubeVideoId: "KGuCGd726RA",
    fuente: "https://www.youtube.com/channel/UCp1ojgNJ8mNWdMDsdcMRA2Q",
    flag: "us",
  },
  "bryant-park": {
    slug: "bryant-park",
    listTitle: "📷 Bryant Park NYC",
    youtubeChannelId: "UC6AlfoRUeH4B1an_R5YSSTw",
    flag: "us",
  },
  "george-washington-bridge": {
    slug: "george-washington-bridge",
    listTitle: "📷 Fort Lee Today On Demand",
    youtubeChannelId: "UChQ5P-kHBZpH20EnXm9X0YQ",
    flag: "us",
  },
  "washington-dc": {
    slug: "washington-dc",
    listTitle: "📷 Washington DC, US Capitol",
    youtubeVideoId: "_RAjp7A3VDw",
    fuente: "https://www.youtube.com/channel/UCRj7u6fmW8RYQl98hcwbwng",
    flag: "us",
  },
  "las-vegas": {
    slug: "las-vegas",
    listTitle: "📷 Las Vegas, Treasure Island",
    youtubeVideoId: "CUyy8rBnuzY",
    fuente: "https://www.youtube.com/channel/UCRj7u6fmW8RYQl98hcwbwng",
    flag: "us",
  },
  "san-diego": {
    slug: "san-diego",
    listTitle: "📷 San Diego, Down Town + Airport",
    youtubeVideoId: "fcGDU86DuSo",
    fuente: "https://www.youtube.com/channel/UCRj7u6fmW8RYQl98hcwbwng",
    flag: "us",
  },

  NYC_Brooklyn_Bridge: {
    slug: "NYC_Brooklyn_Bridge",
    flag: "us",
    titleIcons: [cameraIcon],
    listTitle: "NYC BROOKLYN BRIDGE",
    youtubeVideoId: "KGuCGd726RA",
    name: "NYC BROOKLYN BRIDGE",
  },
  Lower_Manhattan_New_York_Harbor: {
    slug: "Lower_Manhattan_New_York_Harbor",
    flag: "us",
    titleIcons: [cameraIcon],
    listTitle: "NYC LOWER MANHATTAN",
    youtubeVideoId: "Vj0XKu6AoOw",
    name: "NYC LOWER MANHATTAN & NEW YORK HARBOR",
  },
  Times_Square_1: {
    slug: "Times_Square_1",
    flag: "us",
    titleIcons: [cameraIcon],
    listTitle: "TIMES SQUARE 1",
    youtubeVideoId: "AdUw5RdyZxI",
    name: "TIMES SQUARE",
  },
  Times_Square_2_DUFFY_SQUARE: {
    slug: "Times_Square_2_DUFFY_SQUARE",
    flag: "us",
    titleIcons: [cameraIcon],
    listTitle: "TIMES SQUARE 2",
    youtubeChannelId: "mNawBricEYw",
    name: "TIMES SQUARE: DUFFY SQUARE",
  },
  Times_Square_3_EXPRESS_VIEW: {
    slug: "Times_Square_3_EXPRESS_VIEW",
    flag: "us",
    titleIcons: [cameraIcon],
    listTitle: "TIMES SQUARE 3",
    youtubeChannelId: "6dtpPYTQaSQ",
    name: "TIMES SQUARE: EXPRESS VIEW",
  },
  Casa_Blanca: {
    slug: "Casa_Blanca",
    youtubeChannelId: "GGsBUm8uar0",
    flag: "us",
    titleIcons: [cameraIcon],
    listTitle: "CASA BLANCA",
    name: "CASA BLANCA",
  },
  WHITE_HOUSE_1: {
    slug: "WHITE_HOUSE_1",
    flag: "us",
    titleIcons: [cameraIcon],
    listTitle: "WHITE HOUSE",
    youtubeVideoId: "T5zRi2J0uYg",
  },
  Times_Square_2: {
    slug: "Times_Square_2",
    flag: "us",
    titleIcons: [cameraIcon],
    listTitle: "TIMES SQUARE: EXPRESS VIEW",
    youtubeVideoId: "OBmXqlPxtAQ",
  },
  Times_Square_3: {
    slug: "Times_Square_3",
    flag: "us",
    titleIcons: [cameraIcon],
    listTitle: "TIMES SQUARE: 1560 BROADWAY",
    youtubeVideoId: "4qyZLflp-sI",
  },
  LasVegas_1: {
    slug: "LasVegas_1",
    flag: "us",
    titleIcons: [cameraIcon],
    listTitle: "LAS VEGAS",
    youtubeChannelId: "oy3tQ5Hacm8",
  },
  VolcanLaPalma: {
    slug: "VolcanLaPalma",
    flag: "es",
    titleIcons: [cameraIcon],
    listTitle: "VOLCAN LA PALMA",
    m3u8Url: "https://rtvc-oca1.flumotion.com/playlist.m3u8",
    name: "VOLCAN LA PALMAㅤ",
  },
  // Argentina
  Four_Seasons_Hotel_Buenos_Aires: {
    slug: "Four_Seasons_Hotel_Buenos_Aires",
    flag: "ar",
    titleIcons: [cameraIcon],
    listTitle: "FOUR SEASONS HOTEL BS.As",
    youtubeChannelId: "if91GyWP3zQ",
  },
  Ushuaia: {
    slug: "Ushuaia",
    flag: "ar",
    titleIcons: [cameraIcon],
    listTitle: "USHUAIA",
    youtubeChannelId: "UC6NTD1HmdaZMbe9K5qADOvw",
  },

  obelisco: {
    slug: "obelisco",
    listTitle: "📷 FourSeasons BuenosAires",
    youtubeChannelId: "UCCkRwmztPEvut3gpsgmCmzw",
    flag: "ar",
  },
  "puente-gral-belgrano": {
    slug: "puente-gral-belgrano",
    listTitle: "📷 SISE Argentina",
    youtubeChannelId: "UC2RkL2eATR1V6H8g4eNfA5Q",
    flag: "ar",
  },
  // Peru
  "av-angamos": {
    slug: "av-angamos",
    listTitle: "📷 Av Angamos",
    youtubeChannelId: "jQcotlKaPYY",
    fuente: "https://www.youtube.com/channel/UCP9nvEUj8EN-wuOQajPQbAw",
    flag: "pe",
  },
  "av-la-marina": {
    slug: "av-la-marina",
    listTitle: "📷 Av La Marina",
    youtubeChannelId: "Arq2BUHYz9Y",
    fuente: "https://www.youtube.com/channel/UCP9nvEUj8EN-wuOQajPQbAw",
    flag: "pe",
  },

  // Francia
  "eiffel-tower": {
    slug: "eiffel-tower",
    listTitle: "📷 Paris, Eiffel Tower",
    youtubeVideoId: "iZipA1LL_sU",
    fuente: "https://www.youtube.com/channel/UCRj7u6fmW8RYQl98hcwbwng",
    flag: "fr",
  },
  // Japon
  RailCam: {
    slug: "RailCam",
    listTitle: "📷 Aoba traffics",
    youtubeChannelId: "UCynDLZ-YJnrMLSQvwYi-bUA",
    flag: 'jp'
  },
  "hawaii-livecam": {
    slug: "hawaii-livecam",
    listTitle: "📷 Aqualink Hawaii",
    youtubeChannelId: "UCTLF36lXVM7uiR-VolWHv0Q",
    flag: 'jp'
  },
  "daily-seoul": {
    slug: "daily-seoul",
    listTitle: "📷 Daily Seoul Live Camera - Hangang",
    youtubeChannelId: "UCQKQTgZJo3PlxA-9V1Z51XA",
    flag: 'kr'
  },
  // aleatorio
  "camaras-aleatorias": {
    slug: "camaras-aleatorias",
    listTitle: "📷 Boston and Maine Live",
    youtubeVideoId: "0jwaMlVL9ZA",
    fuente: "https://www.youtube.com/channel/UC8gbWbcNNyb5-NIXvFklkOA",
  },
  namibiacam: {
    slug: "namibiacam",
    listTitle: "📷 NamibiaCam",
    youtubeChannelId: "UC9X6gGKDv2yhMoofoeS7-Gg",
  },
};
