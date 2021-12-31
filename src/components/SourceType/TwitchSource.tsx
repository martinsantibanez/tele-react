import React from "react";
const { TwitchEmbed } = require("react-twitch-embed");

type Props = {
  channel: string;
};
export function TwitchSource({ channel }: Props) {
  return (
    <TwitchEmbed
      channel={channel}
      id={channel}
      theme="dark"
      withChat={false}
      muted
      onVideoPause={() => console.log(":(")}
      className="w-100 h-100"
    />
  );
}
