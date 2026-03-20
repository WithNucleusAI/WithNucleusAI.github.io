/**
 * Audio control utilities for background music
 */

interface ExtendedWindow extends Window {
  __audioFadeInterval?: number;
}

const TARGET_VOLUME = 0.5;
const FADE_STEPS = 20;
const FADE_STEP_TIME = 50; // 50ms * 20 steps = 1000ms

function clearFadeInterval(windowAny: ExtendedWindow) {
  if (windowAny.__audioFadeInterval) {
    clearInterval(windowAny.__audioFadeInterval);
    windowAny.__audioFadeInterval = undefined;
  }
}

/**
 * Backward-compatible stop that now performs a fade-out.
 */
export function stopAudio(): void {
  fadeOutAudio();
}

/**
 * Fade out audio over 1 second and pause
 */
export function fadeOutAudio(): void {
  const audio = document.getElementById("bg-music") as HTMLAudioElement | null;
  if (!audio) return;

  const windowAny = window as ExtendedWindow;
  clearFadeInterval(windowAny);

  if (audio.paused || audio.volume <= 0.01) {
    audio.pause();
    audio.volume = TARGET_VOLUME;
    return;
  }

  const volumeStep = audio.volume / FADE_STEPS;

  windowAny.__audioFadeInterval = window.setInterval(() => {
    const nextVolume = Math.max(0, audio.volume - volumeStep);
    if (nextVolume > 0.01) {
      audio.volume = nextVolume;
    } else {
      audio.pause();
      audio.volume = TARGET_VOLUME;
      clearFadeInterval(windowAny);
    }
  }, FADE_STEP_TIME);
}

/**
 * Fade in audio to 0.5 volume over 1 second
 */
export function fadeInAudio(): void {
  const audio = document.getElementById("bg-music") as HTMLAudioElement | null;
  if (!audio) return;

  const windowAny = window as ExtendedWindow;
  clearFadeInterval(windowAny);

  if (audio.paused) {
    audio.volume = 0;
    audio.play().catch(e => console.error("Audio play failed:", e));
  }

  const remainingVolume = Math.max(0, TARGET_VOLUME - audio.volume);
  if (remainingVolume <= 0.01) {
    audio.volume = TARGET_VOLUME;
    return;
  }

  const volumeStep = remainingVolume / FADE_STEPS;

  windowAny.__audioFadeInterval = window.setInterval(() => {
    if (audio.volume + volumeStep < TARGET_VOLUME - 0.01) {
      audio.volume += volumeStep;
    } else {
      audio.volume = TARGET_VOLUME;
      clearFadeInterval(windowAny);
    }
  }, FADE_STEP_TIME);
}