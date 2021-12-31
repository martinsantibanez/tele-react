import { SourcesMap } from ".";
import { TwitchSource } from "../components/SourceType/TwitchSource";

const twitchIframe = (channel: string) =>
  `<div class="embed-responsive embed-responsive-16by9"> <iframe class="embed-responsive-item" src="https://player.twitch.tv/?channel=${channel}&parent=tele.martinsantibanez.com" frameborder="0"></iframe><div class="CAJATituloDePantallaPequeña2"><div class="TextoTitulosMonitor1">ㅤ${channel} ㅤ</div></div></div>`;

export const twitchSources: SourcesMap = {
  COPANO_Twitch: {
    slug: "COPANO_Twitch",
    titleHtml:
      '<img style="height: 20px; width:auto;" src="imagenes/Icono_Twitch_Video_1.svg"></img>ﾠCOPANO',
    codeHtml: twitchIframe("copano"),
  },
  SebaParraTwitch: {
    slug: "SebaParraTwitch",
    component: <TwitchSource channel="seba_parrab" />,
    titleHtml:
      '<img style="height: 20px; width:auto;" src="imagenes/Icono_Twitch_Video_1.svg"></img>ﾠSeba Parra',
  },
};
