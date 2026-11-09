"use client";
import Image from "next/image";
import { useState } from "react";
import { PERSONAL } from "@/data/portfolio";
import Character from "./Character";
export default function ProfileSwitch() {
  const [animated, setAnimated] = useState(true);
  return <div className="character-switch">
    {animated ? <Character /> : <div className="hero-avatar character-lab-avatar character-static"><Image src={PERSONAL.avatar} alt="Yugendhra E" fill sizes="(max-width: 480px) 100px, (max-width: 640px) 110px, 140px" unoptimized /></div>}
    <button type="button" className="character-switch-button" onClick={event => { event.stopPropagation(); setAnimated(value => !value); }} aria-label={animated ? "Show photo" : "Show animated character"} title={animated ? "Show photo" : "Show animated character"}>
      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 7h14m0 0-3-3m3 3-3 3M20 17H6m0 0 3-3m-3 3 3 3" /></svg>
    </button>
  </div>;
}
