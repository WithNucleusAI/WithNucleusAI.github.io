#!/bin/bash
# One-paste relay setup. Paste this whole file into your cloud provider's
# "User data" / "Startup Script" / "Cloud-Config" box when CREATING the server
# (often under an "Advanced" section). The server then configures itself on
# first boot — no SSH, no commands to type.
#
# Replace PUBLISH_CODE_HERE and VIEW_CODE_HERE with your two codes first
# (the guided app at ../app/index.html fills these in for you and gives you a
# ready-to-paste version). Keep the two codes matching what the sender/receiver
# use. Default SRT port is 8890.
set -e
export DEBIAN_FRONTEND=noninteractive

# 1. Docker (installed only if missing)
command -v docker >/dev/null 2>&1 || curl -fsSL https://get.docker.com | sh

# 2. Relay config, written with your codes baked in
cat >/root/mediamtx.yml <<'YML'
logLevel: info

srt: yes
srtAddress: :8890
rtmp: yes
rtmpAddress: :1935
rtsp: no
hls: no
webrtc: no
api: no

authInternalUsers:
  - user: publisher
    pass: PUBLISH_CODE_HERE
    ips: []
    permissions:
      - action: publish
        path: cam
  - user: viewer
    pass: VIEW_CODE_HERE
    ips: []
    permissions:
      - action: read
        path: cam

paths:
  cam:
    source: publisher
YML

# 3. Open the ports the relay needs (in-server firewall)
if command -v ufw >/dev/null 2>&1; then
  ufw allow 22/tcp
  ufw allow 8890/udp
  ufw allow 1935/tcp
  ufw --force enable
fi

# 4. Start the relay (auto-restarts on reboot)
docker rm -f relay 2>/dev/null || true
docker run -d --name relay --restart unless-stopped --network host \
  -v /root/mediamtx.yml:/mediamtx.yml:ro bluenviron/mediamtx:latest

# Note: some providers ALSO have a separate cloud firewall / security group.
# If yours does, allow UDP 8890 and TCP 1935 there too.
