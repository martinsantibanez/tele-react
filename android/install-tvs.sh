#!/usr/bin/env bash
# Install the release APK on one or more TVs over adb and launch it.
#
#   ./install-tvs.sh 192.168.100.105 192.168.100.120   # by IP (port 5555 assumed)
#   ./install-tvs.sh                                   # every device adb already sees
#   ./install-tvs.sh --build ...                       # rebuild the APK first
#
# A TV that has the debug build installed is signed with a different key, so
# Android refuses the update; the script then uninstalls and reinstalls, which
# clears that TV's saved screens and settings.
set -uo pipefail
cd "$(dirname "$0")"

APK=app/build/outputs/apk/release/app-release.apk
PKG=cl.tele.tv

if [[ "${1:-}" == "--build" ]]; then
  shift
  JAVA_HOME="${JAVA_HOME:-$HOME/.local/jdk-17}" ./gradlew assembleRelease -q || exit 1
fi
[[ -f "$APK" ]] || { echo "No $APK; run with --build" >&2; exit 1; }

targets=()
for host in "$@"; do
  [[ "$host" == *:* ]] || host="$host:5555"
  adb connect "$host" >/dev/null
  targets+=("$host")
done
if [[ ${#targets[@]} -eq 0 ]]; then
  mapfile -t targets < <(adb devices | awk 'NR>1 && $2=="device" {print $1}')
fi
[[ ${#targets[@]} -gt 0 ]] || { echo "No devices" >&2; exit 1; }

failed=0
for dev in "${targets[@]}"; do
  echo "== $dev"
  state=$(adb -s "$dev" get-state 2>&1)
  if [[ "$state" != "device" ]]; then
    echo "   not ready ($state) — accept the adb prompt on the TV and retry"
    failed=1; continue
  fi
  out=$(adb -s "$dev" install -r "$APK" 2>&1)
  if [[ "$out" == *INSTALL_FAILED_UPDATE_INCOMPATIBLE* ]]; then
    echo "   signed with another key; uninstalling first"
    adb -s "$dev" uninstall "$PKG" >/dev/null
    out=$(adb -s "$dev" install "$APK" 2>&1)
  fi
  if [[ "$out" == *Success* ]]; then
    adb -s "$dev" shell am start -n "$PKG/.MainActivity" >/dev/null
    echo "   installed and launched"
  else
    echo "   failed: $out"; failed=1
  fi
done
exit $failed
