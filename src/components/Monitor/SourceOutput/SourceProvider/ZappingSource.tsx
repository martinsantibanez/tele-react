import { useZappingToken } from '../../../../hooks/useZappingConfig';
import { IframeOutput } from '../SourceOutput';
import { Barras } from './Barras';
import VideoPlayer from './VideoJS';

type Props = {
  channelId: string;
  muted?: boolean;
};

export function ZappingSource({ channelId, muted = true }: Props) {
  return <IframeOutput src='https://app.zapping.com/webplayer' name='Zapping' />
  // const [zappingToken] = useZappingToken();
  // console.log('zt', zappingToken)

  // const href = `${channelId}?token=${zappingToken}`;
  // if (!zappingToken) return <Barras />;

  // return <VideoPlayer src={href} muted={muted} />;
}
