"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Maximize2, Minimize2 } from "lucide-react";
import { attachWaterRipples } from "./waterRipples";

export default function Ocean() {
  const scene = useRef<HTMLElement>(null);
  const still = useRef<HTMLImageElement>(null);
  const ripples = useRef<HTMLCanvasElement>(null);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!still.current || !ripples.current) return;
    const water = attachWaterRipples(still.current, ripples.current, (active, available) => {
      setPlaying(active);
      setFailed(!available);
    });
    return water?.dispose;
  }, []);

  useEffect(() => {
    const section = scene.current;
    if (!section) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let visited = false;
    try { visited = sessionStorage.getItem("water-intro") === "seen"; } catch {}
    const settle = () => {
      section.dataset.arrival = "settled";
      try { sessionStorage.setItem("water-intro", "seen"); } catch {}
    };
    if (visited || reduced.matches || window.location.hash || window.scrollY > 20) settle();
    else section.dataset.arrival = "open";
    const timer = window.setTimeout(settle, 2200);
    window.addEventListener("wheel", settle, { once: true, passive: true });
    window.addEventListener("touchstart", settle, { once: true, passive: true });
    window.addEventListener("keydown", settle, { once: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener("wheel", settle);
      window.removeEventListener("touchstart", settle);
      window.removeEventListener("keydown", settle);
    };
  }, []);

  return (
    <section ref={scene} className={`water-stage${expanded ? " water-expanded" : ""}`} aria-label="Tidal inlet with interactive waves">
      <div
        className="water-frame"
        onContextMenu={(event) => event.preventDefault()}
        onDragStart={(event) => event.preventDefault()}
      >
        <Image
          ref={still}
          className="water-image"
          draggable={false}
          src={failed ? "/assets/water/tidal-inlet.webp" : "/assets/water/inlet-landscape.webp"}
          width={1600}
          height={640}
          alt="Gulls fly past wind-bent pines and a lighthouse. Beneath the waves, a school of silver fish swims between stands of kelp."
          preload
          unoptimized
        />
        <canvas ref={ripples} className="water-ripples" aria-hidden="true" />
        <div className="water-controls">
          {playing && <span>Move near a gull or tap a fish</span>}
          <div>
            <button onClick={() => setExpanded(!expanded)} aria-label={expanded ? "Minimize ocean banner" : "Expand ocean banner"}>{expanded ? <Minimize2 size={13} /> : <Maximize2 size={13} />}</button>
          </div>
        </div>
      </div>
    </section>
  );
}
