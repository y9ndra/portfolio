"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { isSoundEnabled, setSoundEnabled, subscribeSound } from "@/lib/sound";
import "./sounds.css";

type Option = { id: string; name: string; description: string; category: "fish" | "gull"; detail: string };
const options: Option[] = [
  { id: "fish-current", name: "Tail movement", description: "One of the short water sounds synchronized with the fish's tail.", category: "fish", detail: "CURRENT" },
  { id: "fish-lab-river-escape", name: "River escape", description: "A short, softened excerpt from your fish recording, timed to the escape.", category: "fish", detail: "YOUR RECORDING" },
  { id: "fish-lab-four-tailbeats", name: "Four tailbeats", description: "Four soft movements through the water as the fish darts away.", category: "fish", detail: "RECORDED / UNDERWATER" },
  { id: "fish-lab-dart", name: "Water dart", description: "A short, bright rush made from moving water.", category: "fish", detail: "RECORDED / QUICK" },
  { id: "fish-lab-swim", name: "Underwater dash", description: "A softer, lower swish as the fish swims away.", category: "fish", detail: "RECORDED / SOFT" },
  { id: "fish-lab-splash", name: "Fast splash", description: "A quick flick of water with a little splash.", category: "fish", detail: "RECORDED / CRISP" },
  { id: "fish-lab-bubbles", name: "Water trail", description: "A textured splash for a fish leaving a trail behind.", category: "fish", detail: "RECORDED / TEXTURED" },
  { id: "fish-dart", name: "Quick dart", description: "A short, smooth underwater rush as the fish darts away.", category: "fish", detail: "SWIFT / SOFT" },
  { id: "fish-tail", name: "Fast tailbeats", description: "A few quick pulses of water, like a tail picking up speed.", category: "fish", detail: "QUICK / RHYTHMIC" },
  { id: "fish-deep", name: "Deep escape", description: "A lower, muffled rush for a fish swimming farther underwater.", category: "fish", detail: "LOW / SUBMERGED" },
  { id: "fish-bubbles", name: "Dart and bubbles", description: "A quick rush through the water with a tiny bubble trail.", category: "fish", detail: "SWIFT / BUBBLY" },
  { id: "gull-current", name: "Recorded wingbeat", description: "The single wingbeat used in sync with the gull animation.", category: "gull", detail: "CURRENT" },
  { id: "gull-quick", name: "Quick takeoff", description: "Four shorter wingbeats for a startled departure.", category: "gull", detail: "QUICK / LIGHT" },
  { id: "gull-wide", name: "Broad wings", description: "Two slower, fuller wingbeats with a breath of air.", category: "gull", detail: "SOFT / AIRY" },
  { id: "gull-flutter", name: "Feather flutter", description: "A quiet flutter that builds and fades away.", category: "gull", detail: "LIGHT / TEXTURED" },
];

type AudioWindow = Window & { webkitAudioContext?: typeof AudioContext };

function makeNoise(ctx: AudioContext) {
  const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * .25), ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
}

export default function SoundLab() {
  const context = useRef<AudioContext | null>(null);
  const sample = useRef<HTMLAudioElement | null>(null);
  const activeNodes = useRef<AudioScheduledSourceNode[]>([]);
  const [playing, setPlaying] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [muted, setMuted] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
    sample.current?.pause();
    activeNodes.current.forEach(node => { try { node.stop(); } catch {} });
    if (context.current && context.current.state !== "closed") void context.current.close();
  }, []);

  useEffect(() => subscribeSound(() => {
    if (isSoundEnabled()) { setMuted(false); return; }
    sample.current?.pause();
    activeNodes.current.forEach(node => { try { node.stop(); } catch {} });
    activeNodes.current = [];
    setPlaying(null);
  }), []);

  function play(option: Option) {
    setError(false);
    if (!isSoundEnabled()) { setMuted(true); return; }
    if (timer.current) clearTimeout(timer.current);
    sample.current?.pause();
    activeNodes.current.forEach(node => { try { node.stop(); } catch {} });
    activeNodes.current = [];
    setPlaying(option.id);
    timer.current = setTimeout(() => setPlaying(null), option.id === "fish-lab-river-escape" ? 2100 : 1100);

    if (option.id === "fish-current" || option.id === "gull-current" || option.id.startsWith("fish-lab-")) {
      const file = option.id.startsWith("fish-lab-") ? option.id : `banner-${option.category}`;
      const audio = new Audio(`/assets/sound/${file}.mp3`);
      sample.current = audio;
      audio.volume = option.id === "fish-current" ? .14 : option.category === "fish" ? .3 : .25;
      void audio.play().catch(() => setError(true));
      return;
    }
    try {
      const Constructor = window.AudioContext || (window as AudioWindow).webkitAudioContext;
      if (!Constructor) { setError(true); return; }
      const ctx = context.current ?? new Constructor();
      context.current = ctx;
      if (ctx.state === "suspended") void ctx.resume();
      const now = ctx.currentTime + .01;
      if (option.category === "fish") {
        const buffer = makeNoise(ctx);
        const pulses = option.id === "fish-tail" ? [0, .085, .16, .23] : [0];
        for (const [i, offset] of pulses.entries()) {
          const source = ctx.createBufferSource();
          const filter = ctx.createBiquadFilter();
          const gain = ctx.createGain();
          const start = now + offset;
          const duration = option.id === "fish-tail" ? .10 : .23;
          const low = option.id === "fish-deep";
          source.buffer = buffer;
          filter.type = "lowpass";
          filter.frequency.setValueAtTime(low ? 450 : 950, start);
          filter.frequency.exponentialRampToValueAtTime(low ? 200 : 390, start + duration);
          gain.gain.setValueAtTime(.0001, start);
          gain.gain.exponentialRampToValueAtTime((low ? .055 : .045) * (1 - i * .13), start + .02);
          gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
          source.connect(filter).connect(gain).connect(ctx.destination);
          activeNodes.current.push(source);
          source.start(start); source.stop(start + duration);
        }
        if (option.id !== "fish-bubbles") return;
        [0.16, 0.27].forEach((offset, i) => {
          const oscillator = ctx.createOscillator();
          const gain = ctx.createGain();
          const start = now + offset;
          oscillator.type = "sine";
          oscillator.frequency.setValueAtTime(i ? 620 : 480, start);
          oscillator.frequency.exponentialRampToValueAtTime(i ? 820 : 650, start + .09);
          gain.gain.setValueAtTime(.0001, start);
          gain.gain.exponentialRampToValueAtTime(.018, start + .015);
          gain.gain.exponentialRampToValueAtTime(.0001, start + .11);
          oscillator.connect(gain).connect(ctx.destination);
          activeNodes.current.push(oscillator);
          oscillator.start(start); oscillator.stop(start + .12);
        });
        return;
      }
      const settings = option.id === "gull-quick" ? { count: 4, gap: .075, duration: .085, frequency: 1900, volume: .022 }
        : option.id === "gull-wide" ? { count: 2, gap: .19, duration: .19, frequency: 900, volume: .03 }
        : option.id === "gull-flutter" ? { count: 5, gap: .07, duration: .095, frequency: 2400, volume: .016 }
        : { count: 3, gap: .105, duration: .12, frequency: 1400, volume: .025 };
      const buffer = makeNoise(ctx);
      for (let i = 0; i < settings.count; i++) {
        const source = ctx.createBufferSource();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();
        const start = now + i * settings.gap;
        const intensity = option.id === "gull-flutter" ? 1 - Math.abs(i - 2) * .22 : 1;
        source.buffer = buffer;
        filter.type = "lowpass"; filter.frequency.value = settings.frequency;
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(settings.volume * intensity, start + .015);
        gain.gain.exponentialRampToValueAtTime(.0001, start + settings.duration);
        source.connect(filter).connect(gain).connect(ctx.destination);
        activeNodes.current.push(source);
        source.start(start); source.stop(start + settings.duration);
      }
    } catch { setError(true); }
  }

  return <main className="soundlab">
    <nav className="soundlab-nav"><Link href="/lab">← Banner lab</Link><Link href="/">Portfolio ↗</Link></nav>
    <header className="soundlab-intro"><p className="soundlab-kicker">THE INLET / SOUND LAB</p><h1>Little sounds,<br /><em>big difference.</em></h1><p>Choose how the fish and gulls react. Tap each sound to listen, then tell me which ones feel right.</p><span>BEST WITH SOUND ON · TAP TO PLAY</span></header>
    {error && <p role="alert" className="soundlab-error">The sound couldn&apos;t play. Check your device volume and try again.</p>}
    {muted && <p role="status" className="soundlab-error">Sound is muted. <button type="button" onClick={event => { event.stopPropagation(); setSoundEnabled(true); }}>Enable sound</button> to preview these clips.</p>}
    {(["fish", "gull"] as const).map((category, index) => <section className="soundlab-group" key={category}>
      <div className="soundlab-heading"><span>0{index + 1} / {category === "fish" ? "BELOW THE SURFACE" : "ABOVE THE WATER"}</span><h2>{category === "fish" ? "Fish" : "Gulls"}<sup>{String(options.filter(option => option.category === category).length).padStart(2, "0")}</sup></h2><p>{category === "fish" ? "A quick escape through the water." : "Wingbeats as they take flight."}</p></div>
      <div className="soundlab-grid">{options.filter(option => option.category === category).map((option, i) => <button type="button" className={`soundlab-option ${playing === option.id ? "is-playing" : ""}`} key={option.id} onClick={event => { event.stopPropagation(); play(option); }} aria-label={`Play ${option.name}`}>
        <span className="soundlab-option-top"><span>{String(i + 1).padStart(2, "0")} / {option.detail}</span><span className="soundlab-play" aria-hidden="true">{playing === option.id ? "♪" : "↗"}</span></span>
        <strong>{option.name}</strong><span className="soundlab-description">{option.description}</span><span className="soundlab-listen">{playing === option.id ? "PLAYING" : "TAP TO LISTEN"} <span aria-hidden="true">→</span></span>
      </button>)}</div>
    </section>)}
    <footer className="soundlab-footer">Nothing changes on the main page until you choose. <Link href="/lab">Back to the banner ↗</Link></footer>
  </main>;
}
