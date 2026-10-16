import { useZappingToken } from '../../../../hooks/useZappingConfig';
import { Barras } from './Barras';
import VideoPlayer from './VideoJS';

type Props = {
  channelId: string;
  muted?: boolean;
  paused?: boolean;
};

export function ZappingSource({
  channelId,
  muted = true,
  paused = false
}: Props) {
  const [zappingToken] = useZappingToken();

  const href = `${channelId}?token=${zappingToken}`;
  if (!zappingToken) return <Barras />;

  return <VideoPlayer src={href} muted={muted} paused={paused} />;
}
