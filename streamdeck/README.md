# Stream Deck plugin

Turns a Stream Deck into a copy of Tele's monitor: one key per tile, to pick
the one that is heard or go fullscreen, plus the saved screens and mute.

It uses the plain Stream Deck plugin protocol, not Elgato's SDK, so the same
folder should load in OpenDeck (Linux) and in Elgato's Stream Deck app. It has no
dependencies and needs Node 22 or newer (Node 20 also works, run with a flag).

## Install

- **OpenDeck:** link the folder into its plugins directory and restart OpenDeck:

  ```sh
  ln -s "$PWD/streamdeck/cl.tele.remote.sdPlugin" ~/.config/opendeck/plugins/
  ```

- **Elgato (Windows/macOS):** copy or link `cl.tele.remote.sdPlugin` into the
  Stream Deck plugins folder and restart the app.

Then open Tele once with `?streamdeck=1` in the address. That switches the
connection on for this browser, and it stays on (`?streamdeck=0` turns it off).
On the deployed site Chrome asks once for permission to reach your local
network: allow it.

## The deck

There is a single action, **Tele**. Put it on every key except the bottom-right
one: each key works out what it is from where it sits. On a 5×3 deck:

```
┌────┬────┬────┬────┬────┐
│ T1      │ T2 │    │ ▦  │   T  the tiles of the screen on air, laid out as on
│         ├────┤    ├────┤      the monitor, on the smallest key grid they line
│         │ T3 │    │ 🔊 │      up on (up to 4×3). Press = hear it; press the
├────┬────┼────┤    ├────┤      one you hear = fullscreen on/off.
│ T4 │ T5 │ T6 │    │ ←  │   ▦  saved screens: opens them as a folder over the
└────┴────┴────┴────┴────┘      tiles; picking one switches and closes it.
                             🔊 mute / unmute.
                             ←  not ours: a key that leaves the page. In
                                OpenDeck, Starter Pack's Switch Profile.
```

A tile that spans several keys is drawn as one picture across all of them,
with its logo and name scaled up to match. A layout with more than 12 tiles shows the first 12, one key each.
With no Tele tab connected, a key press flashes an alert.

## How it connects

The plugin serves `http://127.0.0.1:39741`. The page listens on `GET /events`
(Server-Sent Events) and posts what it is showing to `POST /state`. Only the
deployed origin and `localhost` are let in. Add more with `TELE_DECK_ORIGINS`
(comma separated) in the plugin's environment. When several tabs are open, only
one visible tab connects (see `src/hooks/useStreamDeck.ts`).
