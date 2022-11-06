import React from 'react';
import { TwitchPlayer } from 'react-twitch-embed';

type Props = {
  channel: string;
};
export function TwitchSource({ channel }: Props) {
  return (
    <TwitchPlayer
      channel={channel}
      id={channel}
      muted
      className="w-100 h-100"
    />
  );
}
