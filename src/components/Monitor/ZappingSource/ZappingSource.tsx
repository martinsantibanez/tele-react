import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useZappingConfig } from '../../../hooks/useZappingConfig';
import VideoPlayer from '../VideoJS';

type Props = {
  channelId: number;
};

type SocketData = {
  href: string;
  id: number;
  image: string;
  name: string;
};

export function ZappingSource({ channelId }: Props) {
  const [isConnected, setIsConnected] = useState(false);
  const { zappingConfig } = useZappingConfig();

  const [href, setHref] = useState<string>();

  useEffect(() => {
    if (!zappingConfig) return;
    const socket = io.connect(zappingConfig.endpoint, {
      query: { token: zappingConfig.token }
    });

    socket.on('disconnect', function () {
      setIsConnected(false);
    });

    socket.on('connect', function () {
      console.log('connected');
      setIsConnected(true);
      const t = { media: channelId };
      socket.emit('playCanal', t);
    });

    socket.on('data', function (data: SocketData) {
      console.log('got data', data);
      setHref(data.href);
    });
    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('data');
      socket.disconnect();
    };
  }, [channelId, zappingConfig]);

  if (!href || !isConnected) return null;
  return <VideoPlayer src={href} />;
}
