"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export default function Character() {
  const frame = useRef<HTMLDivElement>(null);
  const [look, setLook] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
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
    return () => { window.removeEventListener("pointermove", move); document.documentElement.removeEventListener("pointerleave", leave); };
  }, []);
  const eyeY = look.y;
  const image = (src: string, className: string, style?: React.CSSProperties) => <Image src={`/assets/images/character/${src}`} alt="" fill sizes="140px" unoptimized className={className} style={style} />;
  return <div className="character-portrait"><div ref={frame} className={`hero-avatar character-lab-avatar`} role="img" aria-label="Illustrated character">
    {image("body.png", "character-body")}
    <div className="character-head">
    {image("head.png", "character-base")}
    {image("eyebrow.png", "character-eyebrow")}
    {image("mouth-normal.png", "character-mouth")}
    {image("pupil.png", "character-eyes character-pupils", { transform: `translate(${look.x}px, ${eyeY}px)` })}
    {image("eyelid.png", "character-upper-lid")}
    {image("hair.png", "character-hair")}
    </div>
  </div>
  </div>;
}
