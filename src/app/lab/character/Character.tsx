"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export default function Character() {
  const frame = useRef<HTMLDivElement>(null);
  const [look, setLook] = useState({ x: 0, y: 0 });
  const [blinking, setBlinking] = useState(false);
  const [curious, setCurious] = useState(false);
  const lastTouch = useRef<{ x: number; y: number } | null>(null);
  const [greeting, setGreeting] = useState(false);
  const active = useRef(false);
  const timers = useRef<number[]>([]);
  const [speaking, setSpeaking] = useState(false);
  const [breeze, setBreeze] = useState(false);
  const landing = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const audio = new Audio("/assets/sound/character-straw-landing.mp3");
    audio.preload = "auto"; audio.volume = .25; landing.current = audio;
    let blinkTimer = 0, reopen = 0;
    function blink() { if (!reduced.matches && !document.hidden && !active.current) { setBlinking(true); reopen = window.setTimeout(() => setBlinking(false), 150); } blinkTimer = window.setTimeout(blink, 3200 + Math.random() * 2200); }
    blinkTimer = window.setTimeout(blink, 3200);
    function move(event: PointerEvent) {
      if (!frame.current || reduced.matches || (active.current && event.pointerType !== "touch") || (event.pointerType === "touch" && event.type !== "pointerdown")) return;
      const rect = frame.current.getBoundingClientRect();
      const centerX = rect.left + rect.width * .43, centerY = rect.top + rect.height * .61;
      const x = event.clientX - centerX, y = event.clientY - centerY, scale = rect.width / 140;
      const dx = x / Math.max((x < 0 ? centerX : window.innerWidth - centerX) * .4, 1);
      const dy = y / Math.max((y < 0 ? centerY : window.innerHeight - centerY) * .7, 1);
      const horizontal = Math.max(-1, Math.min(1, dx)), vertical = Math.max(-1, Math.min(1, dy));
      const next = { x: (horizontal < 0 ? 1.8 : 1.5) * horizontal * scale, y: .65 * vertical * scale };
      const ex = Math.max(rect.left - event.clientX, 0, event.clientX - rect.right), ey = Math.max(rect.top - event.clientY, 0, event.clientY - rect.bottom);
      if (event.pointerType !== "touch") setCurious(Math.hypot(ex, ey) < 80);
      if (event.pointerType === "touch") lastTouch.current = next; else lastTouch.current = null;
      if (!active.current) setLook(next);
    }
    function leave(event: PointerEvent) { if (event.pointerType !== "touch" && !lastTouch.current) setLook({ x: 0, y: 0 }); }
    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    function touch(event: PointerEvent) { if (event.pointerType === "touch") move(event); }
    window.addEventListener("pointerdown", touch, { passive: true });
    return () => { window.removeEventListener("pointermove", move); document.documentElement.removeEventListener("pointerleave", leave); clearTimeout(blinkTimer); clearTimeout(reopen); window.removeEventListener("pointerdown", touch); timers.current.forEach(clearTimeout); audio.pause(); landing.current = null; };
  }, []);
  function greet() {
    if (active.current) return;
    active.current = true; setGreeting(true);
    if (landing.current) { landing.current.currentTime = 0; void landing.current.play().catch(() => {}); }
    timers.current.push(window.setTimeout(() => { setBlinking(true); setLook({ x: 0, y: -.65 }); }, 550));
    timers.current.push(window.setTimeout(() => setBlinking(false), 1250));
    timers.current.push(window.setTimeout(() => { setLook({ x: 0, y: 0 }); setSpeaking(true); }, 1850));
    timers.current.push(window.setTimeout(() => { setSpeaking(false); setBreeze(true); setBlinking(true); setLook({ x: 0, y: -.65 }); }, 2750));
    timers.current.push(window.setTimeout(() => { setGreeting(false); active.current = false; setSpeaking(false); setBreeze(false); setBlinking(false); setLook(lastTouch.current ?? { x: 0, y: 0 }); timers.current = []; }, 4050));
  }
  const eyeY = look.y > 0 ? look.y * 1.8 : look.y;
  const image = (src: string, className: string, style?: React.CSSProperties) => <Image src={`/assets/images/character/${src}`} alt="" fill sizes="140px" unoptimized className={className} style={style} />;
  return <div className="character-portrait"><div ref={frame} className={`hero-avatar character-lab-avatar${greeting ? " is-greeting" : ""}${speaking ? " is-speaking" : ""}${breeze ? " is-breeze" : ""}${curious && !greeting ? " is-curious" : ""}`} role="button" tabIndex={0} aria-label="Greet the character" onClick={event => { event.stopPropagation(); greet(); }} onKeyDown={event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); greet(); } }}>
    {image("body.png", "character-body")}
    {image("hand.png", "character-hand", { opacity: speaking ? 1 : 0 })}
    <div className="character-head">
    {image("straw-hat.png", "character-hat", { opacity: greeting ? 1 : 0 })}
    {image("head.png", "character-base")}
    {image("eyebrow.png", "character-eyebrow")}
    {image(speaking ? "yo-mouth.png" : "mouth-normal.png", "character-mouth")}
    {image("pupil.png", "character-eyes character-pupils", { transform: `translate(${look.x}px, ${eyeY}px) scaleY(${1 - Math.min(.12, Math.max(0, -look.y) * .18)})` })}
    {image("blink-cover.svg", "character-eyes character-blink-cover", { transform: `scaleY(${blinking ? 1 : 0})` })}
    {image("eyelid.png", "character-eyes character-upper-lid", { transform: `translateY(${eyeY + (blinking ? 2 : 0)}px)` })}
    {image("hair.png", "character-hair")}
    </div>
    {breeze && <svg className="character-wind" viewBox="0 0 140 140" aria-hidden="true"><path pathLength="1" d="M-12 35 C15 32 32 27 50 24 C67 21 72 27 69 31 C66 35 58 32 61 27 C65 20 80 19 97 17 C116 15 133 12 152 8" /></svg>}
  </div>
  {speaking && <span className="character-greeting" aria-hidden="true">yo!</span>}
  </div>;
}
