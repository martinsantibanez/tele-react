export const launchFullScreen = () => {
  const element: any = document.documentElement;
  if (element.requestFullScreen) {
    element.requestFullScreen();
  } else if (element.mozRequestFullScreen) {
    element.mozRequestFullScreen();
  } else if (element.webkitRequestFullScreen) {
    element.webkitRequestFullScreen();
  }

  if (element.requestFullScreen) {
    element.requestFullScreen();
  }
};

export const cancelFullScreen = () => {
  if ((document as any).cancelFullScreen) {
    (document as any).cancelFullScreen();
  } else if ((document as any).mozCancelFullScreen) {
    (document as any).mozCancelFullScreen();
  } else if ((document as any).webkitCancelFullScreen) {
    (document as any).webkitCancelFullScreen();
  }
};
