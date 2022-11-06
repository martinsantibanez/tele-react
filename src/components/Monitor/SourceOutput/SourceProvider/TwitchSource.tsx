import React from 'react';
import { TwitchPlayer } from 'react-twitch-embed';

type Props = {
  channel: string;
  muted?: boolean;
};
export function TwitchSource({ channel, muted = true }: Props) {
  return (
    <TwitchPlayer
      channel={channel}
      id={channel}
      muted={muted}
      className="w-100 h-100"
    />
  );
}
