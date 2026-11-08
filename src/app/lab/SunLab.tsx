"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { attachWaterRipples, localSceneHour } from "@/components/coastal/waterRipples";
import "./sun-lab.css";

function formatTime(hour: number) {
  const minutes = Math.round(hour * 60) % 1440;
  const h = Math.floor(minutes / 60);
  return `${h % 12 || 12}:${String(minutes % 60).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}

export default function SunLab() {
  const still = useRef<HTMLImageElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const override = useRef<number | null>(null);
  const water = useRef<ReturnType<typeof attachWaterRipples>>(undefined);
  const [preview, setPreview] = useState<number | null>(null);
  const [clock, setClock] = useState<number | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!still.current || !canvas.current) return;
    const scene = attachWaterRipples(still.current, canvas.current, (_, available) => setFailed(!available), () => override.current ?? localSceneHour());
    water.current = scene;
    const refresh = () => {
      setClock(localSceneHour());
      scene?.refresh();
    };
    const frame = requestAnimationFrame(refresh);
    const timer = window.setInterval(refresh, 30000);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      cancelAnimationFrame(frame);
      clearInterval(timer);
      document.removeEventListener("visibilitychange", refresh);
      water.current = undefined;
      scene?.dispose();
    };
  }, []);

  function choose(hour: number | null) {
    override.current = hour;
    setPreview(hour);
    water.current?.refresh();
  }

  const time = preview ?? clock;
  return <main className="sun-lab">
    <Link href="/">← Portfolio</Link>
    <h1>Sun and moon over the inlet</h1>
    <div className="water-frame sun-lab-frame" onDragStart={event => event.preventDefault()} onContextMenu={event => event.preventDefault()}>
      <Image ref={still} className="water-image" src="/assets/water/inlet-unlit.webp" width={1600} height={640} alt="An inlet with a lighthouse and fish beneath the water" draggable={false} preload unoptimized />
      <canvas ref={canvas} className="water-ripples" aria-hidden="true" />
    </div>
    <div className="sun-lab-controls">
      <div><strong>{time === null ? "Local time" : formatTime(time)}</strong> <span>{preview === null ? "· Your local time" : "· Preview"}</span></div>
      <label htmlFor="sun-time">Preview a time of day</label>
      <input id="sun-time" type="range" min="0" max="1439" step="1" value={Math.round((time ?? 12) * 60)} onChange={event => choose(Number(event.target.value) / 60)} />
      <div className="sun-lab-times"><span>12 AM</span><span>6 AM</span><span>12 PM</span><span>6 PM</span><span>11:59 PM</span></div>
      <button disabled={preview === null} onClick={() => choose(null)}>Use local time</button>
      {time !== null && (time < 6 || time >= 18) && <p>The moon travels across the night sky.</p>}
      {failed && <p>The animated preview is unavailable in this browser.</p>}
    </div>
  </main>;
}
