import { isSoundEnabled, subscribeSound } from "@/lib/sound";

type BannerSound = "water" | "fish" | "gull";

/** Short interaction sounds are created only after a visitor gesture. */
export function createBannerSounds() {
  let activated = false;
  let waterSample: HTMLAudioElement | undefined;
  let nextFishVariant = 0;
  const fishSamples: HTMLAudioElement[][] = [[], []];
  const gullSamples: HTMLAudioElement[] = [];
  const activate = () => { activated = true; };
  document.addEventListener("pointerdown", activate, { capture: true });
  document.addEventListener("keydown", activate, { capture: true });
  const unsubscribe = subscribeSound(() => {
    if (isSoundEnabled()) return;
    waterSample?.pause();
    for (const group of fishSamples) for (const sample of group) sample.pause();
    for (const sample of gullSamples) sample.pause();
  });

  return {
    prepareFish() {
      if (!isSoundEnabled()) return;
      try {
        fishSamples.forEach((group, index) => {
          while (group.length < 2) {
            const sample = new Audio(`/assets/sound/banner-fish${index ? "-alt" : ""}.mp3`);
            sample.preload = "auto";
            sample.load();
            group.push(sample);
          }
        });
      } catch { /* Audio is optional when playback is unavailable. */ }
    },
    prepareGull() {
      if (!isSoundEnabled()) return;
      try {
        while (gullSamples.length < 2) {
          const sample = new Audio("/assets/sound/banner-gull.mp3");
          sample.preload = "auto";
          sample.load();
          gullSamples.push(sample);
        }
      } catch { /* Audio is optional when playback is unavailable. */ }
    },
    play(kind: BannerSound) {
      if (!isSoundEnabled()) return;
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
        } else if (kind === "fish") {
          const variant = nextFishVariant++ % fishSamples.length;
          const group = fishSamples[variant];
          const available = group.find(audio => audio.paused || audio.ended);
          if (available) sample = available;
          else if (group.length < 2) {
            sample = new Audio(`/assets/sound/banner-fish${variant ? "-alt" : ""}.mp3`);
            group.push(sample);
          } else return;
        } else {
          sample = waterSample ?? new Audio("/assets/sound/banner-water.mp3");
          waterSample = sample;
        }
        sample.volume = kind === "fish" ? .14 : .25;
        sample.currentTime = 0;
        void sample.play().catch(() => {});
      } catch { /* Audio is optional when playback is unavailable. */ }
    },
    dispose() {
      document.removeEventListener("pointerdown", activate, { capture: true });
      document.removeEventListener("keydown", activate, { capture: true });
      unsubscribe();
      waterSample?.pause();
      for (const group of fishSamples) for (const sample of group) sample.pause();
      for (const sample of gullSamples) sample.pause();
    },
  };
}
