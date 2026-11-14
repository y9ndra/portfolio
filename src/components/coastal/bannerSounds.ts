type BannerSound = "water" | "fish" | "gull";

/** Short interaction sounds are created only after a visitor gesture. */
export function createBannerSounds() {
  let activated = false;
  const samples: Partial<Record<"water" | "fish", HTMLAudioElement>> = {};
  const gullSamples: HTMLAudioElement[] = [];
  const activate = () => { activated = true; };
  document.addEventListener("pointerdown", activate, { capture: true });
  document.addEventListener("keydown", activate, { capture: true });

  return {
    play(kind: BannerSound) {
      if (kind === "fish") return;
      if (!activated && !navigator.userActivation?.hasBeenActive) return;
      try {
        let sample: HTMLAudioElement;
        if (kind === "gull") {
          // Each gull can startle independently, including during another gull's sound.
          const available = gullSamples.find(audio => audio.paused || audio.ended);
          if (available) sample = available;
          else if (gullSamples.length < 2) {
            sample = new Audio("/assets/sound/banner-gull.mp3");
            gullSamples.push(sample);
          } else return;
        } else {
          sample = samples[kind] ?? new Audio(`/assets/sound/banner-${kind}.mp3`);
          samples[kind] = sample;
        }
        sample.volume = .25;
        sample.currentTime = 0;
        void sample.play().catch(() => {});
      } catch { /* Audio is optional when playback is unavailable. */ }
    },
    dispose() {
      document.removeEventListener("pointerdown", activate, { capture: true });
      document.removeEventListener("keydown", activate, { capture: true });
      for (const sample of Object.values(samples)) sample?.pause();
      for (const sample of gullSamples) sample.pause();
    },
  };
}
