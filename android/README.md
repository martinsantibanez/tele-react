# Android TV

A thin WebView wrapper (`cl.tele.tv`, "Tele" in the launcher) around the web app.
The remote's D-pad/OK reach the page as `ArrowUp/Down/Left/Right` and `Enter`;
Back is sent to the page as `Escape` (twice quickly exits). Media autoplays, and
the user agent ends in `TeleTV/<version>` so the page can tell it is on a TV.

## Quick setup

Toolchain (one-time, no sudo): JDK 17 at `~/.local/jdk-17` and the Android SDK
(platform 35, build-tools) at `~/Android/Sdk`. Then:

```sh
echo "sdk.dir=$HOME/Android/Sdk" > android/local.properties

pnpm dev                                  # web app on :3333
adb connect 192.168.100.105:5555          # the test TV
adb reverse tcp:3333 tcp:3333             # TV's localhost:3333 -> this machine

cd android
JAVA_HOME=~/.local/jdk-17 ./gradlew assembleDebug
adb install -r app/build/outputs/apk/debug/app-debug.apk
adb shell am start -n cl.tele.tv/.MainActivity
```

- **Debugging:** with the TV connected over adb, open `chrome://inspect` in desktop
  Chrome; debug builds list the WebView there (console, DOM, network).
- **Other URL:** build with `-PteleUrl=https://…`, or launch with
  `--es url https://…` on `am start`.
- **Remote from the terminal:** `adb shell input keyevent KEYCODE_DPAD_DOWN`
  (`DPAD_CENTER`, `BACK`, `CHANNEL_UP`, `MEDIA_PLAY_PAUSE`, …).
- **Screenshot:** `adb exec-out screencap -p > tv.png`.
- `adb reverse` resets when the TV reboots or adb reconnects; re-run it if
  the app shows a blank page.

## What we know so far

- The CSS viewport depends on the TV's resolution and density (the 1080p
  test box, Android TV 12 with WebView 119, gives 960x540), so the layout
  shouldn't assume a fixed size. TVs report `pointer: none`, so they never
  match the mobile query's coarse-pointer branch.
- All remote keys arrive as normal key events, including `ChannelUp/Down`
  and `MediaPlayPause`.
- Focus can land in the search input, where the hotkeys stop working.
- Only one or two video streams play smoothly at a time.
- Broken upstream streams (e.g. CNN Chile at the time of testing) are
  retried over and over, which is costly on TV hardware.

## Proposed next steps

1. **TV-friendly navigation:** every action reachable with the D-pad and
   OK (no letter hotkeys, no hover-only controls), with a clear focus
   indicator and focus that never gets stuck in a text input.
2. **TV mode:** detect the TV (user agent marker) and adjust the defaults:
   fewer simultaneous streams, lower video quality, lighter effects.
3. **Remote extras:** map Channel Up/Down and the media keys to useful
   actions such as zapping and mute.
4. **More reliable sources:** prefer Zapping on TV, and stop retrying
   broken streams endlessly.
5. **Sign-in:** Google blocks OAuth inside WebViews, so YouTube needs the
   device flow (code entered on a phone); Spotify needs a phone handoff
   too.
6. **Release build:** point it at the deployed site, add signing, and
   make a proper launcher banner.
