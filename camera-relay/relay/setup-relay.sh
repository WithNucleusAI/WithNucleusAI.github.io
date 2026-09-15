#!/usr/bin/env bash
# Provision a fresh Ubuntu/Debian VPS as the camera relay.
# Run ON THE VPS as root (or with sudo). Put a strong password in mediamtx.yml
# FIRST, then run this from the camera-relay/relay directory.
#
#   scp -r camera-relay/relay user@RELAY_IP:~/relay
#   ssh user@RELAY_IP
#   cd ~/relay && sudo bash setup-relay.sh
#
# Pick a VPS region close to the India laptop (e.g. Mumbai) so the last hop
# is short. A 1 vCPU / 1 GB box is plenty — the relay only forwards packets,
# it does not transcode.
set -euo pipefail

if [[ $EUID -ne 0 ]]; then
  echo "Run as root (sudo bash setup-relay.sh)." >&2
  exit 1
fi

echo "==> Installing Docker if needed..."
if ! command -v docker >/dev/null 2>&1; then
  curl -fsSL https://get.docker.com | sh
fi

echo "==> Opening firewall ports (SRT udp/8890, RTMP tcp/1935, SSH)..."
if command -v ufw >/dev/null 2>&1; then
  ufw allow 22/tcp        || true
  ufw allow 8890/udp      || true
  ufw allow 1935/tcp      || true
  ufw --force enable      || true
  ufw status
else
  echo "    ufw not present — make sure your cloud provider's firewall/security"
  echo "    group allows inbound udp/8890 and tcp/1935."
fi

echo "==> Sanity-checking mediamtx.yml..."
if grep -q "CHANGE_ME" mediamtx.yml; then
  echo "!!  mediamtx.yml still contains CHANGE_ME passwords. Edit them first." >&2
  echo "    Generate strong ones with:  openssl rand -hex 24" >&2
  exit 1
fi

echo "==> Starting relay..."
docker compose up -d
sleep 2
docker compose ps
echo
echo "Relay is up. Note this box's PUBLIC IP; it goes in the sender/receiver URLs:"
curl -fsS https://api.ipify.org 2>/dev/null || echo "(look it up in your VPS dashboard)"
echo
echo "Logs:  docker compose logs -f"
