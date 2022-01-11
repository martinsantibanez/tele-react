import { SourcesMap } from ".";

export const datosSources: SourcesMap = {
  EARLY_EST_DETEC: {
    slug: "EARLY_EST_DETEC",
    titleHtml:
      '<img style="height: 20px; width:auto:" src="imagenes/Logo_ALOMAX.svg"></img>ﾠDETECTOR SISMOS',
    codeHtml:
      'MonitorEARLY-EST_DETECTOR.html" frameborder="0" scrolling="no"></iframe></div>',
    iframeSrc:
      "http://alomax.free.fr/projects/early-est/warning_image_only_alert.html",
  },
  EARLY_EST_SIS: {
    slug: "EARLY_EST_SIS",
    titleHtml:
      '<img style="height: 20px; width:auto:" src="imagenes/Logo_ALOMAX.svg"></img>ﾠULTIMOS SISMOS',
    iframeSrc: "http://alomax.free.fr/projects/early-est/hypolist.hgz",
  },
};
