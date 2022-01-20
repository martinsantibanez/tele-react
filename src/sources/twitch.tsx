import { SourcesMap } from ".";
import { TwitchSource } from "../components/SourceType/TwitchSource";

const twitchChannels = ["ibai", "derechofacil", "copano", "seba_parrab"];
export const twitchSources = twitchChannels.reduce(
  (obj: SourcesMap, channel) => {
    const slug = `${channel}_twitch`;
    obj[slug] = {
      slug,
      twitchAccount: channel,
      name: `${channel} - Twitch`,
      component: <TwitchSource channel={channel} />,
      titleHtml: `<img style="height: 20px; width:auto;" src="imagenes/Icono_Twitch_Video_1.svg"></img>ﾠ${channel}`,
    };
    return obj;
  },
  {}
);
