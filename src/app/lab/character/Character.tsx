"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export default function Character() {
  const frame = useRef<HTMLDivElement>(null);
  const [look, setLook] = useState({ x: 0, y: 0 });
  const [blinking, setBlinking] = useState(false);
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let blinkTimer = 0, reopen = 0;
    function blink() { if (!reduced.matches && !document.hidden) { setBlinking(true); reopen = window.setTimeout(() => setBlinking(false), 150); } blinkTimer = window.setTimeout(blink, 3200 + Math.random() * 2200); }
    blinkTimer = window.setTimeout(blink, 3200);
    function move(event: PointerEvent) {
      if (!frame.current || reduced.matches || event.pointerType === "touch") return;
      const rect = frame.current.getBoundingClientRect();
      const centerX = rect.left + rect.width * .43, centerY = rect.top + rect.height * .61;
      const x = event.clientX - centerX, y = event.clientY - centerY, scale = rect.width / 140;
      const dx = x / Math.max((x < 0 ? centerX : window.innerWidth - centerX) * .4, 1);
      const dy = y / Math.max((y < 0 ? centerY : window.innerHeight - centerY) * .7, 1);
      const horizontal = Math.max(-1, Math.min(1, dx)), vertical = Math.max(-1, Math.min(1, dy));
      const next = { x: (horizontal < 0 ? 1.8 : 1.5) * horizontal * scale, y: .65 * vertical * scale };
      setLook(next);
    }
    function leave() { setLook({ x: 0, y: 0 }); }
    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    return () => { window.removeEventListener("pointermove", move); document.documentElement.removeEventListener("pointerleave", leave); clearTimeout(blinkTimer); clearTimeout(reopen); };
  }, []);
  const eyeY = look.y > 0 ? look.y * 1.8 : look.y;
  const image = (src: string, className: string, style?: React.CSSProperties) => <Image src={`/assets/images/character/${src}`} alt="" fill sizes="140px" unoptimized className={className} style={style} />;
  return <div className="character-portrait"><div ref={frame} className={`hero-avatar character-lab-avatar`} role="img" aria-label="Illustrated character">
    {image("body.png", "character-body")}
    <div className="character-head">
    {image("head.png", "character-base")}
    {image("eyebrow.png", "character-eyebrow")}
    {image("mouth-normal.png", "character-mouth")}
    {image("pupil.png", "character-eyes character-pupils", { transform: `translate(${look.x}px, ${eyeY}px) scaleY(${1 - Math.min(.12, Math.max(0, -look.y) * .18)})` })}
    {image("blink-cover.svg", "character-eyes character-blink-cover", { transform: `scaleY(${blinking ? 1 : 0})` })}
    {image("eyelid.png", "character-eyes character-upper-lid", { transform: `translateY(${eyeY + (blinking ? 2 : 0)}px)` })}
    {image("hair.png", "character-hair")}
    </div>
  </div>
  </div>;
}
