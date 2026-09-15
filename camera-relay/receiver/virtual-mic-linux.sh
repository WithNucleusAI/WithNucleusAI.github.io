#!/usr/bin/env bash
# INDIA side (Linux) — expose your California voice (already carried in the
# relay stream) as a virtual MICROPHONE the meeting app can select as "RelayMic".
#
# Pairs with the video side (OBS Virtual Camera or receive-to-vcam-linux.sh);
# audio is pulled as a second reader on the same 'cam' path.
#
#   bash virtual-mic-linux.sh setup      # create the virtual mic (once per boot)
#   bash virtual-mic-linux.sh run        # route stream audio into it (keep running)
#   bash virtual-mic-linux.sh teardown   # remove the virtual mic
#
# `run` auto-creates the mic if needed, so `bash virtual-mic-linux.sh` alone is
# usually enough. Requires ffmpeg + pactl (PulseAudio or PipeWire-pulse).
# In the meeting app, pick "RelayMic" as the microphone.
set -euo pipefail

cd "$(dirname "$0")"
source ../config.env

SINK_NAME="relaymic_sink"     # hidden null sink we play the audio into
SOURCE_NAME="RelayMic"        # the microphone the meeting app sees

STREAMID="read:cam:viewer:${VIEW_PASSWORD}"
URL="srt://${RELAY_IP}:${RELAY_PORT}?streamid=${STREAMID}"
[[ -n "${SRT_PASSPHRASE}" ]] && URL="${URL}&passphrase=${SRT_PASSPHRASE}&pbkeylen=16"

setup() {
  if pactl list short sources 2>/dev/null | grep -q "${SOURCE_NAME}"; then
    echo "Virtual mic '${SOURCE_NAME}' already exists."
    return
  fi
  # A null sink to receive the audio, then a source remapped from its monitor
  # so apps list it as a real microphone (not just a hidden monitor).
  pactl load-module module-null-sink \
    sink_name="${SINK_NAME}" \
    sink_properties=device.description="RelayMicSink" >/dev/null
  pactl load-module module-remap-source \
    master="${SINK_NAME}.monitor" \
    source_name="${SOURCE_NAME}" \
    source_properties=device.description="${SOURCE_NAME}" >/dev/null
  echo "Virtual mic '${SOURCE_NAME}' created. Select it as the mic in the meeting app."
}

teardown() {
  # Unload only the two modules we created, matched by their arguments.
  while read -r idx _name args; do
    case "${args}" in
      *"source_name=${SOURCE_NAME}"*|*"sink_name=${SINK_NAME}"*)
        pactl unload-module "${idx}" 2>/dev/null || true ;;
    esac
  done < <(pactl list short modules)
  echo "Virtual mic removed."
}

run() {
  setup
  echo "==> Routing your California mic -> '${SOURCE_NAME}'. Ctrl+C to stop."
  # Decode only the audio (-vn); aresample keeps it continuous if packets jitter.
  exec ffmpeg -hide_banner -fflags nobuffer -flags low_delay \
    -i "${URL}" -vn \
    -af "aresample=async=1" -ar 48000 -ac 2 \
    -f pulse -device "${SINK_NAME}" "RelayMic-stream"
}

case "${1:-run}" in
  setup)    setup ;;
  run)      run ;;
  teardown) teardown ;;
  *) echo "usage: $0 {setup|run|teardown}" >&2; exit 1 ;;
esac
