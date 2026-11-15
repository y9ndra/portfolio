"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import QuoteSection from "@/components/QuoteSection";
import { isSoundEnabled, setSoundEnabled, subscribeSound } from "@/lib/sound";
import "./freedom-sounds.css";

const options = [
  { id: "current", name: "Previous chain", detail: "The earlier short chain sound.", src: "/assets/sound/freedom-lab-previous.mp3" },
  { id: "links", name: "Loose links", detail: "The quick rattle of real chain links now used on the page.", src: "/assets/sound/freedom-chain-break.mp3" },
  { id: "quick-links", name: "Quick links", detail: "The Loose Links sound, shortened and sped up.", src: "/assets/sound/freedom-lab-quick-links.mp3" },
  { id: "chain-tumble", name: "Chain tumble", detail: "A short movement from a larger chain recording.", src: "/assets/sound/freedom-lab-chain-tumble.mp3" },
  { id: "loose-rattle", name: "Loose rattle", detail: "Another quick set of links rattling together.", src: "/assets/sound/freedom-lab-loose-rattle.mp3" },
  { id: "short-link", name: "Short link", detail: "A brief metallic movement from the same chain.", src: "/assets/sound/freedom-lab-short-link.mp3" },
  { id: "deep-link", name: "Deep link", detail: "A lower-pitched chain clink with a short tail.", src: "/assets/sound/freedom-lab-deep-link.mp3" },
  { id: "low-clink", name: "Low clink", detail: "A different, compact clink from the lower-pitched chain.", src: "/assets/sound/freedom-lab-low-clink.mp3" },
  { id: "clink", name: "Small chain", detail: "A lighter metallic clink and movement.", src: "/assets/sound/freedom-lab-small-chain.mp3" },
  { id: "break", name: "Metal break", detail: "A short, rougher metallic fracture.", src: "/assets/sound/freedom-lab-metal-break.mp3" },
  { id: "impact", name: "Broken metal", detail: "A heavier impact with a metallic tail.", src: "/assets/sound/freedom-lab-impact.mp3" },
  { id: "shatter", name: "Sharp release", detail: "A crisp, quick shattering sound.", src: "/assets/sound/freedom-lab-shatter.mp3" },
];

export default function FreedomSoundsLab() {
  const sample = useRef<HTMLAudioElement | null>(null);
  const previewArea = useRef<HTMLDivElement | null>(null);
  const [choice, setChoice] = useState(options[0]);
  const [version, setVersion] = useState(0);
  const [muted, setMuted] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const sync = () => { setMuted(!isSoundEnabled()); if (!isSoundEnabled()) sample.current?.pause(); };
    sync();
    const unsubscribe = subscribeSound(sync);
    return () => { unsubscribe(); sample.current?.pause(); };
  }, []);

  function listen(option: typeof options[number]) {
    setError(false);
    if (!isSoundEnabled()) { setMuted(true); return; }
    sample.current?.pause();
    const audio = new Audio(option.src);
    audio.volume = .25;
    sample.current = audio;
    void audio.play().catch(() => setError(true));
  }

  function preview(option: typeof options[number]) {
    if (!isSoundEnabled()) { setMuted(true); return; }
    sample.current?.pause();
    setChoice(option);
    setVersion(value => value + 1);
    previewArea.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  return <main className="freedom-sounds-lab">
    <Link className="freedom-lab-back" href="/lab">← Back to lab</Link>
    <header className="freedom-lab-heading"><span>SOUND LAB / FREEDOM</span><h1>Find the right break.</h1><p>Listen to each sound on its own, or play it with the quote to see how it feels.</p></header>
    {muted && <div className="freedom-lab-notice">Sound is muted. <button onClick={() => setSoundEnabled(true)}>Turn sound on</button></div>}
    {error && <p role="alert" className="freedom-lab-notice">The sound could not be played. Please try again.</p>}
    <div className="freedom-lab-options">{options.map((option, index) => <article className="freedom-lab-option" key={option.id}>
      <span className="freedom-lab-index">{String(index + 1).padStart(2, "0")}</span>
      <div><h2>{option.name}</h2><p>{option.detail}</p></div>
      <div className="freedom-lab-actions"><button onClick={event => { event.stopPropagation(); listen(option); }}>Listen</button><button onClick={event => { event.stopPropagation(); preview(option); }}>Preview quote ↗</button></div>
    </article>)}</div>
    <div className="freedom-lab-preview" ref={previewArea} aria-live="polite"><div className="freedom-lab-preview-heading"><span>QUOTE PREVIEW {version > 0 && ` / ${choice.name.toUpperCase()}`}</span>{version > 0 && <button onClick={event => { event.stopPropagation(); preview(choice); }}>Replay ↻</button>}</div>
      {version > 0 ? <QuoteSection key={version} soundSrc={choice.src} revealImmediately /> : <p>Choose “Preview quote” to watch the animation with a sound.</p>}
    </div>
  </main>;
}
