"use client";

import { useEffect, useRef } from "react";
import { isSoundEnabled, subscribeSound } from "@/lib/sound";

export default function QuoteBreakSound({ src = "/assets/sound/freedom-chain-break.mp3" }: { src?: string }) {
  const audio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const sound = new Audio(src);
    sound.preload = "auto";
    sound.volume = 0.25;
    audio.current = sound;
    const unsubscribe = subscribeSound(() => { if (!isSoundEnabled()) sound.pause(); });
    return () => { unsubscribe(); sound.pause(); audio.current = null; };
  }, [src]);

  return <span className="quote-break-sound-cue" aria-hidden="true" onAnimationStart={event => {
    if (event.animationName !== "quote-break-sound-cue" || event.currentTarget.closest(".reveal-restored") || document.hidden || !isSoundEnabled()) return;
    const rect = event.currentTarget.parentElement?.getBoundingClientRect();
    if (!rect || rect.bottom <= 0 || rect.top >= window.innerHeight) return;
    const sound = audio.current;
    if (!sound) return;
    sound.currentTime = 0;
    void sound.play().catch(() => {});
  }} />;
}
