# India MacBook (macOS) — receiver setup

The confirmed India laptop is a Mac, so the whole receiver runs through **OBS**:
- **Video:** OBS Virtual Camera → your California face.
- **Audio:** OBS monitors the stream's audio into **BlackHole**, a virtual mic.

One OBS instance pulls the relay stream once and drives both, so your camera and
voice come from a single decode and stay in lip-sync. You do all of this over
your remote-desktop session into the Mac.

> Assumes macOS (Apple Silicon or Intel). Everything below — OBS, its virtual
> camera system extension, and BlackHole — is native on Apple Silicon.

## 0. Remote control from California
Pick a remote-desktop tool that relays the Mac's **audio back to you** (so you
hear the meeting) and can forward your keyboard/mouse:
- **Chrome Remote Desktop** or **AnyDesk** — both relay remote audio. Recommended.
- macOS built-in **Screen Sharing** (VNC) works for control but does *not* relay
  audio well — avoid it as your only channel.

## 1. Install OBS + BlackHole
```bash
# with Homebrew (easiest):
brew install --cask obs
brew install blackhole-2ch
```
Or download OBS from obsproject.com and BlackHole from existential.audio.

## 2. Grant macOS permissions — System Settings → Privacy & Security
- **Camera:** enable for OBS **and** your meeting app (Zoom/Chrome/Teams/Webex).
- **Microphone:** enable for OBS **and** the meeting app.
- On first launch OBS may ask to approve its **virtual-camera system extension**:
  *Allow* it (there's usually an "Allow software from OBS…" button lower in
  Privacy & Security), then reboot once if prompted.

## 3. Video — receive the stream → OBS Virtual Camera
1. OBS → **Sources** → **+** → **Media Source** → uncheck *Local File*.
2. **Input:**
   `srt://RELAY_IP:8890?streamid=read:cam:viewer:YOUR_VIEW_PASSWORD`
   (append `&passphrase=...&pbkeylen=16` if you set `SRT_PASSPHRASE`).
3. **Input Format:** `mpegts`. Tick **Restart playback when source becomes active**.
4. Your California webcam should appear in the OBS canvas.
5. Bottom-right → **Start Virtual Camera**.

## 4. Audio — route your voice → BlackHole (virtual mic)
1. OBS → **Settings → Audio → Advanced → Monitoring Device = BlackHole 2ch** → OK.
2. Back on the main window, right-click the **Media Source** → **Advanced Audio
   Properties**.
3. Set that source's **Audio Monitoring** to **Monitor Only (mute output)**.
   - *Monitor Only* sends your CA voice to BlackHole (the mic the meeting reads);
   - *mute output* keeps it off the Mac's speakers so it can't loop back into the
     meeting as an echo.

## 5. Join the meeting (on the Mac, via your remote session)
Start the OBS Virtual Camera **before** opening the meeting app so it's listed.
Then in the meeting app set:
- **Camera → OBS Virtual Camera**
- **Microphone → BlackHole 2ch**
- **Speaker → the Mac's normal output** (MacBook Speakers / headphones) so your
  remote-desktop tool relays the meeting audio back to California.

If the app doesn't show the virtual camera or BlackHole, fully **quit and reopen
the app** (most apps enumerate devices only at launch).

### Per-platform device menus
- **Zoom:** Settings → **Video** → Camera → *OBS Virtual Camera*; **Audio** →
  Microphone → *BlackHole 2ch*, Speaker → *MacBook Speakers*. Update Zoom to the
  latest build if the virtual camera is hidden.
- **Google Meet (Chrome):** in-call **⚙ Settings** → Camera → *OBS Virtual
  Camera*; Microphone → *BlackHole 2ch*. Make sure Chrome has Camera/Mic in
  Privacy & Security.
- **Microsoft Teams:** **… → Settings → Devices** → Camera / Microphone / Speaker.
- **Webex:** **Audio/Video settings** → same three.

## Sanity check before the real call
- OBS canvas shows your live CA face (not frozen) → video path OK.
- OBS audio meter for the Media Source moves when you talk in California → audio
  reaching the Mac.
- In the meeting's **preview/lobby**, camera shows you and the mic meter reacts,
  and the region indicator (if any) reads India.

## Troubleshooting (macOS-specific)
| Symptom | Fix |
|---|---|
| Meeting app doesn't list OBS Virtual Camera | Start Virtual Camera first, then quit+reopen the app. Approve the OBS system extension in Privacy & Security; reboot once. |
| No "BlackHole 2ch" option | Reinstall `brew install blackhole-2ch`; log out/in. Confirm it shows in *Audio MIDI Setup*. |
| You hear an echo of yourself | The Media Source audio must be **Monitor Only (mute output)**, not *Monitor and Output*. |
| You can't hear the meeting | Meeting **Speaker** must be the Mac's real output, and your remote-desktop tool must have audio relay enabled (use Chrome Remote Desktop / AnyDesk, not plain VNC). |
| Camera is black in the meeting | Grant the meeting app Camera permission in Privacy & Security; verify OBS shows the feed first. |
