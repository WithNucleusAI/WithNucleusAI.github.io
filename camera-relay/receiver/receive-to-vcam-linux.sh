#!/usr/bin/env bash
# INDIA side (Linux only) — pull the stream from the relay and expose it as a
# virtual webcam (/dev/videoN) that the meeting client selects.
#
# On Windows/macOS use the OBS path in ../README.md instead (OBS Virtual Camera
# is the cross-platform way and needs no kernel module).
#
# One-time setup:
#   sudo apt install v4l2loopback-dkms ffmpeg
#   sudo modprobe v4l2loopback video_nr=10 card_label="RelayCam" exclusive_caps=1
# The meeting app will then list "RelayCam" as a camera.
#
#   cp ../config.env.example ../config.env   # then edit it
#   bash receive-to-vcam-linux.sh
set -euo pipefail

cd "$(dirname "$0")"
source ../config.env

VCAM_DEV="${VCAM_DEV:-/dev/video10}"

STREAMID="read:cam:viewer:${VIEW_PASSWORD}"
URL="srt://${RELAY_IP}:${RELAY_PORT}?streamid=${STREAMID}"
[[ -n "${SRT_PASSPHRASE}" ]] && URL="${URL}&passphrase=${SRT_PASSPHRASE}&pbkeylen=16"

if [[ ! -e "${VCAM_DEV}" ]]; then
  echo "!!  ${VCAM_DEV} not found. Load the loopback module first:" >&2
  echo "    sudo modprobe v4l2loopback video_nr=10 card_label=\"RelayCam\" exclusive_caps=1" >&2
  exit 1
fi

echo "==> Piping relay -> ${VCAM_DEV} (select \"RelayCam\" in the meeting app). Ctrl+C to stop."
# For the microphone side (your CA voice), see ../README.md — route the stream's
# audio into a PulseAudio null sink and pick it as the mic, or just let the
# remote-desktop tool carry your mic.
exec ffmpeg -hide_banner -fflags nobuffer -flags low_delay \
  -i "${URL}" \
  -pix_fmt yuv420p -f v4l2 "${VCAM_DEV}"
