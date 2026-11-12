import { ZAPPING_REWIND_LIMIT_S, zappingRewindUrl } from '@/lib/zapping';
import { useTeleContext } from '../../../../context/TeleContext';
import { useZappingToken } from '../../../../hooks/useZappingConfig';
import { Barras } from './Barras';
import VideoPlayer from './VideoJS';

type Props = {
  channelId: string;
  /** The channel's name, for the clips cut from it. */
  name?: string;
  /** Whether Zapping keeps the channel's past, beyond the live window. */
  rewindable?: boolean;
  muted?: boolean;
  paused?: boolean;
  /** Filling the screen, where the keys rewind it (see the Monitor). */
  fullscreen?: boolean;
};

export function ZappingSource({
  channelId,
  name,
  rewindable = false,
  muted = true,
  paused = false,
  fullscreen = false
}: Props) {
  const [zappingToken] = useZappingToken();
  // A rewindable channel plays its live playlist like the rest, and reaches
  // the last hour back once it is rewound past it (see `VideoJS`). With the
  // picker open beside the picture the arrows are its, to walk the list with.
  const { isEditing } = useTeleContext();

  const href = `${channelId}?token=${zappingToken}`;
  if (!zappingToken) return <Barras />;

  return (
    <VideoPlayer
      src={href}
      title={name}
      muted={muted}
      paused={paused}
      seekKeys={fullscreen && !isEditing}
      rewind={
        rewindable
          ? {
              src: startTime => zappingRewindUrl(href, startTime),
              limitS: ZAPPING_REWIND_LIMIT_S
            }
          : undefined
      }
    />
  );
}
