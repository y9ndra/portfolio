"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { PERSONAL } from "@/data/portfolio";
import Character from "./Character";

export default function ProfileSwitch() {
  const [animated, setAnimated] = useState(true);
  const [mounted, setMounted] = useState(true);
  const [photoError, setPhotoError] = useState(false);
  const timer = useRef(0);
  const frame = useRef(0);
  useEffect(() => () => { clearTimeout(timer.current); cancelAnimationFrame(frame.current); }, []);
  function toggle() {
    clearTimeout(timer.current);
    cancelAnimationFrame(frame.current);
    if (animated) {
      setAnimated(false);
      timer.current = window.setTimeout(() => setMounted(false), 500);
    } else {
      setMounted(true);
      frame.current = requestAnimationFrame(() => setAnimated(true));
    }
  }
  return <div className="character-switch">
    <div className={`character-switch-layer character-switch-photo${animated ? "" : " is-visible"}`} aria-hidden={animated}>
      <div className="hero-avatar character-lab-avatar character-static">{photoError ? <div className="hero-avatar-fallback">YE</div> : <Image src={PERSONAL.avatar} alt={animated ? "" : "Yugendhra E"} fill sizes="(max-width: 480px) 100px, (max-width: 640px) 110px, 140px" unoptimized onError={() => setPhotoError(true)} />}</div>
    </div>
    <div className={`character-switch-layer character-switch-animated${animated ? " is-visible" : ""}`} aria-hidden={!animated} inert={!animated}>
      {mounted && <Character />}
    </div>
    <button type="button" className="character-switch-button" onClick={event => { event.stopPropagation(); toggle(); }} aria-label={animated ? "Show photo" : "Show animated character"} title={animated ? "Show photo" : "Show animated character"}>
      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 7h14m0 0-3-3m3 3-3 3M20 17H6m0 0 3-3m-3 3 3 3" /></svg>
    </button>
  </div>;
}
