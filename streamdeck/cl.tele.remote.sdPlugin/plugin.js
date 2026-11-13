'use strict';
/**
 * Stream Deck plugin for Tele, written against the plain Stream Deck plugin
 * protocol (no SDK) so that it runs the same under Elgato's software and under
 * OpenDeck on Linux.
 *
 * There is one action, and it is meant to fill the deck: every key asks the
 * plugin what it is, by where it sits. On a 5×3 deck:
 *
 *   ┌────┬────┬────┬────┬────┐
 *   │ T1      │ T2 │    │ ▦  │   T  the screen on air, its tiles laid out as on
 *   │         ├────┤    ├────┤      the monitor, on the smallest key grid they
 *   │         │ T3 │    │ 🔊 │      line up on (up to 4×3). Press = hear it;
 *   ├────┬────┼────┤    ├────┤      again = fullscreen on/off.
 *   │ T4 │ T5 │ T6 │    │ ←  │   ▦  the saved screens, as a folder over the
 *   └────┴────┴────┴────┴────┘      tiles. 🔊 mute. ←  left free, for a key of
 *                                   another plugin that leaves this page (in
 *                                   OpenDeck, Starter Pack's Switch Profile).
 *
 * The plugin sits between two things that cannot talk to each other directly:
 *
 * - the Stream Deck app, which starts this script and talks to it over a
 *   WebSocket it hosts itself (`-port`), and
 * - the Tele page in the browser, which cannot accept connections. So the
 *   plugin opens a tiny HTTP server on localhost: the page listens on
 *   `GET /events` (Server-Sent Events) for the commands, and `POST /state`s
 *   what it is showing, which the plugin draws on the keys.
 *
 * No dependencies: Node's own `http`, `fetch` and `WebSocket` (Node 22+, or
 * Node 20 with a flag — see below).
 */

const http = require('node:http');
const { spawn } = require('node:child_process');

// Node 20, which Elgato's software may run plugins on, only has a WebSocket
// client behind a flag: run this script again with it.
if (typeof WebSocket === 'undefined' && !process.env.TELE_DECK_REEXEC) {
  const child = spawn(
    process.execPath,
    ['--experimental-websocket', __filename, ...process.argv.slice(2)],
    { stdio: 'inherit', env: { ...process.env, TELE_DECK_REEXEC: '1' } }
  );
  child.on('exit', code => process.exit(code ?? 0));
  return;
}

/** Where the page finds the plugin. Keep in step with `useStreamDeck.ts`. */
const BRIDGE_PORT = Number(process.env.TELE_DECK_PORT) || 39741;

/**
 * The pages allowed to drive the deck: the deployed app, and any localhost
 * port for development. More can be added, comma separated, in
 * TELE_DECK_ORIGINS.
 */
const ALLOWED_ORIGINS = new Set([
  'https://ver-tele.vercel.app',
  ...(process.env.TELE_DECK_ORIGINS ?? '')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean)
]);
const isAllowedOrigin = origin =>
  ALLOWED_ORIGINS.has(origin) ||
  /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);

/** The size of a key image. */
const KEY = 144;
/** A deck whose size never came through: the MK.2 this was made on. */
const DEFAULT_SIZE = { columns: 5, rows: 3 };

const log = (...parts) => console.log('[tele]', ...parts);

/* ------------------------------------------------------------------------ */
/* Launch arguments                                                          */
/* ------------------------------------------------------------------------ */

/** `-port 1234 -pluginUUID … -registerEvent … -info {…}` */
const args = {};
for (let i = 2; i < process.argv.length - 1; i += 2)
  args[process.argv[i].replace(/^-+/, '')] = process.argv[i + 1];

/* ------------------------------------------------------------------------ */
/* State                                                                     */
/* ------------------------------------------------------------------------ */

/** Each deck's size, by device id. */
const devices = new Map();
try {
  for (const device of JSON.parse(args.info ?? '{}').devices ?? [])
    if (device?.id && device.size) devices.set(device.id, device.size);
} catch {
  // No usable info: every deck is taken to be the default size.
}

/** Every key showing the action, by context: `{ device, row, column }`. */
const keys = new Map();

/**
 * What the page last reported, or undefined while no page is connected:
 * `{ screens: [{ name }], activeScreen,
 *    tiles: [{ name, logo?, rect?: [x0, y0, x1, y1] }], selectedTile,
 *    fullscreen, muted, audioBlocked }`
 * Rects are fractions of the monitor.
 */
let app;

/** The decks with the saved screens folder open. */
const folderOpen = new Set();

/** Which page of saved screens each deck is showing, when they do not fit. */
const screenPage = new Map();

/** Open `/events` streams. */
const clients = new Set();

/** The last image sent to each key, so an unchanged one is not sent again. */
const lastImage = new Map();

/* ------------------------------------------------------------------------ */
/* Stream Deck side                                                          */
/* ------------------------------------------------------------------------ */

let host;

function sendToHost(message) {
  if (host?.readyState === WebSocket.OPEN) host.send(JSON.stringify(message));
}

function connectHost() {
  if (!args.port) {
    // Started by hand, to try the browser side alone.
    log('no -port given: running the browser bridge only');
    return;
  }
  host = new WebSocket(`ws://127.0.0.1:${args.port}`);
  host.addEventListener('open', () =>
    sendToHost({ event: args.registerEvent, uuid: args.pluginUUID })
  );
  host.addEventListener('message', event => {
    let message;
    try {
      message = JSON.parse(String(event.data));
    } catch {
      return;
    }
    onHostEvent(message);
  });
  // The app closes the socket when it quits or unloads the plugin; there is
  // nothing left to do then.
  host.addEventListener('close', () => process.exit(0));
  host.addEventListener('error', error =>
    log('Stream Deck connection failed:', error.message ?? error)
  );
}

/**
 * Where a key sits. The protocol says so in `coordinates`; OpenDeck also
 * spells the position into the context (`…Keypad.<position>.<n>`), which is
 * the fallback.
 */
function placeOf(context, device, payload) {
  const coordinates = payload?.coordinates;
  if (Number.isInteger(coordinates?.row) && Number.isInteger(coordinates?.column))
    return { row: coordinates.row, column: coordinates.column };
  const position = Number(/Keypad\.(\d+)/.exec(context)?.[1]);
  if (!Number.isInteger(position)) return undefined;
  const { columns } = devices.get(device) ?? DEFAULT_SIZE;
  return { row: Math.floor(position / columns), column: position % columns };
}

function onHostEvent({ event, context, device, payload, deviceInfo }) {
  switch (event) {
    case 'deviceDidConnect':
      if (device && deviceInfo?.size) {
        devices.set(device, deviceInfo.size);
        renderAll();
      }
      break;
    case 'willAppear': {
      // Inside a multi-action a key has no place of its own on the deck.
      if (payload?.isInMultiAction) break;
      const place = placeOf(context, device, payload);
      if (!place) break;
      keys.set(context, { device, ...place });
      lastImage.delete(context);
      render(context);
      break;
    }
    case 'willDisappear':
      keys.delete(context);
      lastImage.delete(context);
      break;
    case 'keyDown':
      press(context);
      break;
  }
}

/* ------------------------------------------------------------------------ */
/* What each key is                                                          */
/* ------------------------------------------------------------------------ */

/**
 * How a deck is divided: the last column holds the controls (the folder, mute
 * and, at the bottom, the key left free for leaving the page), and the rest is
 * the tiles' area — or, with the folder open, the saved screens.
 */
function areasOf(device) {
  const { columns, rows } = devices.get(device) ?? DEFAULT_SIZE;
  const area = { columns: Math.max(1, columns - 1), rows };
  const side = columns - 1;
  const control = (row, column) => {
    if (column !== side) return undefined;
    if (row === rows - 1) return 'exit';
    if (row === 0) return 'folder';
    if (row === 1) return 'mute';
    return 'none';
  };
  return { area, control };
}

/** Tiles closer than this to a key boundary count as lined up with it. */
const ALIGNED = 0.02;

/**
 * Where each tile goes on an area of keys: the smallest key grid its tiles
 * line up on, so a 2×2 is four keys and the focus wall's big tile takes a
 * block of them. A wall that lines up on none (say thirds over halves) gets the
 * closest fit, and one with more tiles than keys, or no shapes at all, one key
 * per tile in reading order.
 *
 * Returns `[{ top, left, rows, columns }]`, by tile.
 */
function placeTiles(tiles, area) {
  const shaped = tiles.length > 0 && tiles.every(tile => tile.rect);
  let best;
  if (shaped)
    for (let columns = 1; columns <= area.columns; columns++)
      for (let rows = 1; rows <= area.rows; rows++) {
        const taken = new Set();
        let error = 0;
        let fits = true;
        const places = tiles.map(({ rect: [x0, y0, x1, y1] }) => {
          const snap = (value, steps) => {
            const step = Math.round(value * steps);
            error += Math.abs(value - step / steps);
            return step;
          };
          const left = snap(x0, columns);
          const top = snap(y0, rows);
          const right = snap(x1, columns);
          const bottom = snap(y1, rows);
          if (right <= left || bottom <= top) fits = false;
          for (let row = top; row < bottom; row++)
            for (let column = left; column < right; column++) {
              if (taken.has(`${row}:${column}`)) fits = false;
              taken.add(`${row}:${column}`);
            }
          return { top, left, rows: bottom - top, columns: right - left };
        });
        if (!fits) continue;
        // Lined up is lined up, and then fewer keys win.
        const score =
          (error > ALIGNED * tiles.length * 4 ? error : 0) + columns * rows * 1e-3;
        if (!best || score < best.score) best = { score, places };
      }
  if (best) return best.places;

  const order = tiles.map((_, i) => i);
  if (shaped)
    order.sort(
      (a, b) =>
        tiles[a].rect[1] - tiles[b].rect[1] || tiles[a].rect[0] - tiles[b].rect[0]
    );
  const places = [];
  order.slice(0, area.columns * area.rows).forEach((tile, i) => {
    places[tile] = {
      top: Math.floor(i / area.columns),
      left: i % area.columns,
      rows: 1,
      columns: 1
    };
  });
  return places;
}

/** The saved screens over the area's keys, with a "more" key when they do not fit. */
function screenSlots(device, slotCount) {
  const screens = app?.screens ?? [];
  if (screens.length <= slotCount)
    return Array.from({ length: slotCount }, (_, i) =>
      i < screens.length ? { screen: i } : {}
    );
  const perPage = slotCount - 1;
  const pages = Math.ceil(screens.length / perPage);
  const page = (screenPage.get(device) ?? 0) % pages;
  return Array.from({ length: slotCount }, (_, i) => {
    if (i === perPage) return { more: true, page, pages };
    const screen = page * perPage + i;
    return screen < screens.length ? { screen } : {};
  });
}

/** What the key at a place is. */
function roleOf(context) {
  const key = keys.get(context);
  if (!key) return undefined;
  const { area, control } = areasOf(key.device);
  const open = folderOpen.has(key.device);
  const kind = control(key.row, key.column);
  if (kind === 'folder') return { kind, open };
  if (kind === 'mute') return { kind };
  if (kind) return { kind: 'empty' };

  if (!app) return { kind: 'offline', area, ...key };
  if (open) {
    const slot = key.row * area.columns + key.column;
    return { kind: 'screen', ...screenSlots(key.device, area.columns * area.rows)[slot] };
  }
  const places = placeTiles(app.tiles, area);
  const tile = places.findIndex(
    place =>
      place &&
      key.row >= place.top &&
      key.row < place.top + place.rows &&
      key.column >= place.left &&
      key.column < place.left + place.columns
  );
  if (tile < 0) return { kind: 'empty' };
  return { kind: 'tile', tile, place: places[tile], row: key.row, column: key.column };
}

function press(context) {
  const role = roleOf(context);
  if (!role) return;
  const device = keys.get(context).device;
  // The folder and its pages are the deck's own business.
  if (role.kind === 'folder') {
    if (role.open) folderOpen.delete(device);
    else folderOpen.add(device);
    renderAll();
    return;
  }
  if (role.kind === 'screen' && role.more) {
    screenPage.set(device, (role.page + 1) % role.pages);
    renderAll();
    return;
  }
  if (!clients.size) {
    // Nothing to send it to: the page is closed or has not opted in.
    sendToHost({ event: 'showAlert', context });
    return;
  }
  if (role.kind === 'tile') broadcast({ type: 'tile', index: role.tile });
  else if (role.kind === 'mute') broadcast({ type: 'mute' });
  else if (role.kind === 'screen' && role.screen !== undefined) {
    broadcast({ type: 'screen', index: role.screen });
    // Picked: back to the tiles, which now show it.
    folderOpen.delete(device);
    renderAll();
  }
}

/* ------------------------------------------------------------------------ */
/* Logos                                                                     */
/* ------------------------------------------------------------------------ */

/** url → { dataUri } once fetched, `null` while fetching or after failing. */
const logos = new Map();

function logoFor(url) {
  if (!url || !/^https?:\/\//.test(url)) return undefined;
  if (logos.has(url)) return logos.get(url)?.dataUri;
  logos.set(url, null);
  fetch(url, { signal: AbortSignal.timeout(8000) })
    .then(async res => {
      const type = (res.headers.get('content-type') ?? '').split(';')[0].trim();
      if (!res.ok || !type.startsWith('image/')) throw new Error(`${res.status} ${type}`);
      const bytes = Buffer.from(await res.arrayBuffer());
      if (bytes.length > 1024 * 1024) throw new Error('too big');
      logos.set(url, { dataUri: `data:${type};base64,${bytes.toString('base64')}` });
      renderAll();
    })
    .catch(error => log(`logo ${url}: ${error.message}`));
  return undefined;
}

/* ------------------------------------------------------------------------ */
/* Key faces                                                                 */
/* ------------------------------------------------------------------------ */

const COLORS = {
  idle: '#18181b',
  active: '#1d4ed8',
  text: '#f4f4f5',
  muted: '#a1a1aa',
  off: '#3f3f46',
  alert: '#b91c1c',
  warn: '#b45309'
};
const FONT = 'DejaVu Sans, Arial, Helvetica, sans-serif';

const escapeXml = text =>
  String(text).replace(
    /[<>&"']/g,
    char =>
      ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[
        char
      ]
  );

/** Breaks a name into at most `maxLines` lines of about `width` characters. */
function wrap(text, width, maxLines) {
  const words = String(text).trim().split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  for (let word of words) {
    while (word.length > width) {
      if (line) {
        lines.push(line);
        line = '';
      }
      lines.push(word.slice(0, width));
      word = word.slice(width);
    }
    if (!line) line = word;
    else if (line.length + 1 + word.length <= width) line += ' ' + word;
    else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  if (lines.length > maxLines) {
    lines.length = maxLines;
    lines[maxLines - 1] = lines[maxLines - 1].slice(0, width - 1) + '…';
  }
  return lines;
}

/** Roughly how wide a bold character is, as a share of the font size. */
const CHAR_WIDTH = 0.62;

/**
 * A name laid out to fit `width`: as big as `size` allows, smaller when its
 * longest word would not fit on a line, and then wrapped.
 */
function fit(text, { width, size, maxLines }) {
  const longest = Math.max(1, ...String(text).split(/\s+/).map(word => word.length));
  const fitted = Math.min(size, width / (longest * CHAR_WIDTH));
  const chars = Math.max(1, Math.floor(width / (fitted * CHAR_WIDTH)));
  return { lines: wrap(text, chars, maxLines), size: fitted };
}

/** Centred lines of text around `centerY`. */
function textBlock(lines, { x, centerY, size, color }) {
  const lineHeight = size * 1.15;
  const firstY = centerY - ((lines.length - 1) * lineHeight) / 2 + size * 0.35;
  return lines
    .map(
      (line, i) =>
        `<text x="${x}" y="${(firstY + i * lineHeight).toFixed(1)}" text-anchor="middle" font-size="${size.toFixed(1)}" font-weight="700" fill="${color}">${escapeXml(line)}</text>`
    )
    .join('');
}

/**
 * One key's image. A tile over several keys is drawn once, as one picture as
 * big as all of them, and each key shows its own part of it (`column`, `row`).
 */
const svg = (body, { column = 0, row = 0 } = {}) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${KEY}" height="${KEY}" viewBox="${column * KEY} ${row * KEY} ${KEY} ${KEY}" font-family="${FONT}">${body}</svg>`;

const background = color => `<rect width="${KEY}" height="${KEY}" fill="${color}"/>`;

/** A speaker, at 1:1 in a 26×22 box from (x, y); crossed out when muted. */
function speaker(x, y, color, { waves = true, crossed = false } = {}) {
  let path = `<path fill="${color}" d="M${x} ${y + 6}h6l8 -6v22l-8 -6h-6z"/>`;
  if (crossed)
    path += `<path fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" d="M${x + 18} ${y + 6}l9 10M${x + 27} ${y + 6}l-9 10"/>`;
  else if (waves)
    path += `<path fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" d="M${x + 19} ${y + 5}a7 7 0 0 1 0 12"/>`;
  return path;
}

/** Lines of text whose last baseline sits at `baseline`. */
function bottomText(lines, { x, baseline, size, color }) {
  const lineHeight = size * 1.15;
  return textBlock(lines, {
    x,
    centerY: baseline - ((lines.length - 1) * lineHeight) / 2 - size * 0.35,
    size,
    color
  });
}

/**
 * A tile: its number and (when heard) a speaker in the top corners, the logo
 * above and the name at the bottom. A tile over several keys is one picture
 * across all of them; over more than one row of keys the logo keeps to the
 * top row and the name to the bottom one, so the gap between rows cuts through
 * neither — only the gaps between columns do.
 */
function tileFace({ tile: index, place, row, column }) {
  const tile = app.tiles[index];
  const heard = app.selectedTile === index;
  const width = place.columns * KEY;
  const height = place.rows * KEY;
  const wide = place.columns >= 2;
  const name = tile.name || '—';
  const logo = logoFor(tile.logo);
  const pad = 14;

  let body = `<rect width="${width}" height="${height}" fill="${heard ? COLORS.active : COLORS.idle}"/>`;
  body += `<text x="${pad}" y="${pad + 16}" font-size="20" font-weight="700" fill="${heard ? COLORS.text : COLORS.muted}">${index + 1}</text>`;
  if (heard) {
    // The tile that is heard: a speaker (crossed out while there is no sound),
    // or the fullscreen corners when it fills the monitor.
    const x = width - pad - 26;
    body += app.fullscreen
      ? `<path fill="none" stroke="${COLORS.text}" stroke-width="3.5" stroke-linecap="round" d="M${x} ${pad + 8}V${pad}h8M${x + 26} ${pad + 8}V${pad}h-8M${x} ${pad + 14}v8h8M${x + 26} ${pad + 14}v8h-8"/>`
      : speaker(x, pad, COLORS.text, { crossed: app.muted || app.audioBlocked });
  }

  const tall = place.rows >= 2;
  const label = fit(name, {
    width: width - 2 * pad,
    size: tall ? (wide ? 36 : 22) : logo ? (wide ? 20 : 17) : name.length <= 8 ? 24 : 20,
    maxLines: tall || !logo ? 2 : 1
  });
  const baseline = height - pad - 4;
  body += bottomText(label.lines, {
    x: width / 2,
    baseline,
    size: label.size,
    color: COLORS.text
  });

  if (logo) {
    // The logo's box: the top row of keys when there is more than one, clear
    // of the corner marks; otherwise whatever the name leaves.
    let box;
    if (tall && wide) box = { x: pad + 30, y: pad, width: width - 2 * (pad + 30), height: KEY - 2 * pad };
    else if (tall) box = { x: pad, y: pad + 26, width: width - 2 * pad, height: KEY - pad - 26 - 8 };
    else {
      const top = pad + 26;
      const nameTop = baseline - label.lines.length * label.size * 1.15 - 4;
      box = { x: pad, y: top, width: width - 2 * pad, height: nameTop - top };
    }
    body += `<image href="${logo}" x="${box.x}" y="${box.y}" width="${box.width}" height="${box.height}" preserveAspectRatio="xMidYMid meet"/>`;
  }
  return svg(body, { column: column - place.left, row: row - place.top });
}

/** A 2×2 grid: the saved screens. */
const gridGlyph = (x, y, cell, color) =>
  [
    [0, 0],
    [1, 0],
    [0, 1],
    [1, 1]
  ]
    .map(
      ([i, j]) =>
        `<rect x="${x + i * (cell + 2)}" y="${y + j * (cell + 2)}" width="${cell}" height="${cell}" rx="${cell / 5}" fill="${color}"/>`
    )
    .join('');

function screenFace({ screen, more, page, pages }) {
  if (more)
    return svg(
      background(COLORS.idle) +
        textBlock(['Más', `${page + 1}/${pages}`], {
          x: 72,
          centerY: 72,
          size: 24,
          color: COLORS.muted
        })
    );
  if (screen === undefined) return emptyFace();
  const active = app.activeScreen === screen;
  const name = app.screens[screen].name || `Pantalla ${screen + 1}`;
  const label = fit(name, {
    width: KEY - 20,
    size: name.length <= 8 ? 26 : 20,
    maxLines: 3
  });
  return svg(
    background(active ? COLORS.active : COLORS.idle) +
      gridGlyph(12, 12, 8, active ? COLORS.text : COLORS.muted) +
      textBlock(label.lines, {
        x: 72,
        centerY: 82,
        size: label.size,
        color: COLORS.text
      })
  );
}

/** The folder key: the saved screens, named after the one on air; ✕ while open. */
function folderFace({ open }) {
  if (open)
    return svg(
      background(COLORS.active) +
        `<path fill="none" stroke="${COLORS.text}" stroke-width="9" stroke-linecap="round" d="M48 48l48 48M96 48l-48 48"/>`
    );
  const enabled = !!app;
  const current = app?.screens?.[app.activeScreen]?.name ?? '';
  const label = fit(current || 'Pantallas', { width: KEY - 20, size: 20, maxLines: 2 });
  return svg(
    background(COLORS.idle) +
      gridGlyph(50, 18, 20, enabled ? COLORS.text : COLORS.off) +
      textBlock(label.lines, {
        x: 72,
        centerY: 104,
        size: label.size,
        color: enabled ? COLORS.muted : COLORS.off
      })
  );
}

function muteFace() {
  const muted = !!app?.muted;
  // The browser holds the sound back until a click in the page: say so,
  // since nothing pressed on the deck can lift it.
  if (app?.audioBlocked && !muted)
    return svg(
      background(COLORS.warn) +
        `<g transform="translate(46 22) scale(2)">${speaker(0, 0, COLORS.text, { crossed: true })}</g>` +
        textBlock(['Clic en', 'Tele'], { x: 72, centerY: 100, size: 22, color: COLORS.text })
    );
  const color = app ? COLORS.text : COLORS.off;
  // The speaker, drawn at three times its size.
  return svg(
    background(muted ? COLORS.alert : COLORS.idle) +
      `<g transform="translate(30 39) scale(3)">${speaker(0, 0, color, { crossed: muted })}</g>`
  );
}

/** The tiles' area while no page is connected: a notice on one key of it. */
function offlineFace({ area, row, column }) {
  const middle = {
    row: Math.floor((area.rows - 1) / 2),
    column: Math.floor((area.columns - 1) / 2)
  };
  return svg(
    background(COLORS.idle) +
      (row === middle.row && column === middle.column
        ? textBlock(['Abre', 'Tele'], {
            x: 72,
            centerY: 72,
            size: 26,
            color: COLORS.muted
          })
        : '')
  );
}

const emptyFace = () => svg(background('#000'));

function faceFor(context) {
  const role = roleOf(context);
  switch (role?.kind) {
    case 'tile':
      return tileFace(role);
    case 'screen':
      return screenFace(role);
    case 'folder':
      return folderFace(role);
    case 'mute':
      return muteFace();
    case 'offline':
      return offlineFace(role);
    case 'empty':
      return emptyFace();
  }
  return undefined;
}

function render(context) {
  const face = faceFor(context);
  if (!face) return;
  const image = `data:image/svg+xml;base64,${Buffer.from(face).toString('base64')}`;
  if (lastImage.get(context) === image) return;
  lastImage.set(context, image);
  sendToHost({ event: 'setImage', context, payload: { image, target: 0 } });
}

const renderAll = () => keys.forEach((_, context) => render(context));

/* ------------------------------------------------------------------------ */
/* Browser side                                                              */
/* ------------------------------------------------------------------------ */

function broadcast(command) {
  const frame = `data: ${JSON.stringify(command)}\n\n`;
  clients.forEach(res => res.write(frame));
}

/** Keeps only what the keys draw, whatever else a request carries. */
function readState(body) {
  const asText = (value, max) =>
    typeof value === 'string' ? value.slice(0, max) : '';
  const asIndex = value => (Number.isInteger(value) ? value : -1);
  const list = value => (Array.isArray(value) ? value.slice(0, 64) : []);
  const asRect = value =>
    Array.isArray(value) &&
    value.length === 4 &&
    value.every(n => typeof n === 'number' && Number.isFinite(n)) &&
    value[2] > value[0] &&
    value[3] > value[1]
      ? value
      : undefined;
  return {
    screens: list(body.screens).map(screen => ({ name: asText(screen?.name, 80) })),
    activeScreen: asIndex(body.activeScreen),
    tiles: list(body.tiles).map(tile => ({
      name: asText(tile?.name, 80),
      logo: asText(tile?.logo, 2048) || undefined,
      rect: asRect(tile?.rect)
    })),
    selectedTile: asIndex(body.selectedTile),
    fullscreen: body.fullscreen === true,
    muted: body.muted === true,
    audioBlocked: body.audioBlocked === true
  };
}

const server = http.createServer((req, res) => {
  const origin = req.headers.origin;
  // Any other site the browser has open could reach localhost too.
  if (origin && !isAllowedOrigin(origin)) {
    res.writeHead(403).end();
    return;
  }
  const cors = origin
    ? { 'Access-Control-Allow-Origin': origin, Vary: 'Origin' }
    : {};
  const path = new URL(req.url ?? '/', 'http://localhost').pathname;

  if (req.method === 'OPTIONS') {
    res
      .writeHead(204, {
        ...cors,
        'Access-Control-Allow-Methods': 'GET, POST',
        'Access-Control-Allow-Headers': 'Content-Type',
        // Chrome asks before a public site reaches a private address.
        'Access-Control-Allow-Private-Network': 'true'
      })
      .end();
    return;
  }

  if (req.method === 'GET' && path === '/events') {
    res.writeHead(200, {
      ...cors,
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive'
    });
    // How long the page waits before trying again once the plugin is back.
    res.write('retry: 3000\n\n');
    clients.add(res);
    log(`page connected (${clients.size} open)`);
    const keepAlive = setInterval(() => res.write(': ping\n\n'), 15000);
    req.on('close', () => {
      clearInterval(keepAlive);
      clients.delete(res);
      log(`page disconnected (${clients.size} open)`);
      if (!clients.size) {
        app = undefined;
        renderAll();
      }
    });
    return;
  }

  if (req.method === 'POST' && path === '/state') {
    let body = '';
    req.setEncoding('utf8');
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 256 * 1024) req.destroy();
    });
    req.on('end', () => {
      try {
        app = readState(JSON.parse(body));
      } catch {
        res.writeHead(400, cors).end();
        return;
      }
      res.writeHead(204, cors).end();
      renderAll();
    });
    return;
  }

  res.writeHead(404, cors).end();
});

server.on('error', error => log('browser bridge failed:', error.message));
server.listen(BRIDGE_PORT, '127.0.0.1', () =>
  log(`browser bridge on http://127.0.0.1:${BRIDGE_PORT}`)
);

connectHost();
