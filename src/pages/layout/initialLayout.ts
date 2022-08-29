import { v4 as uuidv4 } from "uuid";
import { LayoutType } from "./types";

export const initialLayout: LayoutType = {
  rows: [
    {
      cols: [
        {
          size: 8,
          node: {
            sourceSlug: "24HTVN",
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
                    sourceSlug: "CHV_WEB_IFRAME",
                  },
                },
              ],
            },
            {
              cols: [
                {
                  node: {
                    uuid: uuidv4(),
                    sourceSlug: "MEGA",
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
          node: { uuid: uuidv4(), sourceSlug: "T13_ENVIVO" },
        },
        {
          size: 4,
          node: { uuid: uuidv4(), sourceSlug: "PLAZAITALIA_CIMA" },
        },
        {
          size: 4,
          node: { uuid: uuidv4(), sourceSlug: "LEDRIUM_1" },
        },
      ],
    },
  ],
};
