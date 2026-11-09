"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export default function Character() {
  const frame = useRef<HTMLDivElement>(null);
  const [look, setLook] = useState({ x: 0, y: 0 });
  const [blinking, setBlinking] = useState(false);
  const [greeting, setGreeting] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [breeze, setBreeze] = useState(false);
  const [curious, setCurious] = useState(false);
  const greetingActive = useRef(false);
  const lastTouchLook = useRef<{ x: number; y: number } | null>(null);
  const greetingTimers = useRef<number[]>([]);
  const windAudio = useRef<HTMLAudioElement | null>(null);
  const landingAudio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio("/assets/sound/character-breeze-soft.mp3");
    audio.preload = "auto";
    audio.volume = .3;
    windAudio.current = audio;
    const landing = new Audio("/assets/sound/character-straw-landing.mp3");
    landing.preload = "auto";
    landing.volume = .25;
    landingAudio.current = landing;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let timer = 0;
    let reopen = 0;
    function blink() {
      if (!reduced.matches && !document.hidden && !greetingActive.current) {
        setBlinking(true);
        reopen = window.setTimeout(() => setBlinking(false), 150);
      }
      timer = window.setTimeout(blink, 3200 + Math.random() * 2200);
    }
    function move(event: PointerEvent) {
      if (!frame.current || reduced.matches || (greetingActive.current && event.pointerType !== "touch") || (event.pointerType === "touch" && event.type !== "pointerdown")) return;
      const rect = frame.current.getBoundingClientRect();
      const distanceX = Math.max(rect.left - event.clientX, 0, event.clientX - rect.right);
      const distanceY = Math.max(rect.top - event.clientY, 0, event.clientY - rect.bottom);
      if (event.pointerType !== "touch") setCurious(Math.hypot(distanceX, distanceY) < 80);
      const centerX = rect.left + rect.width * 0.43;
      const centerY = rect.top + rect.height * 0.61;
      const x = event.clientX - centerX;
      const y = event.clientY - centerY;
      const scale = rect.width / 140;
      const dx = x / Math.max((x < 0 ? centerX : window.innerWidth - centerX) * 0.4, 1);
      const dy = y / Math.max((y < 0 ? centerY : window.innerHeight - centerY) * 0.7, 1);
      const horizontal = Math.max(-1, Math.min(1, dx));
      const vertical = Math.max(-1, Math.min(1, dy));
      const nextLook = { x: (horizontal < 0 ? 1.8 : 1.5) * horizontal * scale, y: 0.65 * vertical * scale };
      if (event.pointerType === "touch") lastTouchLook.current = nextLook;
      else lastTouchLook.current = null;
      if (!greetingActive.current) setLook(nextLook);
    }
    function leave(event: PointerEvent) { if (event.pointerType !== "touch" && !greetingActive.current && !lastTouchLook.current) { setLook({ x: 0, y: 0 }); setCurious(false); } }
    function touch(event: PointerEvent) { if (event.pointerType === "touch") move(event); }
    timer = window.setTimeout(blink, 3200);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", touch, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    return () => { clearTimeout(timer); clearTimeout(reopen); greetingTimers.current.forEach(clearTimeout); audio.pause(); landing.pause(); windAudio.current = null; landingAudio.current = null; window.removeEventListener("pointermove", move); window.removeEventListener("pointerdown", touch); document.documentElement.removeEventListener("pointerleave", leave); };
  }, []);

  function greet(clientX?: number, clientY?: number) {
    if (greetingActive.current) return;
    greetingActive.current = true;
    const rect = frame.current?.getBoundingClientRect();
    const scale = rect ? rect.width / 140 : 1;
    const tapLook = rect && clientX !== undefined && clientY !== undefined
      ? { x: Math.max(-1.8, Math.min(1.5, (clientX - (rect.left + rect.width * .43)) / (rect.width * .2))) * scale, y: Math.max(-.65, Math.min(.65, (clientY - (rect.top + rect.height * .61)) / (rect.height * .3))) * scale }
      : { x: 0, y: 0 };
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduced && windAudio.current) {
      windAudio.current.currentTime = 0;
      void windAudio.current.play().catch(() => {});
    }
    if (!reduced && landingAudio.current) {
      landingAudio.current.currentTime = 0;
      void landingAudio.current.play().catch(() => {});
    }
    setGreeting(true);
    setLook({ x: 0, y: 0 });
    if (!reduced) {
      greetingTimers.current.push(window.setTimeout(() => { setBlinking(true); setLook({ x: 0, y: -.65 }); }, 550));
      greetingTimers.current.push(window.setTimeout(() => setBlinking(false), 1250));
    }
    greetingTimers.current.push(window.setTimeout(() => { setLook(lastTouchLook.current ?? tapLook); setSpeaking(true); }, reduced ? 0 : 1850));
    if (!reduced) {
      greetingTimers.current.push(window.setTimeout(() => { setSpeaking(false); setBreeze(true); setLook({ x: 0, y: -.65 }); setBlinking(true); }, 2750));
    }
    greetingTimers.current.push(window.setTimeout(() => { setGreeting(false); setSpeaking(false); setBreeze(false); setBlinking(false); setLook(lastTouchLook.current ?? { x: 0, y: 0 }); greetingActive.current = false; greetingTimers.current = []; }, reduced ? 1100 : 4050));
  }

  const eyeY = look.y > 0 ? look.y * 1.8 : look.y;
  const image = (src: string, className: string, style?: React.CSSProperties) => <Image src={`/assets/images/character/${src}`} alt="" fill sizes="140px" unoptimized className={className} style={style} />;
  return <div className="character-portrait">
  <div ref={frame} className={`hero-avatar character-lab-avatar${greeting ? " is-greeting" : ""}${speaking ? " is-speaking" : ""}${breeze ? " is-breeze" : ""}${curious && !greeting ? " is-curious" : ""}`} role="button" tabIndex={0} aria-label="Greet the character" onClick={event => { event.stopPropagation(); greet(event.detail ? event.clientX : undefined, event.detail ? event.clientY : undefined); }} onKeyDown={event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); greet(); } }}>
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
