// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import axios from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';

type Data = {};

const getM3u8Link = async () => {
  const { data } = await axios.get(
    'https://lovesomecommunity.com/deportivo.php?player=desktop&live=tntchile',
    {
      headers: {
        Referer: 'https://tucanaldeportivo.com/',
        'Referrer-Policy': 'strict-origin-when-cross-origin'
      }
    }
  );
  const dataArray = /\["h","t","t","p","s"(.*)\]/gm.exec(data);
  if (dataArray) {
    const a = eval(dataArray[0]);
    return a.join('').replace('////', '//');
  }
};

const re = /(^.*\.(ts)$)/gm;
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method === 'GET') {
    try {
      const m3u8 = await getM3u8Link();
      const splitUrl = m3u8.split('/hls');
      const baseUrl = splitUrl[0] + '/hls';
      const fileParams = splitUrl[1];
      const { data, headers } = await axios.get<string>(
        `${baseUrl}/${fileParams}`,
        {
          headers: {
            Referer: 'https://lovesomecommunity.com/',
            'Referrer-Policy': 'strict-origin-when-cross-origin'
          }
        }
      );

      for (const [key, value] of Object.entries(headers)) {
        res.setHeader(key, value);
      }

      // console.log(re.exec(data));
      const resp = data.replace(re, `${baseUrl}/$1`);
      // console.log(resp);
      if (typeof headers['Content-Type'] === 'string')
        res.setHeader('Content-Type', headers['Content-Type']);
      res.status(200).send(resp);
    } catch (err) {
      console.error(err);
      res.status(500).end();
    }
  }
  res.status(404).end();
}
