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

export const testLayout: LayoutType = {
  rows: [
    {
      cols: [
        { size: 3 },
        { size: 9, node: { idx: 0 } }
      ]
    },
    {
      cols: [
        {
          size: 3,
          node: { idx: 1 }
        },
      ]
    }
  ]
};
