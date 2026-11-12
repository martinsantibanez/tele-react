'use client';
import { useSyncExternalStore } from 'react';

const subscribe = (onChange: () => void) => {
  const timer = setInterval(onChange, 1000);
  return () => clearInterval(timer);
};

/** Hour and date as one string, so it only changes when the minute does. */
const readClock = () => {
  const now = new Date();
  const time = now.toLocaleTimeString('es-CL', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
  const date = now.toLocaleDateString('es-CL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });
  // The weekday comes lowercase; only its first letter is raised.
  return `${time}|${date.charAt(0).toUpperCase()}${date.slice(1)}`;
};

/**
 * The time, for a cell of the wall with no tile in it. Sized to the cell, so
 * it reads the same in a small grid and a big one. Empty on the server, whose
 * time need not match the browser's.
 */
export function WallClock() {
  const clock = useSyncExternalStore(subscribe, readClock, () => '');
  const [time, date] = clock.split('|');
  return (
    <div
      className="flex h-full w-full flex-col items-center justify-center bg-neutral-950 text-white"
      style={{ containerType: 'size' }}
    >
      {!!clock && (
        <>
          <span
            className="leading-none font-semibold tabular-nums"
            style={{ fontSize: '34cqh' }}
          >
            {time}
          </span>
          <span
            className="mt-[4cqh] text-white/60"
            style={{ fontSize: '10cqh' }}
          >
            {date}
          </span>
        </>
      )}
    </div>
  );
}
