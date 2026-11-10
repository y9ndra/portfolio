"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Maximize2, Minimize2 } from "lucide-react";
import { attachWaterRipples, localSceneHour } from "./waterRipples";
import WelcomeEntry from "./WelcomeEntry";

export default function Ocean() {
  const stage = useRef<HTMLElement>(null);
  const wheelUntil = useRef(-Infinity);
  const still = useRef<HTMLImageElement>(null);
  const ripples = useRef<HTMLCanvasElement>(null);
  const [playing, setPlaying] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const [introFinished, setIntroFinished] = useState(false);
  const [intro, setIntro] = useState<"pending" | "playing" | "leaving" | "done">("pending");
  const [phase, setPhase] = useState<"open" | "settling" | "settled">("open");
  const expanded = phase === "open";

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (window.location.hash || window.matchMedia("(prefers-reduced-motion: reduce)").matches) setIntro("done");
      else setIntro("playing");
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (intro !== "playing") return;
    const timer = window.setTimeout(() => setIntroFinished(true), 6200);
    return () => clearTimeout(timer);
  }, [intro]);

  useEffect(() => {
    if (intro !== "playing" || !introFinished || !sceneReady) return;
    const frame = requestAnimationFrame(() => setIntro("leaving"));
    return () => cancelAnimationFrame(frame);
  }, [intro, introFinished, sceneReady]);

  useEffect(() => {
    if (intro !== "leaving") return;
    const timer = window.setTimeout(() => setIntro("done"), 800);
    return () => clearTimeout(timer);
  }, [intro]);

  function change(open: boolean) {
    window.scrollTo({ top: 0, behavior: "instant" });
    setPhase(open ? "open" : "settling");
  }

  useEffect(() => {
    if (phase !== "settling" || !stage.current) return;
    const banner = stage.current;
    let active = true;
    async function finish() {
      // Reading animations flushes pending styles, including reduced-motion rules.
      while (active) {
        const transitions = [...banner.getAnimations(), ...banner.querySelector(".water-frame")!.getAnimations()]
          .filter(animation => animation.pending || animation.playState === "running");
        if (!transitions.length) break;
        await Promise.allSettled(transitions.map(animation => animation.finished));
      }
      if (active) setPhase("settled");
    }
    const frame = requestAnimationFrame(finish);
    return () => { active = false; cancelAnimationFrame(frame); };
  }, [phase]);

  useEffect(() => {
    if (!still.current || !ripples.current) return;
    let mounted = true;
    const image = still.current;
    const fallback = () => {
      const extension = new window.Image();
      extension.src = "/assets/water/inlet-mobile.webp";
      void Promise.allSettled([image.decode(), extension.decode()]).then(() => { if (mounted) setSceneReady(true); });
    };
    const water = attachWaterRipples(image, ripples.current, (active, available) => {
      setPlaying(active);
      if (active) setSceneReady(true);
      else if (!available) fallback();
    }, localSceneHour);
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || connection?.saveData) fallback();
    const fallbackTimer = window.setTimeout(fallback, 12000);
    const limitTimer = window.setTimeout(() => setSceneReady(true), 18000);
    const refresh = () => { if (!document.hidden) water?.refresh(); };
    const timer = window.setInterval(refresh, 30000);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      mounted = false;
      clearTimeout(fallbackTimer);
      clearTimeout(limitTimer);
      clearInterval(timer);
      document.removeEventListener("visibilitychange", refresh);
      water?.dispose();
    };
  }, []);

  useEffect(() => {
    if (window.location.hash) {
      const frame = requestAnimationFrame(() => {
        setPhase("settled");
        requestAnimationFrame(() => document.getElementById(window.location.hash.slice(1))?.scrollIntoView({ behavior: "instant" }));
      });
      return () => cancelAnimationFrame(frame);
    }
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  useEffect(() => {
    if (phase === "settling" || intro !== "done") return;
    let lastWheel = -Infinity;
    let beganAtTop = false;
    let upwardDistance = 0;
    let consumed = false;
    let touchY = 0;
    let touchAtTop = false;

    function wheel(event: WheelEvent) {
      if (event.ctrlKey || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      if (event.timeStamp - lastWheel > 260) {
        beganAtTop = window.scrollY <= 0;
        upwardDistance = 0;
        consumed = false;
      }
      lastWheel = event.timeStamp;
      const open = event.deltaY < 0;
      if (!expanded && open && beganAtTop && window.scrollY <= 0) {
        event.preventDefault();
        const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1;
        upwardDistance += Math.min(100, -event.deltaY * unit);
      } else {
        upwardDistance = 0;
        if (window.scrollY > 0) beganAtTop = false;
      }
      if (event.timeStamp >= wheelUntil.current && !consumed && expanded !== open && (expanded || upwardDistance >= 160)) {
        event.preventDefault();
        consumed = true;
        wheelUntil.current = event.timeStamp + 180;
        change(open);
      } else if (consumed || event.timeStamp < wheelUntil.current) {
        event.preventDefault();
        wheelUntil.current = event.timeStamp + 180;
      }
    }
    function touchStart(event: TouchEvent) {
      touchY = event.touches[0].clientY;
      touchAtTop = window.scrollY <= 0;
    }
    function touchMove(event: TouchEvent) {
      if (event.touches.length !== 1) return;
      const dy = event.touches[0].clientY - touchY;
      if (!expanded && touchAtTop && dy > 0 && event.cancelable) event.preventDefault();
      if ((expanded && dy < -20) || (!expanded && touchAtTop && dy >= 90 && window.scrollY <= 0)) {
        if (event.cancelable) event.preventDefault();
        change(dy > 0);
      }
    }
    function key(event: KeyboardEvent) {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey ||
          (event.target as Element).closest("button, input, textarea, select, [contenteditable=true]")) return;
      const down = ["ArrowDown", "PageDown", " "].includes(event.key);
      const up = ["ArrowUp", "PageUp", "Home"].includes(event.key);
      if ((expanded && down) || (!expanded && up && !event.repeat && window.scrollY <= 0)) {
        event.preventDefault();
        change(up);
      }
    }
    window.addEventListener("wheel", wheel, { passive: false });
    window.addEventListener("touchstart", touchStart, { passive: true });
    window.addEventListener("touchmove", touchMove, { passive: false });
    window.addEventListener("keydown", key);
    return () => {
      window.removeEventListener("wheel", wheel);
      window.removeEventListener("touchstart", touchStart);
      window.removeEventListener("touchmove", touchMove);
      window.removeEventListener("keydown", key);
    };
  }, [expanded, phase, intro]);

  return (
    <section ref={stage} data-phase={phase} className={`water-stage${expanded ? " water-expanded" : ""}`} aria-label="Tidal inlet with interactive waves">
      {intro === "pending" ? <div className="welcome-entry" aria-hidden="true" /> : intro !== "done" && <WelcomeEntry leaving={intro === "leaving"} onSkip={() => setIntro("leaving")} />}
      <div
        className="water-frame"
        onContextMenu={(event) => event.preventDefault()}
        onDragStart={(event) => event.preventDefault()}
      >
        <div className="water-scene">
          <Image
            ref={still}
            className="water-image"
            draggable={false}
            src="/assets/water/inlet-unlit.webp"
            width={1600}
            height={640}
            alt="Gulls fly past wind-bent pines and a lighthouse. Beneath the waves, a school of silver fish swims between stands of kelp."
            preload
            unoptimized
          />
          <canvas ref={ripples} className="water-ripples" aria-hidden="true" />
        </div>
        <div className="water-controls">
          {expanded ? <span className="water-intro-hint">Scroll to enter</span> : playing && <span><span className="water-mouse-hint">Move near a gull or tap a fish</span><span className="water-touch-hint">Tap a gull or fish</span></span>}
          <div>
            <button disabled={phase === "settling"} onClick={() => change(!expanded)} aria-label={expanded ? "Enter portfolio" : "Expand ocean banner"}>{expanded ? <Minimize2 size={13} /> : <Maximize2 size={13} />}</button>
          </div>
        </div>
      </div>
    </section>
  );
}
