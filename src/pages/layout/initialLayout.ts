import { v4 as uuidv4 } from "uuid";
import { camarasSources } from "../../sources/camaras";
import { tvNacionalSources } from "../../sources/tvNacional";
import { Layout } from "./types";

export const initialLayout: Layout = {
  rows: [
    {
      cols: [
        {
          size: 8,
          node: {
            source: tvNacionalSources["24HTVN"],
            uuid: uuidv4(),
          },
        },
        {
          size: 4,
          rows: [
            {
              cols: [
                {
                  node: {
                    uuid: uuidv4(),
                    source: tvNacionalSources.CHV_WEB_IFRAME,
                  },
                },
              ],
            },
            {
              cols: [
                {
                  node: {
                    uuid: uuidv4(),
                    source: tvNacionalSources.MEGA,
                  },
                },
              ],
            },
          ],
        },
      ],
    },
    {
      cols: [
        {
          size: 4,
          node: { uuid: uuidv4(), source: tvNacionalSources.T13_ENVIVO },
        },
        {
          size: 4,
          node: { uuid: uuidv4(), source: camarasSources.PLAZAITALIA_CIMA },
        },
        {
          size: 4,
          node: { uuid: uuidv4(), source: camarasSources.LEDRIUM_1 },
        },
      ],
    },
  ],
};
