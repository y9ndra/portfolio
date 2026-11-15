"use client";

import { useEffect, useRef } from "react";
import { isSoundEnabled, subscribeSound } from "@/lib/sound";

export default function ClickSound() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Instantiate Audio on the client-side
    audioRef.current = new Audio("/assets/sound/clicksoundv2.mp3");
    
    const playClick = (event: MouseEvent) => {
      const target = event.target;
      if (!isSoundEnabled() || (target instanceof Element && target.closest("[data-sound-toggle]"))) return;
      if (target instanceof Element && target.closest(".water-frame") && !target.closest("button")) return;
      const audio = audioRef.current;
      if (!audio) return;
      
      try {
        // Reset playback position so rapid clicks play from the beginning
        audio.currentTime = 0;
        audio.play().catch(() => {
          // Silent catch for autoplay/interaction blocking policy
        });
      } catch {
        // Catch any other unexpected audio context errors
      }
    };

    const unsubscribe = subscribeSound(() => { if (!isSoundEnabled()) audioRef.current?.pause(); });
    window.addEventListener("click", playClick);
    return () => {
      window.removeEventListener("click", playClick);
      unsubscribe();
    };
  }, []);

  return null;
}
