# Camera Relay — join a meeting from an India laptop using your California webcam

You need to join a video meeting that only admits Indian IPs. This runs the
meeting **on a laptop physically in India** (so it exits from a real Indian
residential IP — no VPN) while your **actual webcam in California** appears as
the camera. You sit in California and drive the whole thing.

> This is for a meeting you're invited to, working around what looks like a
> broken geo-check. Fastest real fix is still to ask the host to disable the
> region restriction — if it's the bug you think it is, that's a one-click
> change and none of the below is needed. Also confirm doing this doesn't
> violate the platform's or organizer's terms for the meeting.

## How it works — two independent layers

```
  CALIFORNIA (you)                 CLOUD RELAY (VPS)           INDIA (residential laptop)          MEETING
 ┌────────────────┐            ┌───────────────────┐        ┌────────────────────────────┐      ┌──────────┐
 │ webcam + mic   │─SRT push──▶│ MediaMTX          │─pull──▶│ OBS ▶ OBS Virtual Camera   │─────▶│ server   │
 │ OBS or ffmpeg  │  video/aud │ public IP :8890   │  SRT   │  selected as the "webcam"  │India │ sees the │
 └────────────────┘            └───────────────────┘        │ Meeting client runs HERE   │ IP   │ India IP │
        ▲                                                    │                            │      └──────────┘
        │  Remote desktop (AnyDesk/RDP): SEE the meeting,    │  screen + audio redirected │
        └────────  HEAR people, TALK, drive the laptop ◀─────│  back to California        │
                                                             └────────────────────────────┘
```

1. **Camera layer (this repo).** Your CA webcam is streamed to the India laptop
   and published there as a *virtual webcam*. The meeting picks that virtual
   webcam, so your face rides in from the Indian IP. This is the part a
   remote-desktop tool can't do well — that's why we build it.
2. **Control layer (off-the-shelf).** A remote-desktop tool (AnyDesk, Chrome
   Remote Desktop, RDP) so you can watch the meeting, hear people, talk, and
   click around the India laptop. Remote desktop *does* screen + audio well.

The relay carries **only your camera feed**. The meeting's own traffic goes
India-laptop → meeting-server directly, so it stays on the Indian IP. The relay
is not a VPN.

### What you need
- A **laptop in India** on a residential connection (a friend's/home machine).
  A residential IP is what beats the geo-check; a cloud VM's datacenter IP may
  get flagged the same way a VPN would.
- A **tiny VPS** with a public IP for the relay (1 vCPU / 1 GB is plenty; put it
  in **Mumbai** so the last hop is short). ~$5/mo, destroy it after.
- **OBS Studio** on both laptops (cross-platform; the reliable path), or ffmpeg
  (the headless scripts here).
- A **remote-desktop tool** connecting CA → India laptop.

---

## Step 1 — Stand up the relay (VPS)

```bash
# 1. Put strong passwords in the config:
cd camera-relay/relay
openssl rand -hex 24          # generate one for publisher
openssl rand -hex 24          # and one for viewer
#   edit mediamtx.yml -> replace CHANGE_ME_PUBLISH_PASSWORD / CHANGE_ME_VIEW_PASSWORD

# 2. Copy to the VPS and launch:
scp -r ../relay user@RELAY_IP:~/relay
ssh user@RELAY_IP 'cd ~/relay && sudo bash setup-relay.sh'
```

`setup-relay.sh` installs Docker, opens UDP/8890 (SRT) + TCP/1935 (RTMP), and
starts MediaMTX. Note the VPS **public IP** it prints — it goes in every stream
URL below. Also open those ports in your cloud provider's security group.

## Step 2 — Fill in shared config (both laptops)

```bash
cd camera-relay
cp config.env.example config.env
#   set RELAY_IP + the two passwords (and optionally SRT_PASSPHRASE) to match the VPS
```

`config.env` is gitignored, so your IP and passwords never get committed.

## Step 3 — California: send your webcam

**OBS (recommended — you can preview before going live):**
1. Settings → **Stream** → Service **Custom**.
2. Server: `srt://RELAY_IP:8890?streamid=publish:cam:publisher:YOUR_PUBLISH_PASSWORD`
   (append `&passphrase=...&pbkeylen=16` if you set `SRT_PASSPHRASE`).
   Stream Key: leave blank.
3. Settings → **Output** → Output Mode **Advanced** → Encoder x264, tune
   **zerolatency**, bitrate ~2500 Kbps, keyframe interval **2s**.
4. Add a **Video Capture Device** source = your webcam. **Start Streaming.**

**Or headless ffmpeg:** `bash sender/send-webcam.sh` (edit the device in the
script if `/dev/video0` / avfoundation `0:0` isn't your camera).

## Step 4 — India laptop: receive → virtual camera

You're doing this over your remote-desktop session into the India laptop.

**OBS (Windows/macOS/Linux — the cross-platform way):**
1. Add a **Media Source** → uncheck *Local File*.
2. Input: `srt://RELAY_IP:8890?streamid=read:cam:viewer:YOUR_VIEW_PASSWORD`
   (append the same `&passphrase=...&pbkeylen=16` if used).
   Input Format: `mpegts`. Tick *Restart playback when source becomes active*.
3. You should see your CA webcam in OBS. Click **Start Virtual Camera** (bottom
   right).

**Or Linux headless:** `bash receiver/receive-to-vcam-linux.sh` after loading
`v4l2loopback` (see that script's header).

## Step 5 — Join the meeting from the India laptop

1. Open the meeting app/link **on the India laptop** (still via remote desktop).
2. In its device settings pick **OBS Virtual Camera** (or `RelayCam`) as the
   camera. Your California face appears — from the Indian IP.
3. **Audio:** simplest is to let the **remote-desktop tool** carry it — it
   redirects the India laptop's speaker back to you (you hear everyone) and can
   forward your local mic to India (you talk). If your remote tool won't forward
   the mic, add a mic path over the relay (see *Microphone* below).
4. Use the meeting's **preview/lobby screen** to confirm camera + region look
   right before you commit.

---

## Microphone options (your voice)
- **Easiest:** enable microphone redirection in your remote-desktop tool (RDP:
  *Local Resources → Microphone*; AnyDesk/Chrome Remote Desktop have audio
  options). Then the meeting's mic = your CA mic via the remote session. No extra
  setup.
- **Over the relay (better quality):** the sender already muxes your mic into the
  stream. On the India laptop, route that audio into a virtual mic —
  Windows: **VB-Audio Cable** (OBS → Monitor to the cable → meeting mic = cable);
  Linux: a **PulseAudio null sink** fed by ffmpeg, selected as the mic.

## Latency & quality — set expectations
Your camera travels CA → Mumbai → India laptop → meeting. Expect roughly a
quarter-second of delay — usable, a bit like a satellite call. To keep it smooth:
- x264 **zerolatency**, keyframe interval **2s**, bitrate **1500–2500 Kbps** at
  720p (drop it on a weak uplink before raising resolution).
- Keep audio and video in the **one** stream so they stay in lip-sync.
- VPS in **Mumbai** minimizes the final leg. SRT (not RTMP) rides packet loss.

## Security
- Long random passwords in `mediamtx.yml`; set `SRT_PASSPHRASE` to AES-encrypt
  the link. Only 8890/udp + 1935/tcp open. Destroy the VPS afterward.
- `config.env` (your IP + passwords) is gitignored — keep it that way.
- It's your webcam on a box you control end-to-end; nothing here is shared with
  the meeting platform beyond the video itself.

## Troubleshooting
| Symptom | Fix |
|---|---|
| Receiver shows nothing | Confirm sender says "publishing"; check VPS firewall/security-group for udp/8890; verify RELAY_IP + passwords match on both ends. |
| "No camera found" in meeting | OBS Virtual Camera not started, or (cloud VM) no physical cam — you must use the virtual camera, there's no real device. Grant OS + app camera permission on the India laptop. |
| Meeting still blocks you | It may not be IP-based (checks account country / phone / billing), or the India IP is datacenter — use a **residential** India machine. |
| Choppy / laggy video | Lower bitrate & resolution; move VPS to Mumbai; prefer SRT over RTMP; wire the India laptop to ethernet. |
| Audio out of sync | Keep A/V in one stream; don't run mic over the relay *and* over remote desktop at once — pick one. |
| SRT won't connect, RTMP fine | Some networks block UDP. Use the RTMP fallback URL `rtmp://RELAY_IP/cam` with the same user:pass in mediamtx, or set an `SRT_PASSPHRASE`. |

## Files
```
camera-relay/
├── README.md                        # this runbook
├── config.env.example               # shared IP + passwords (copy to config.env)
├── relay/
│   ├── mediamtx.yml                 # SRT/RTMP relay config + auth
│   ├── docker-compose.yml           # run MediaMTX on the VPS
│   └── setup-relay.sh               # provision the VPS (docker + firewall)
├── sender/
│   └── send-webcam.sh               # California: ffmpeg webcam -> relay
└── receiver/
    └── receive-to-vcam-linux.sh     # India (Linux): relay -> /dev/video virtual cam
```
