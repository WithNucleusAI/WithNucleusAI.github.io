# Camera Relay — join a meeting from an India laptop using your California webcam

You need to join a video meeting that only admits Indian IPs. This runs the
meeting **on a laptop physically in India** (so it exits from a real Indian
residential IP — no VPN) while your **actual webcam in California** appears as
the camera. You sit in California and drive the whole thing.

> This is for a meeting you're invited to, working around a geo-check on your
> own side without involving the other party. Use it for access you're entitled
> to — not to make false claims about where you're based.

## Easy mode — the guided console (`app/`)

Prefer a UI over reading this? **[`app/index.html`](app/index.html)** is a
self-contained, no-install web console that walks a non-technical person through
the whole thing: you fill in your server address and passwords once, and it
writes out every command, config file, and URL below with copy buttons; the
Mac steps are a checklist that remembers your progress; and the last step is a
live "test my camera & mic" panel to confirm the whole chain works before the
call.

Open it two ways:
- **Just open the file** — double-click `app/index.html` (works offline; the
  camera test needs a normal browser tab with camera permission).
- **Host it on this site** — it's plain HTML, so it can be served from GitHub
  Pages like the rest of the repo.

The console can't spin up the server or install the Mac apps for you (a web page
is sandboxed), so those stay as guided copy-paste steps — everything else it
fills in and verifies for you. The rest of this README is the same process in
long form.

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

The relay is a small public-IP server (~$5/mo, put it near the target country —
for India, Mumbai) that both machines connect out to; it only forwards the
camera stream, so it is not a VPN.

**Easiest — one paste, no SSH.** Fill your two codes into
[`relay/cloud-init.sh`](relay/cloud-init.sh) (or let the guided app generate a
ready-filled copy), then paste the whole script into the provider's **User data
/ Startup Script / Cloud-Config** box when creating the server. It installs
Docker, writes the config, opens the ports, and starts MediaMTX on first boot.
Give it ~1 minute, then use the server's public IP as `RELAY_IP`.

**Or by hand over SSH:**
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
URL below. Either way, if your provider has a **separate** cloud firewall /
security group, open UDP/8890 and TCP/1935 there too.

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

> **India laptop is a Mac?** Follow **[`receiver/macos-setup.md`](receiver/macos-setup.md)**
> — a start-to-finish macOS runbook (OBS Virtual Camera + BlackHole mic, exact
> permissions, and per-platform device menus). The generic steps below are the
> same idea in short form.

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

## Microphone — your voice from California
Your mic is already muxed into the relay stream (the sender captures it). You
just expose it on the India laptop as a virtual **microphone** the meeting
selects. Two ways:

- **Easiest (no extra setup):** enable microphone redirection in your
  remote-desktop tool (RDP: *Local Resources → Microphone*; AnyDesk / Chrome
  Remote Desktop have audio options). The meeting's mic then = your CA mic via
  the remote session. Fine for talking; quality is compressed.
- **Over the relay (cleaner, in sync with your video):** turn the stream's audio
  into a virtual mic on the India laptop, per OS below.

**Linux — one script:**
```bash
cd camera-relay/receiver
bash virtual-mic-linux.sh        # creates a "RelayMic" device + starts routing
# in the meeting app, pick microphone = "RelayMic";  Ctrl+C to stop
bash virtual-mic-linux.sh teardown   # removes it when done
```
It builds a PulseAudio/PipeWire null sink + remapped source and feeds the
stream's audio into it with ffmpeg. Runs alongside your video path (OBS Virtual
Camera or `receive-to-vcam-linux.sh`).

**Windows — reuse the OBS you're already receiving video in:**
1. Install **VB-Audio Cable** (creates "CABLE Input" / "CABLE Output"), reboot.
2. In OBS: Settings → **Audio** → Advanced → **Monitoring Device** = *CABLE Input*.
3. Right-click the Media Source → **Advanced Audio Properties** → set *Audio
   Monitoring* to **Monitor Only (mute output)**.
4. In the meeting, pick microphone = **CABLE Output**. (Your face is still OBS
   Virtual Camera.)

**macOS — same idea with BlackHole:**
1. Install **BlackHole (2ch)**.
2. OBS → Settings → **Audio** → **Monitoring Device** = *BlackHole 2ch*; set the
   media source to **Monitor Only**.
3. Meeting microphone = **BlackHole 2ch**.

The Windows/macOS routes reuse the single OBS instance already pulling the
stream, so your mic and camera come from one decode and stay in lip-sync. The
Linux script pulls audio as a second reader — perfect for meetings, with a
possible fraction-of-a-second offset from the video; for tight sync on Linux
too, do both from one ffmpeg (video → v4l2loopback, audio → the null sink).

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
├── app/
│   └── index.html                   # the guided web console (easy mode)
├── config.env.example               # shared IP + passwords (copy to config.env)
├── relay/
│   ├── cloud-init.sh                # one-paste startup script (self-configures on boot)
│   ├── mediamtx.yml                 # SRT/RTMP relay config + auth
│   ├── docker-compose.yml           # run MediaMTX on the VPS
│   └── setup-relay.sh               # provision the VPS (docker + firewall)
├── sender/
│   └── send-webcam.sh               # California: ffmpeg webcam -> relay
└── receiver/
    ├── macos-setup.md               # India Mac: full OBS Virtual Camera + BlackHole runbook
    ├── receive-to-vcam-linux.sh     # India (Linux): relay -> /dev/video virtual cam
    └── virtual-mic-linux.sh         # India (Linux): relay audio -> "RelayMic" virtual mic
```
