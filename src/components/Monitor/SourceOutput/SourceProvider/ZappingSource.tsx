import { useZappingConfig } from '../../../../hooks/useZappingConfig';
import VideoPlayer from './VideoJS';

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
