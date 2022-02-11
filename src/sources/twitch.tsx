import { BsTwitch } from "react-icons/bs";
import { SourcesMap } from ".";
import { TwitchSource } from "../components/SourceType/TwitchSource";

const twitchChannels = ["ibai", "derechofacil", "copano", "seba_parrab"];
export const twitchSources = twitchChannels.reduce(
  (obj: SourcesMap, channel) => {
    const slug = `${channel}_twitch`;
    obj[slug] = {
      slug,
      twitchAccount: channel,
      titleIcons: [
        <BsTwitch key="twitch" />
      ],
      name: `${channel} - Twitch`,
      component: <TwitchSource channel={channel} />,
      titleHtml: `ﾠ${channel}`,
    };
    return obj;
  },
  {}
);
