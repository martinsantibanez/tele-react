import { SourcesMap } from ".";
import { BsClockFill } from "react-icons/bs";

export const relojesSources: SourcesMap = {
  RELOJ_CHILE: {
    slug: "RELOJ_CHILE",
    name: "RELOJ CHILE",
    titleIcons: [<BsClockFill key="clock" />],
    iframeSrc:
      "https://reloj-alarma.es/embed/hora/Santiago_CL/CHILE+CONTINENTAL/#theme=1&color=4&ampm=0&showdate=0",
  },
};
