import { useZappingConfig } from '../../../../hooks/useZappingConfig';
import VideoPlayer from './VideoJS';

type Props = {
  channelId: string;
  muted?: boolean;
};

export function ZappingSource({ channelId, muted = true }: Props) {
  const { zappingConfig } = useZappingConfig();

  const href = `${channelId}?token=${zappingConfig?.token}`;

  return <VideoPlayer src={href} muted={muted} />;
}
