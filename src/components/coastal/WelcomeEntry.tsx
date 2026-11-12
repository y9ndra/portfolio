"use client";

import { useEffect, useState } from "react";
import Character from "@/components/character/Character";
import WhisperDots from "@/components/character/WhisperDots";
import "./welcome.css";

function TypedMessage({ text, delay }: { text: string; delay: number }) {
  return <span aria-label={text}>{Array.from(text, (letter, index) => <span key={index} aria-hidden="true" style={{ animationDelay: `${delay + index * .06}s` }}>{letter}</span>)}</span>;
}

export default function WelcomeEntry({ leaving, onSkip, onReady }: { leaving: boolean; onSkip: () => void; onReady: (ready: boolean) => void }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let active = true;
    const hand = new window.Image();
    hand.src = "/assets/images/character/hand.png";
    let finished = false;
    const finish = () => {
      if (active && !finished) { finished = true; clearTimeout(timeout); setReady(true); onReady(true); }
    };
    // Keep the greeting in sync with its hand layer on an uncached visit.
    const timeout = window.setTimeout(finish, 8000);
    void hand.decode().then(finish, finish);
    return () => { active = false; clearTimeout(timeout); };
  }, [onReady]);
  return <div className={`welcome-entry${ready ? " is-ready" : ""}${leaving ? " is-leaving" : ""}`} aria-label="Welcome">
    <div className="welcome-character-wrap">
      <div className="welcome-character" inert><Character trackPointer={false} previewWhistle /></div>
      <span className="welcome-dot-anchor welcome-dot-first" aria-hidden="true"><WhisperDots /></span>
      <span className="welcome-message welcome-first"><TypedMessage text="Whoa, hey!" delay={2.45} /></span>
      <span className="welcome-dot-anchor welcome-dot-second" aria-hidden="true"><WhisperDots /></span>
      <span className="welcome-message welcome-second"><TypedMessage text="Glad you’re here!" delay={4.12} /></span>
      <span className="welcome-notes" aria-hidden="true"><i>♪</i><i>♫</i><i>♪</i></span>
    </div>
    <button type="button" className="welcome-skip" onClick={onSkip} aria-label="Skip intro">Skip</button>
  </div>;
}
