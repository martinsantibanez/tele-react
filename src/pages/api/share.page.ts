import { kv } from '@vercel/kv';
import type { NextApiRequest, NextApiResponse } from 'next';
import { v4 as uuid } from 'uuid';
import { ScreenType } from '../monitor/types';

type Data = {
  uuid: string;
};

export const savedLayout = new Map<string, ScreenType>();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method === 'POST') {
    try {
      const payload = req.body;
      const newUuid = uuid();
      console.log({ payload, newUuid });
      await kv.set(newUuid, JSON.stringify(payload), { ex: 60 * 60 * 24 });
      console.log(`Saved to Redis with key=${newUuid}`);

      res.status(200).json({ uuid: newUuid });
    } catch (err) {
      console.error(err);
      res.status(500).end();
    }
  }
  res.status(404).end();
}
