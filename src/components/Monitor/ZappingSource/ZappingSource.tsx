import React, { useEffect, useRef } from 'react';

type Props = {
  channelId: number;
};
export function ZappingSource({ channelId }: Props) {
  const src = 'https://app.zappingtv.com/player/';
  const ref = useRef<HTMLIFrameElement>(null);
  useEffect(() => {
    if (ref?.current?.contentWindow) {
      const contentWindow: any = ref.current?.contentWindow;
      console.log('contentWindow', contentWindow);
      if (contentWindow?.playCanal) contentWindow?.playCanal(channelId);
    }
  }, [channelId]);
  return (
    <div className="w-100 h-100">
      <div className="embed-responsive embed-responsive-16by9">
        <iframe
          ref={ref}
          src={src}
          className="embed-responsive-item embed-responsive-16by9"
          frameBorder="0"
        />
        {/* {name && (
          <div className="CAJATituloDePantallaPequeña2">
            <div className="TextoTitulosMonitor1">{name}</div>
          </div>
        )} */}
      </div>
    </div>
  );
}
