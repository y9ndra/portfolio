"use client";

import Character from "@/app/lab/character/Character";
import WhisperDots from "@/app/lab/character/WhisperDots";
import "./welcome.css";

function TypedMessage({ text, delay }: { text: string; delay: number }) {
  return <span aria-label={text}>{Array.from(text, (letter, index) => <span key={index} aria-hidden="true" style={{ animationDelay: `${delay + index * .06}s` }}>{letter}</span>)}</span>;
}

export default function WelcomeEntry({ leaving, onSkip }: { leaving: boolean; onSkip: () => void }) {
  return <div className={`welcome-entry${leaving ? " is-leaving" : ""}`} aria-label="Welcome">
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
