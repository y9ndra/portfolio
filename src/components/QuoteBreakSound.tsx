"use client";

import { useEffect, useRef } from "react";
import { isSoundEnabled, subscribeSound } from "@/lib/sound";

export default function QuoteBreakSound({ src = "/assets/sound/freedom-chain-break.mp3" }: { src?: string }) {
  const audio = useRef<HTMLAudioElement | null>(null);
  const cueStarted = useRef(false);

  useEffect(() => {
    const sound = new Audio(src);
    sound.preload = "auto";
    sound.volume = 0.25;
    sound.load();
    audio.current = sound;
    cueStarted.current = false;
    let primed = false;
    let priming = false;
    let disposed = false;
    const prime = () => {
      if (primed || priming || cueStarted.current || !isSoundEnabled()) return;
      priming = true;
      sound.volume = 0;
      void sound.play().then(() => {
        if (disposed) return;
        primed = true;
        if (!cueStarted.current) { sound.pause(); sound.currentTime = 0; }
        sound.volume = .25;
      }).catch(() => { if (!disposed) sound.volume = .25; }).finally(() => { priming = false; });
    };
    window.addEventListener("pointerdown", prime, { capture: true, passive: true });
    window.addEventListener("touchend", prime, { capture: true, passive: true });
    window.addEventListener("keydown", prime, { capture: true });
    window.addEventListener("click", prime, { capture: true });
    const unsubscribe = subscribeSound(() => { if (!isSoundEnabled()) sound.pause(); });
    return () => {
      disposed = true;
      unsubscribe(); sound.pause(); audio.current = null;
      window.removeEventListener("pointerdown", prime, true);
      window.removeEventListener("touchend", prime, true);
      window.removeEventListener("keydown", prime, true);
      window.removeEventListener("click", prime, true);
    };
  }, [src]);

  return <span className="quote-break-sound-cue" aria-hidden="true" onAnimationStart={event => {
    if (event.animationName !== "quote-break-sound-cue" || event.currentTarget.closest(".reveal-restored") || document.hidden || !isSoundEnabled()) return;
    const rect = event.currentTarget.parentElement?.getBoundingClientRect();
    if (!rect || rect.bottom <= 0 || rect.top >= window.innerHeight) return;
    const sound = audio.current;
    if (!sound) return;
    cueStarted.current = true;
    sound.volume = .25;
    sound.currentTime = 0;
    void sound.play().catch(() => {});
  }} />;
}
