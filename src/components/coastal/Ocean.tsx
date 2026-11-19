"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Maximize2, Minimize2 } from "lucide-react";
import { attachWaterRipples, localSceneHour } from "./waterRipples";
import { inletLighting } from "./inletLighting";
import pocketInlet from "./inlet-pocket.webp";
import wideInlet from "./inlet-wide.webp";
import WelcomeEntry from "./WelcomeEntry";
import { isHomeReturnNavigation } from "@/lib/homeReturn";

// This module stays loaded during client-side navigation, but resets on a reload.
let homeVisitedInDocument = false;
let lastHomePosition: { top: number; section: string | null } | null = null;
const HOME_POSITION_KEY = "portfolio-home-position";

function readHomePosition() {
  try {
    const value = JSON.parse(sessionStorage.getItem(HOME_POSITION_KEY) || "null");
    if (value && typeof value.top === "number" && Number.isFinite(value.top) && value.top >= 0 &&
      (typeof value.section === "string" || value.section === null)) return value as { top: number; section: string | null };
  } catch { /* The page still works without storage. */ }
  return null;
}

function saveHomePosition() {
  try { if (lastHomePosition) sessionStorage.setItem(HOME_POSITION_KEY, JSON.stringify(lastHomePosition)); } catch { /* Storage is optional. */ }
}

export default function Ocean() {
  const stage = useRef<HTMLElement>(null);
  const wheelUntil = useRef(-Infinity);
  const still = useRef<HTMLImageElement>(null);
  const ripples = useRef<HTMLCanvasElement>(null);
  const waterScene = useRef<ReturnType<typeof attachWaterRipples> | null>(null);
  const [playing, setPlaying] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const [introFinished, setIntroFinished] = useState(false);
  const [welcomeReady, setWelcomeReady] = useState(false);
  const [intro, setIntro] = useState<"pending" | "playing" | "leaving" | "done">("pending");
  const [phase, setPhase] = useState<"open" | "settling" | "settled">("open");
  const [restoring, setRestoring] = useState(false);
  const [returnVisit, setReturnVisit] = useState(false);
  const [entryHintDismissed, setEntryHintDismissed] = useState(false);
  const [wildlifeHintDismissed, setWildlifeHintDismissed] = useState(false);
  const expanded = phase === "open";

  useEffect(() => {
    let restoreFrame = 0;
    let restoreTimer = 0;
    let finalRestoreTimer = 0;
    const cancelRestore = () => {
      clearTimeout(restoreTimer);
      clearTimeout(finalRestoreTimer);
      setRestoring(false);
    };
    const frame = requestAnimationFrame(() => {
      const returning = homeVisitedInDocument || isHomeReturnNavigation();
      homeVisitedInDocument = true;
      if (returning && !lastHomePosition) lastHomePosition = readHomePosition();
      if (!returning) {
        lastHomePosition = null;
        try { sessionStorage.removeItem(HOME_POSITION_KEY); } catch { /* Storage is optional. */ }
      }
      if (returning) setReturnVisit(true);
      if (returning || window.location.hash || window.matchMedia("(prefers-reduced-motion: reduce)").matches) setIntro("done");
      else setIntro("playing");

      const hash = window.location.hash.slice(1);
      const saved = returning && lastHomePosition && (!hash || hash === lastHomePosition.section) ? lastHomePosition : null;
      if (saved) {
        setRestoring(true);
        setPhase("settled");
        restoreFrame = requestAnimationFrame(() => {
          window.scrollTo({ top: saved.top, behavior: "instant" });
          // Next can apply its own hash scroll after the home page mounts.
          restoreTimer = window.setTimeout(() => window.scrollTo({ top: saved.top, behavior: "instant" }), 200);
          finalRestoreTimer = window.setTimeout(() => {
            window.scrollTo({ top: saved.top, behavior: "instant" });
            setRestoring(false);
          }, 950);
          window.addEventListener("wheel", cancelRestore, { once: true, passive: true });
          window.addEventListener("touchstart", cancelRestore, { once: true, passive: true });
          window.addEventListener("pointerdown", cancelRestore, { once: true, passive: true });
          window.addEventListener("keydown", cancelRestore, { once: true });
        });
      } else if (hash) {
        setPhase("settled");
        restoreFrame = requestAnimationFrame(() => document.getElementById(hash)?.scrollIntoView({ behavior: "instant" }));
      } else if (returning) {
        // A direct visit to a detail page has no saved home position. The
        // portfolio must still open so its sections can render on return.
        setRestoring(true);
        setPhase("settled");
        restoreTimer = window.setTimeout(() => setRestoring(false), 200);
      } else {
        window.scrollTo({ top: 0, behavior: "instant" });
      }
    });
    return () => {
      cancelAnimationFrame(frame); cancelAnimationFrame(restoreFrame); clearTimeout(restoreTimer); clearTimeout(finalRestoreTimer);
      window.removeEventListener("wheel", cancelRestore); window.removeEventListener("touchstart", cancelRestore);
      window.removeEventListener("pointerdown", cancelRestore); window.removeEventListener("keydown", cancelRestore);
    };
  }, []);

  useEffect(() => {
    if (intro !== "playing" || !welcomeReady) return;
    const timer = window.setTimeout(() => setIntroFinished(true), 6200);
    return () => clearTimeout(timer);
  }, [intro, welcomeReady]);

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
    if (!open) setEntryHintDismissed(true);
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
      void image.decode().catch(() => {}).then(() => { if (mounted) setSceneReady(true); });
    };
    const water = attachWaterRipples(image, ripples.current, (active, available) => {
      setPlaying(active);
      if (active) setSceneReady(true);
      else if (!available) fallback();
    }, localSceneHour, true, { lighting: inletLighting, extendedPoster: true });
    waterScene.current = water;
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
      waterScene.current = null;
      water.dispose();
    };
  }, []);

  useEffect(() => {
    waterScene.current?.setPaused(intro === "pending" || intro === "playing");
  }, [intro]);

  useEffect(() => {
    if (phase !== "settled" || intro !== "done" || restoring) return;
    let navigating = false;
    let navigationTimer = 0;
    let saveTimer = 0;
    const remember = () => {
      if (navigating || window.location.pathname !== "/") return;
      const focusLine = window.innerHeight * .35;
      const sections = Array.from(document.querySelectorAll<HTMLElement>("main section[id]"));
      const section = sections.find(element => {
        const rect = element.getBoundingClientRect();
        return rect.top <= focusLine && rect.bottom > focusLine;
      });
      lastHomePosition = { top: window.scrollY, section: section?.id ?? null };
      clearTimeout(saveTimer);
      saveTimer = window.setTimeout(saveHomePosition, 150);
    };
    const rememberDeparture = (event: MouseEvent) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || !(event.target instanceof Element)) return;
      const link = event.target.closest<HTMLAnchorElement>('a[href^="/projects"], a[href^="/blog/"]');
      const card = event.target.closest(".project-circle-card.front");
      if ((!link || link.target === "_blank") && (!card || event.target.closest("a, button"))) return;
      remember();
      const section = event.target.closest<HTMLElement>("section[id]");
      lastHomePosition = { top: window.scrollY, section: section?.id ?? lastHomePosition?.section ?? null };
      clearTimeout(saveTimer);
      saveHomePosition();
      navigating = true;
      navigationTimer = window.setTimeout(() => { navigating = false; }, 1500);
    };
    remember();
    window.addEventListener("scroll", remember, { passive: true });
    document.addEventListener("click", rememberDeparture, true);
    return () => { clearTimeout(navigationTimer); clearTimeout(saveTimer); saveHomePosition(); window.removeEventListener("scroll", remember); document.removeEventListener("click", rememberDeparture, true); };
  }, [phase, intro, restoring]);

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
      if (expanded && dy < 0 && event.cancelable) event.preventDefault();
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
    <section ref={stage} data-phase={phase} className={`water-stage${expanded ? " water-expanded" : ""}${restoring ? " water-returning" : ""}${returnVisit ? " water-revisited" : ""}`} aria-label="Tidal inlet with interactive waves">
      {intro === "pending" ? <div className="welcome-entry" aria-hidden="true" /> : intro !== "done" && <WelcomeEntry leaving={intro === "leaving"} onSkip={() => setIntro("leaving")} onReady={setWelcomeReady} />}
      <div
        className="water-frame"
        onContextMenu={(event) => event.preventDefault()}
        onDragStart={(event) => event.preventDefault()}
        onPointerDown={(event) => {
          if (event.target instanceof Element && !event.target.closest("button")) setWildlifeHintDismissed(true);
        }}
      >
        <div className="water-scene">
          <picture>
          <source media="(max-width: 600px)" srcSet={pocketInlet.src} />
          <Image
            ref={still}
            className="water-image"
            draggable={false}
            src={wideInlet}
            alt="Gulls fly past wind-bent pines and a lighthouse. Beneath the waves, a school of silver fish swims between stands of kelp."
            preload
            unoptimized
          />
          </picture>
          <canvas ref={ripples} className="water-ripples" aria-hidden="true" />
        </div>
        <div className="water-controls">
          {phase !== "settled" ? <span className={`water-intro-hint${entryHintDismissed ? " is-dismissed" : ""}`} aria-hidden={entryHintDismissed}>Scroll to enter</span> : playing && <span className={wildlifeHintDismissed ? "is-dismissed" : undefined} aria-hidden={wildlifeHintDismissed}><span className="water-mouse-hint">Move near a gull or tap a fish</span><span className="water-touch-hint">Tap a gull or fish</span></span>}
          <div>
            <button disabled={phase === "settling"} onClick={() => change(!expanded)} aria-label={expanded ? "Enter portfolio" : "Expand ocean banner"}>{expanded ? <Minimize2 size={13} /> : <Maximize2 size={13} />}</button>
          </div>
        </div>
      </div>
    </section>
  );
}
