// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import axios from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';

type Data = {};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method === 'GET') {
    const queryChunk = req.query.chunk;
    const chunk =
      typeof queryChunk === 'string' ? queryChunk : queryChunk?.join('/');
    // try {
    console.log({ chunk });
    const { data, headers } = await axios.get(
      `https://live-ak2.vimeocdn.com/${chunk}`
    );
    console.log({ data });
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

    // const chunks = /(https:\/\/live-ak2.vimeocdn.com\/(.*))/.exec(data);
    // if (!chunks?.length) return;
    // for (const chunk of chunks) {
    //   console.log(chunk);
    // }
    // console.log(chunks);
    //   const resp = data.replace(re, `${baseUrl}/$1`);
    //   // console.log(resp);
    if (typeof headers['Content-Type'] === 'string')
      res.setHeader('Content-Type', headers['Content-Type']);
    res.status(200).send(data);
    // } catch (err) {
    //   console.error(err);
    //   res.status(500).end();
    // }
  }
  res.status(404).end();
}
