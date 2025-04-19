import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useZappingConfig } from '../../../../hooks/useZappingConfig';
import VideoPlayer from './VideoJS';

type SocketData = {
  href: string;
  id: number;
  image: string;
  name: string;
};

type Props = {
  channelId: string;
  muted?: boolean;
};

export function ZappingSource({ channelId, muted = true }: Props) {
  const { zappingConfig } = useZappingConfig();

  const href = `${channelId}?token=${zappingConfig?.token}`;

  if (!href || !zappingConfig?.token) return null;
  return <VideoPlayer src={href} muted={muted} />;
}
