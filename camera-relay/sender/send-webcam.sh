#!/usr/bin/env bash
# CALIFORNIA side — capture your real webcam + mic and push them to the relay.
# Headless alternative to OBS (see ../README.md for the OBS GUI path, which is
# easier for a live meeting because you can preview before you go live).
#
#   cp ../config.env.example ../config.env   # then edit it
#   bash send-webcam.sh
#
# Requires ffmpeg:  macOS `brew install ffmpeg`,  Linux `apt install ffmpeg`.
set -euo pipefail

cd "$(dirname "$0")"
source ../config.env

# Build the SRT publish URL. Credentials + target path ride in the streamid.
STREAMID="publish:cam:publisher:${PUBLISH_PASSWORD}"
URL="srt://${RELAY_IP}:${RELAY_PORT}?streamid=${STREAMID}&pkt_size=1316"
[[ -n "${SRT_PASSPHRASE}" ]] && URL="${URL}&passphrase=${SRT_PASSPHRASE}&pbkeylen=16"

OS="$(uname -s)"
echo "==> Sending webcam to ${RELAY_IP}:${RELAY_PORT} (path: cam) — Ctrl+C to stop"

# Low-latency H.264 + AAC, muxed to MPEG-TS for SRT. Keyframe every 2s (-g)
# so the receiver can lock on quickly.
COMMON_ENC=(-c:v libx264 -preset veryfast -tune zerolatency
            -b:v "${VIDEO_BITRATE}" -maxrate "${VIDEO_BITRATE}" -bufsize 5000k
            -pix_fmt yuv420p -g $(( FRAMERATE * 2 ))
            -c:a aac -b:a 128k -ar 48000
            -f mpegts "${URL}")

case "${OS}" in
  Linux)
    # Adjust /dev/video0 and the ALSA device if needed (see: v4l2-ctl --list-devices).
    exec ffmpeg -hide_banner \
      -f v4l2 -framerate "${FRAMERATE}" -video_size "${VIDEO_SIZE}" -i /dev/video0 \
      -f alsa -i default \
      "${COMMON_ENC[@]}"
    ;;
  Darwin)
    # List devices:  ffmpeg -f avfoundation -list_devices true -i ""
    # "0:0" = first video device : first audio device. Change if needed.
    exec ffmpeg -hide_banner \
      -f avfoundation -framerate "${FRAMERATE}" -video_size "${VIDEO_SIZE}" -i "0:0" \
      "${COMMON_ENC[@]}"
    ;;
  *)
    echo "On Windows, use the OBS path in ../README.md (simplest), or run this" >&2
    echo "under WSL/Git-Bash with a dshow input. Windows ffmpeg capture example:" >&2
    echo '  ffmpeg -f dshow -i video="Your Webcam":audio="Your Mic" ...' >&2
    exit 1
    ;;
esac
