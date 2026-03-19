/**
 * Audio control utilities for background music
 */

interface ExtendedWindow extends Window {
  __audioFadeInterval?: number;
}

/**
 * Fade out audio over 1 second and pause
 */
export function fadeOutAudio(): void {
  const audio = document.getElementById("bg-music") as HTMLAudioElement | null;
  if (!audio || audio.paused) return;

  const windowAny = window as ExtendedWindow;
  if (windowAny.__audioFadeInterval) {
    clearInterval(windowAny.__audioFadeInterval);
  }

  const steps = 20;
  const stepTime = 50; // 50ms * 20 steps = 1000ms
  const volumeStep = audio.volume / steps;

  windowAny.__audioFadeInterval = window.setInterval(() => {
    if (audio.volume - volumeStep > 0.01) {
      audio.volume -= volumeStep;
    } else {
      audio.pause();
      audio.volume = 0.5; // Reset volume for next play
      clearInterval(windowAny.__audioFadeInterval);
      windowAny.__audioFadeInterval = undefined;
    }
  }, stepTime);
}

/**
 * Fade in audio to 0.5 volume over 1 second
 */
export function fadeInAudio(): void {
  const audio = document.getElementById("bg-music") as HTMLAudioElement | null;
  if (!audio) return;

  const windowAny = window as ExtendedWindow;
  if (windowAny.__audioFadeInterval) {
    clearInterval(windowAny.__audioFadeInterval);
  }

  if (audio.paused) {
    audio.volume = 0;
    audio.play().catch(e => console.error("Audio play failed:", e));
  }

  const targetVolume = 0.5;
  const steps = 20;
  const stepTime = 50; // 50ms * 20 steps = 1000ms
  const volumeStep = targetVolume / steps;

  windowAny.__audioFadeInterval = window.setInterval(() => {
    if (audio.volume + volumeStep < targetVolume - 0.01) {
      audio.volume += volumeStep;
    } else {
      audio.volume = targetVolume;
      clearInterval(windowAny.__audioFadeInterval);
      windowAny.__audioFadeInterval = undefined;
    }
  }, stepTime);
}