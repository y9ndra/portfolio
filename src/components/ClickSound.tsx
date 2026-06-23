"use client";

import { useEffect, useRef } from "react";

export default function ClickSound() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Instantiate Audio on the client-side
    audioRef.current = new Audio("/assets/sound/clicksoundv2.wav");
    
    const playClick = () => {
      const audio = audioRef.current;
      if (!audio) return;
      
      try {
        // Reset playback position so rapid clicks play from the beginning
        audio.currentTime = 0;
        audio.play().catch(() => {
          // Silent catch for autoplay/interaction blocking policy
        });
      } catch (e) {
        // Catch any other unexpected audio context errors
      }
    };

    window.addEventListener("click", playClick);
    return () => {
      window.removeEventListener("click", playClick);
    };
  }, []);

  return null;
}
