import { LayoutType } from './types';

export const initialLayout: LayoutType = {
  rows: [
    {
      cols: [
        {
          size: 8,
          node: {
            idx: 0
          }
        },
        {
          size: 4,
          rows: [
            {
              cols: [
                {
                  node: {
                    idx: 1
                  }
                }
              ]
            },
            {
              cols: [
                {
                  node: {
                    idx: 2
                  }
                }
              ]
            }
          ]
        }
      ]
    },
    {
      cols: [
        {
          size: 4,
          node: { idx: 3 }
        },
        {
          size: 4,
          node: { idx: 4 }
        },
        {
          size: 4,
          node: { idx: 5 }
        }
      ]
    }
  ]
};

export const twoBigLayout: LayoutType = {
  rows: [
    {
      cols: [
        { size: 6, node: { idx: 0 } },
        { size: 6, node: { idx: 1 } }
      ]
    },
    {
      cols: [
        {
          size: 4,
          node: { idx: 2 }
        },
        {
          size: 4,
          node: { idx: 3 }
        },
        {
          size: 4,
          node: { idx: 4 }
        }
      ]
    }
  ]
};
