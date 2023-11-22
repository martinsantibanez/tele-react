// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import axios from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';

type Data = {};

const movistar =
  'https://librefutboltv.com/json/80c06ea46c9a5f23192dd9d1c000f28d.json';
const getM3u8Link = async () => {
  const { data } = await axios.get(
    'https://librefutboltv.com/json/ccb7e786706e39bb3ec404bbe0c7b9ac.json'
  );
  const url = Buffer.from(data.url, 'base64').toString();
  return decodeURIComponent(url);
};

const re = /(^.*\.(ts)$)/gm;
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method === 'GET') {
    // try {
    const m3u8 = await getM3u8Link();
    console.log({ m3u8 });
    const { data, headers } = await axios.get<string>(m3u8);
    // console.log({ data });
    //   const splitUrl = m3u8.split('/hls');
    //   const baseUrl = splitUrl[0] + '/hls';
    //   const fileParams = splitUrl[1];
    //   const { data, headers } = await axios.get<string>(
    //     `${baseUrl}/${fileParams}`,
    //     {
    //       headers: {
    //         Referer: 'https://lovesomecommunity.com/',
    //         'Referrer-Policy': 'strict-origin-when-cross-origin'
    //       }
    //     }
    //   );

    // for (const [key, value] of Object.entries(headers)) {
    //   if (key.toLowerCase() !== 'content-length') res.setHeader(key, value);
    // }

    const response = data.replace(
      /(https:\/\/live-ak2.vimeocdn.com)/g,
      'http://localhost:3000/api/tyc'
    );
    // if (!chunks?.length) return;
    // for (const chunk of chunks) {
    //   console.log(chunk);
    // }
    // console.log(chunks);
    //   const resp = data.replace(re, `${baseUrl}/$1`);
    //   // console.log(resp);
    if (typeof headers['Content-Type'] === 'string')
      res.setHeader('Content-Type', headers['Content-Type']);
    res.status(200).send(response);
    // } catch (err) {
    //   console.error(err);
    //   res.status(500).end();
    // }
  }
  res.status(404).end();
}
