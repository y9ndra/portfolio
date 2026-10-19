"use client";

import { useEffect, useRef } from "react";

/**
 * MoonBanner — halftone moon where a rocket lands, an astronaut plants the
 * Straw Hat flag, boards again and leaves. Loops every ~53 seconds.
 *
 * The moon and stars are sampled analytically per dot in world space. The
 * rocket, astronaut, flag, dust and footprints are vector-drawn each frame on
 * a hidden "sprite" canvas that follows the current zoom, so they stay tiny at
 * 1x and show real detail at 2x / 4x.
 *
 *  - desktop: hover shows a fine-grid focus circle, left click zooms in 2x on
 *    the clicked spot (max 4x), right click zooms out
 *  - touch: tap zooms in, double-tap zooms out, one finger pans while zoomed;
 *    at 4x the whole banner switches to the fine grid automatically
 *  - a hint is shown from load until the first interaction (hover, click or
 *    touch) and then disappears for the rest of the page's life; the scene
 *    also performs a single demonstration zoom when the flag is planted,
 *    unless the visitor already zoomed
 *  - dark theme: dots carry light; light theme: dots carry ink
 */

const CELL = 4;
const FOCUS_R = 84;        // focus circle radius (px): finer halftone inside
const MAX_ZOOM = 4;

/* ---------- timeline (seconds) ---------- */
const T_APPROACH = 10.0;     // flies in and flips engines-first
const T_DESCENT = 17.0;      // slow retro-burn descent, touchdown at 17
const T_HATCH = 18.2;        // hatch opens
const T_EGRESS = 19.4;       // astronaut climbs down the ladder
const T_WALK = 22.8;         // walks away from the lander
const T_PLANT = 26.8;        // plants the flag
const T_WAVE = 29.8;         // waves at the camera
const T_RETURN = 34.8;       // walks back to the lander
const T_CLIMB = 38.6;        // climbs the ladder
const T_HATCH_CLOSE = 41.6;  // hatch closes
const T_LIFTOFF = 43.0;      // ignition, slow rise, gravity turn, exit
const T_GONE = 51.5;         // rocket has left; flag and footprints fade
const T_LOOP = 53.5;

/* ---------- noise ---------- */
function hash2(x: number, y: number) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}
function noise2(x: number, y: number) {
  const xi = Math.floor(x), yi = Math.floor(y);
  const xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash2(xi, yi), b = hash2(xi + 1, yi), c = hash2(xi, yi + 1), d = hash2(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
function fbm(x: number, y: number) {
  return 0.5 * noise2(x, y) + 0.25 * noise2(x * 2.1, y * 2.1) + 0.125 * noise2(x * 4.3, y * 4.3);
}
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);
const easeInOut = (x: number) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);
const lerpAngle = (a: number, b: number, k: number) => {
  let d = b - a;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return a + d * k;
};

type Crater = { x: number; y: number; r: number };
function makeCraters(n: number, seed: number): Crater[] {
  const out: Crater[] = [];
  for (let i = 0; i < n; i++) {
    const a = hash2(seed + i * 3.1, 1.3) * Math.PI * 2;
    const rr = Math.sqrt(hash2(seed + i * 1.7, 4.2)) * 0.92;
    out.push({ x: Math.cos(a) * rr, y: Math.sin(a) * rr, r: 0.04 + 0.14 * hash2(seed + i * 2.3, 9.1) });
  }
  return out;
}

/* ====================================================================
   Vector sprites. All drawn in local units where 1 = moon radius R,
   origin at the ground contact point, "up" is -y.
   ==================================================================== */

const INK = {
  white: "#f4f4f4",
  light: "#d2d2d2",
  mid: "#8a8a8a",
  dark: "#3a3a3a",
  black: "#121212",
};

/** Rocket, length L (in R units). throttle 0..1, legs 0..1 (deployed), hatch 0..1 (open) */
function drawRocket(g: CanvasRenderingContext2D, L: number, throttle: number, legs: number, hatch: number, t: number) {
  const w = L * 0.115;           // half width of the body
  const bodyBottom = -L * 0.08;  // nozzle sits a little above the ground contact
  const bodyTop = -L * 0.72;     // where the nose cone starts
  const tip = -L;

  // ---- flame (behind everything) ----
  if (throttle > 0.01) {
    const flick = 0.85 + 0.15 * Math.sin(t * 43) + 0.1 * Math.sin(t * 71 + 2);
    const fl = L * 0.55 * throttle * flick;
    const fw = w * 0.55 * (0.8 + 0.2 * throttle);
    const grad = g.createLinearGradient(0, bodyBottom, 0, bodyBottom + fl);
    grad.addColorStop(0, INK.white);
    grad.addColorStop(0.35, INK.light);
    grad.addColorStop(1, "rgba(120,120,120,0)");
    g.fillStyle = grad;
    g.beginPath();
    g.moveTo(-fw, bodyBottom);
    g.quadraticCurveTo(-fw * 1.3, bodyBottom + fl * 0.45, 0, bodyBottom + fl);
    g.quadraticCurveTo(fw * 1.3, bodyBottom + fl * 0.45, fw, bodyBottom);
    g.closePath();
    g.fill();
    // inner hot core
    g.fillStyle = INK.white;
    g.beginPath();
    g.moveTo(-fw * 0.45, bodyBottom);
    g.lineTo(0, bodyBottom + fl * 0.5);
    g.lineTo(fw * 0.45, bodyBottom);
    g.closePath();
    g.fill();
  }

  // ---- landing legs (two visible, splayed) ----
  const legLen = L * 0.26;
  const spread = 0.35 + 0.65 * legs;           // folded against the body → splayed
  const hipY = -L * 0.3;
  g.lineCap = "round";
  for (const side of [-1, 1]) {
    const hx = side * w * 0.95;
    const fx = side * (w * 0.95 + legLen * 0.75 * spread);
    const fy = hipY + legLen * (0.55 + 0.45 * legs) + (legs > 0.98 ? L * 0.3 : L * 0.1);
    const footY = Math.min(0, fy);
    g.strokeStyle = INK.mid;
    g.lineWidth = L * 0.022;
    g.beginPath(); g.moveTo(hx, hipY); g.lineTo(fx, footY); g.stroke();
    // strut
    g.lineWidth = L * 0.014;
    g.beginPath(); g.moveTo(hx, hipY + L * 0.16); g.lineTo((hx + fx) / 2, (hipY + footY) / 2 + L * 0.02); g.stroke();
    // foot pad
    g.fillStyle = INK.light;
    g.beginPath(); g.ellipse(fx, footY, L * 0.035, L * 0.012, 0, 0, Math.PI * 2); g.fill();
  }

  // ---- engine bell ----
  g.fillStyle = INK.dark;
  g.beginPath();
  g.moveTo(-w * 0.55, bodyBottom - L * 0.02);
  g.lineTo(w * 0.55, bodyBottom - L * 0.02);
  g.lineTo(w * 0.8, bodyBottom + L * 0.06);
  g.lineTo(-w * 0.8, bodyBottom + L * 0.06);
  g.closePath();
  g.fill();
  g.strokeStyle = INK.light;
  g.lineWidth = L * 0.01;
  g.beginPath(); g.moveTo(-w * 0.8, bodyBottom + L * 0.06); g.lineTo(w * 0.8, bodyBottom + L * 0.06); g.stroke();

  // ---- fins ----
  g.fillStyle = INK.mid;
  for (const side of [-1, 1]) {
    g.beginPath();
    g.moveTo(side * w, -L * 0.34);
    g.lineTo(side * w * 2.1, bodyBottom + L * 0.02);
    g.lineTo(side * w, bodyBottom - L * 0.02);
    g.closePath();
    g.fill();
  }
  // centre fin (facing viewer)
  g.fillStyle = INK.dark;
  g.beginPath();
  g.moveTo(-w * 0.2, -L * 0.3); g.lineTo(w * 0.2, -L * 0.3);
  g.lineTo(w * 0.28, bodyBottom - L * 0.02); g.lineTo(-w * 0.28, bodyBottom - L * 0.02);
  g.closePath(); g.fill();

  // ---- body (cylinder shading: lit from the left) ----
  const shade = g.createLinearGradient(-w, 0, w, 0);
  shade.addColorStop(0, INK.light);
  shade.addColorStop(0.35, INK.white);
  shade.addColorStop(0.75, INK.light);
  shade.addColorStop(1, INK.mid);
  g.fillStyle = shade;
  g.beginPath();
  g.rect(-w, bodyTop, w * 2, bodyBottom - bodyTop);
  g.fill();

  // nose cone
  g.beginPath();
  g.moveTo(-w, bodyTop);
  g.quadraticCurveTo(-w * 0.9, tip + L * 0.06, 0, tip);
  g.quadraticCurveTo(w * 0.9, tip + L * 0.06, w, bodyTop);
  g.closePath();
  g.fill();
  // cone band
  g.fillStyle = INK.dark;
  g.fillRect(-w, bodyTop - L * 0.005, w * 2, L * 0.03);

  // panel lines & rivets
  g.strokeStyle = "rgba(60,60,60,0.55)";
  g.lineWidth = L * 0.008;
  for (const y of [-L * 0.2, -L * 0.42, -L * 0.6]) {
    g.beginPath(); g.moveTo(-w, y); g.lineTo(w, y); g.stroke();
  }
  g.beginPath(); g.moveTo(-w * 0.15, bodyTop + L * 0.02); g.lineTo(-w * 0.15, bodyBottom - L * 0.02); g.stroke();
  // dark stripe (classic)
  g.fillStyle = INK.dark;
  g.fillRect(-w, -L * 0.2, w * 2, L * 0.045);

  // porthole
  const py = -L * 0.5;
  g.fillStyle = INK.dark;
  g.beginPath(); g.arc(0, py, w * 0.5, 0, Math.PI * 2); g.fill();
  g.fillStyle = INK.black;
  g.beginPath(); g.arc(0, py, w * 0.36, 0, Math.PI * 2); g.fill();
  g.fillStyle = INK.white;
  g.beginPath(); g.arc(-w * 0.12, py - w * 0.12, w * 0.1, 0, Math.PI * 2); g.fill();

  // hatch on the right side, opens outward
  const hy = -L * 0.34;
  const hh = L * 0.1;
  g.fillStyle = INK.dark;
  g.fillRect(w * 0.45, hy - hh / 2, w * 0.5, hh);
  if (hatch > 0.01) {
    g.fillStyle = INK.black;
    g.fillRect(w * 0.5, hy - hh / 2 + L * 0.006, w * 0.42, hh - L * 0.012);
    // door swung open
    g.save();
    g.translate(w, hy - hh / 2);
    g.rotate(hatch * 1.3);
    g.fillStyle = INK.light;
    g.fillRect(0, 0, L * 0.012, hh);
    g.restore();
    // ladder
    g.strokeStyle = INK.light;
    g.lineWidth = L * 0.008;
    const lx = w * 1.15;
    g.beginPath(); g.moveTo(lx, hy + hh / 2); g.lineTo(lx, 0); g.stroke();
    g.beginPath(); g.moveTo(lx + L * 0.03, hy + hh / 2); g.lineTo(lx + L * 0.03, 0); g.stroke();
    for (let y = hy + hh / 2 + L * 0.03; y < 0; y += L * 0.035) {
      g.beginPath(); g.moveTo(lx, y); g.lineTo(lx + L * 0.03, y); g.stroke();
    }
  }
}

/** Astronaut, height h. walk: leg-swing phase (radians) or NaN for standing; wave 0..1 */
function drawAstronaut(g: CanvasRenderingContext2D, h: number, walk: number, wave: number, facing: number) {
  g.save();
  g.scale(facing, 1);
  const legL = h * 0.38, torsoT = -h * 0.72, hipY = -h * 0.38;
  const swing = Number.isNaN(walk) ? 0 : Math.sin(walk) * 0.55;
  g.lineCap = "round";
  g.lineJoin = "round";

  // backpack (life support)
  g.fillStyle = INK.mid;
  g.fillRect(-h * 0.26, torsoT + h * 0.02, h * 0.14, h * 0.3);

  // legs
  g.strokeStyle = INK.light;
  g.lineWidth = h * 0.12;
  for (const s of [-1, 1]) {
    const a = swing * s;
    const kx = Math.sin(a) * legL * 0.5, ky = hipY + Math.cos(a) * legL * 0.5;
    const fx = Math.sin(a) * legL, fy = hipY + Math.cos(a) * legL;
    g.beginPath(); g.moveTo(0, hipY); g.lineTo(kx, ky); g.lineTo(fx, Math.min(0, fy)); g.stroke();
    // boot
    g.fillStyle = INK.dark;
    g.beginPath(); g.ellipse(fx + h * 0.03, Math.min(0, fy), h * 0.08, h * 0.045, 0, 0, Math.PI * 2); g.fill();
  }

  // torso
  g.fillStyle = INK.white;
  g.beginPath();
  g.roundRect(-h * 0.14, torsoT, h * 0.28, hipY - torsoT + h * 0.04, h * 0.05);
  g.fill();
  // chest panel
  g.fillStyle = INK.dark;
  g.fillRect(-h * 0.06, torsoT + h * 0.08, h * 0.12, h * 0.07);

  // arms
  g.strokeStyle = INK.white;
  g.lineWidth = h * 0.1;
  const shoulderY = torsoT + h * 0.06;
  // back arm swings opposite the front leg
  const backA = -swing * 0.8;
  g.beginPath(); g.moveTo(-h * 0.1, shoulderY); g.lineTo(-h * 0.1 + Math.sin(backA) * h * 0.22, shoulderY + Math.cos(backA) * h * 0.26); g.stroke();
  // front arm: swings while walking, raised and waving otherwise
  if (wave > 0) {
    const wa = -2.2 + Math.sin(wave * 14) * 0.35;
    g.beginPath();
    g.moveTo(h * 0.1, shoulderY);
    g.lineTo(h * 0.24, shoulderY - h * 0.08);
    g.lineTo(h * 0.24 + Math.cos(wa) * h * 0.2, shoulderY - h * 0.08 + Math.sin(wa) * h * 0.2);
    g.stroke();
  } else {
    const fa = swing * 0.8;
    g.beginPath(); g.moveTo(h * 0.1, shoulderY); g.lineTo(h * 0.1 + Math.sin(fa) * h * 0.22, shoulderY + Math.cos(fa) * h * 0.26); g.stroke();
  }
  // gloves
  g.fillStyle = INK.light;

  // helmet
  const hy = torsoT - h * 0.14;
  g.fillStyle = INK.white;
  g.beginPath(); g.arc(0, hy, h * 0.17, 0, Math.PI * 2); g.fill();
  // visor (dark, facing +x)
  g.fillStyle = INK.black;
  g.beginPath(); g.ellipse(h * 0.04, hy + h * 0.005, h * 0.11, h * 0.1, 0, 0, Math.PI * 2); g.fill();
  // visor reflection
  g.fillStyle = INK.light;
  g.beginPath(); g.ellipse(h * 0.07, hy - h * 0.035, h * 0.035, h * 0.02, -0.4, 0, Math.PI * 2); g.fill();
  g.restore();
}

/** Flag: pole height ph, rise 0..1 (pole up), unfurl 0..1, t for waving.
 *  Cloth is the Straw Hat Jolly Roger: skull in a straw hat over crossbones. */
function drawFlag(g: CanvasRenderingContext2D, ph: number, rise: number, unfurl: number, t: number) {
  const top = -ph * rise;
  g.strokeStyle = INK.light;
  g.lineWidth = ph * 0.035;
  g.lineCap = "round";
  g.beginPath(); g.moveTo(0, 0); g.lineTo(0, top); g.stroke();
  g.fillStyle = INK.dark;
  g.beginPath(); g.ellipse(0, 0, ph * 0.07, ph * 0.025, 0, 0, Math.PI * 2); g.fill();
  if (unfurl <= 0.01) return;

  const fw = ph * 0.78 * unfurl, fh = ph * 0.5;
  const segs = 8;
  const wave = (u: number, phase: number) => Math.sin(t * 5 + u * 5 + phase) * ph * 0.03 * u;

  // cloth outline (waving)
  g.beginPath();
  g.moveTo(0, top);
  for (let i = 1; i <= segs; i++) { const u = i / segs; g.lineTo(u * fw, top + wave(u, 0)); }
  for (let i = segs; i >= 0; i--) { const u = i / segs; g.lineTo(u * fw, top + fh + wave(u, 0.6)); }
  g.closePath();
  g.fillStyle = INK.black;
  g.fill();
  g.strokeStyle = INK.light;
  g.lineWidth = ph * 0.018;
  g.stroke();

  // emblem, clipped to the cloth and gently following the wave
  g.save();
  g.clip();
  const cx = fw * 0.5, cy = top + fh * 0.54 + wave(0.5, 0.3);
  const sk = fh * 0.2;              // skull radius
  g.lineCap = "round";

  // crossbones
  g.strokeStyle = INK.white;
  g.lineWidth = sk * 0.28;
  for (const sgn of [-1, 1]) {
    g.beginPath();
    g.moveTo(cx - sgn * sk * 1.7, cy - sk * 1.25);
    g.lineTo(cx + sgn * sk * 1.7, cy + sk * 1.25);
    g.stroke();
    for (const e of [-1, 1]) {
      const ex = cx + e * sgn * sk * 1.7, ey = cy + e * sk * 1.25;
      g.fillStyle = INK.white;
      g.beginPath(); g.arc(ex - sgn * sk * 0.12, ey - sk * 0.2, sk * 0.2, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.arc(ex + sgn * sk * 0.12, ey + sk * 0.2, sk * 0.2, 0, Math.PI * 2); g.fill();
    }
  }

  // skull
  g.fillStyle = INK.white;
  g.beginPath(); g.arc(cx, cy - sk * 0.1, sk, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.roundRect(cx - sk * 0.55, cy + sk * 0.5, sk * 1.1, sk * 0.6, sk * 0.15); g.fill(); // jaw
  g.fillStyle = INK.black;
  g.beginPath(); g.ellipse(cx - sk * 0.38, cy - sk * 0.15, sk * 0.26, sk * 0.3, 0, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.ellipse(cx + sk * 0.38, cy - sk * 0.15, sk * 0.26, sk * 0.3, 0, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.moveTo(cx, cy + sk * 0.15); g.lineTo(cx - sk * 0.13, cy + sk * 0.42); g.lineTo(cx + sk * 0.13, cy + sk * 0.42); g.closePath(); g.fill(); // nose
  g.lineWidth = sk * 0.08;
  g.strokeStyle = INK.black;
  for (let i = -1; i <= 1; i++) { // teeth
    g.beginPath(); g.moveTo(cx + i * sk * 0.3, cy + sk * 0.62); g.lineTo(cx + i * sk * 0.3, cy + sk * 1.05); g.stroke();
  }

  // straw hat: dome, red band (dark), wide brim
  g.fillStyle = INK.light;
  g.beginPath(); g.ellipse(cx, cy - sk * 1.0, sk * 0.95, sk * 0.62, 0, Math.PI, Math.PI * 2); g.fill();          // dome
  g.fillStyle = INK.dark;
  g.fillRect(cx - sk * 0.98, cy - sk * 1.18, sk * 1.96, sk * 0.22);                                          // band
  g.fillStyle = INK.light;
  g.beginPath(); g.ellipse(cx, cy - sk * 0.95, sk * 1.75, sk * 0.3, 0, 0, Math.PI * 2); g.fill();            // brim
  g.strokeStyle = INK.dark;
  g.lineWidth = sk * 0.06;
  g.beginPath(); g.ellipse(cx, cy - sk * 0.95, sk * 1.75, sk * 0.3, 0, 0, Math.PI * 2); g.stroke();

  g.restore();
}

export default function MoonBanner() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hintRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const hint = hintRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const sprite = document.createElement("canvas");
    const sg = sprite.getContext("2d", { willReadFrequently: true });
    if (!sg) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    let W = 0, H = 0, dpr = 1;
    let isLight = document.documentElement.getAttribute("data-theme") === "light";
    const mo = new MutationObserver(() => {
      isLight = document.documentElement.getAttribute("data-theme") === "light";
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    /* ---------- world ---------- */
    const craters = makeCraters(28, 3.7);
    const LIGHT = [-0.38, -0.3, 0.87] as const;
    const moon = { cx: 0, cy: 0, R: 1 };
    // landing site on the upper-left limb
    const THETA = (-132 * Math.PI) / 180;
    const n = { x: Math.cos(THETA), y: Math.sin(THETA) };     // surface normal (up)
    const tg = { x: -Math.sin(THETA), y: Math.cos(THETA) };   // tangent (walk direction)
    const rotUp = Math.atan2(n.x, -n.y);                      // rotation so local -y = n
    const site = { x: 0, y: 0 };
    const setWorld = () => {
      moon.cx = W * 0.64;
      moon.cy = H * 0.70;
      moon.R = H * 0.40;
      site.x = moon.cx + n.x * moon.R;
      site.y = moon.cy + n.y * moon.R;
      sprite.width = W; sprite.height = H;
    };

    const moonAt = (wx: number, wy: number, zoom: number) => {
      const dx = (wx - moon.cx) / moon.R, dy = (wy - moon.cy) / moon.R;
      const r2 = dx * dx + dy * dy;
      if (r2 > 1) return -1;
      const nz = Math.sqrt(1 - r2);
      let nx = dx, ny = dy;
      for (const c of craters) {
        const ex = (dx - c.x) / c.r, ey = (dy - c.y) / c.r;
        const e2 = ex * ex + ey * ey;
        if (e2 < 1.3) {
          const rim = Math.exp(-((Math.sqrt(e2) - 1) ** 2) * 14) * 0.5;
          const bowl = e2 < 1 ? -(1 - e2) * 0.6 : 0;
          const k = (bowl + rim) * 1.6;
          nx += ex * k; ny += ey * k;
        }
      }
      const len = Math.hypot(nx, ny, nz);
      const shade = Math.max(0, (nx * LIGHT[0] + ny * LIGHT[1] + nz * LIGHT[2]) / len);
      const tex = 0.66 + 0.5 * fbm(dx * 6 + 3.7, dy * 6 - 3.7);
      const mare = 1 - 0.45 * Math.max(0, fbm(dx * 2.2 + 7.4, dy * 2.2) - 0.42) * 3;
      let v = Math.pow(shade, 1.35) * tex * mare * (0.6 + 0.4 * nz);
      v = Math.min(1, v * 0.78);
      const edge = Math.min(1, ((1 - Math.sqrt(r2)) * moon.R * zoom) / CELL);
      return v * edge;
    };

    /* ---------- moon texture ----------
       The moon never changes, so its shading is sampled once into a brightness
       texture (world-space, `ts` texels per world px) instead of being recomputed
       per dot per frame. 1x is built synchronously; finer levels build in idle
       chunks and swap in when ready. -1 marks sky. */
    type MoonTex = { data: Float32Array; ts: number; w: number; h: number };
    let moonTex: MoonTex | null = null;
    let building: { ts: number; cancel: boolean } | null = null;
    const buildMoonTex = (ts: number, sync: boolean) => {
      if (building) building.cancel = true;
      const job = { ts, cancel: false };
      building = job;
      const w = Math.ceil(W * ts), h = Math.ceil(H * ts);
      const data = new Float32Array(w * h);
      const R = moon.R;
      const y0 = Math.max(0, Math.floor((moon.cy - R) * ts) - 1);
      const y1 = Math.min(h - 1, Math.ceil((moon.cy + R) * ts) + 1);
      const x0 = Math.max(0, Math.floor((moon.cx - R) * ts) - 1);
      const x1 = Math.min(w - 1, Math.ceil((moon.cx + R) * ts) + 1);
      data.fill(-1);
      const fillRows = (ya: number, yb: number) => {
        for (let y = ya; y <= yb; y++) {
          const wy = (y + 0.5) / ts;
          const row = y * w;
          for (let x = x0; x <= x1; x++) {
            data[row + x] = moonAt((x + 0.5) / ts, wy, ts * 1.5);
          }
        }
      };
      const finish = () => { if (!job.cancel) { moonTex = { data, ts, w, h }; building = null; } };
      if (sync) { fillRows(y0, y1); finish(); return; }
      let y = y0;
      const rowsPerChunk = Math.max(4, Math.floor(16 / ts * 2));
      const step = () => {
        if (job.cancel) return;
        const yb = Math.min(y1, y + rowsPerChunk - 1);
        fillRows(y, yb);
        y = yb + 1;
        if (y > y1) finish();
        else setTimeout(step, 0);
      };
      setTimeout(step, 0);
    };
    const moonTexAt = (wx: number, wy: number) => {
      const tex = moonTex;
      if (!tex) return moonAt(wx, wy, view.zoom);
      const ix = (wx * tex.ts) | 0, iy = (wy * tex.ts) | 0;
      if (ix < 0 || iy < 0 || ix >= tex.w || iy >= tex.h) return -1;
      return tex.data[iy * tex.w + ix];
    };

    const starAt = (wx: number, wy: number, zoom: number, t: number) => {
      const G = 26;
      const gx = Math.floor(wx / G), gy = Math.floor(wy / G);
      const h = hash2(gx * 1.3, gy * 2.7);
      if (h < 0.78) return 0;
      const sx = (gx + hash2(gx, gy + 9)) * G, sy = (gy + hash2(gx + 5, gy)) * G;
      const d = Math.hypot(wx - sx, wy - sy) * zoom;
      const size = 1.2 + 2.2 * hash2(gx + 2, gy + 2);
      if (d > size) return 0;
      const tw = 0.6 + 0.4 * Math.sin(t * (1 + h * 3) + h * 50);
      return (0.25 + 0.55 * (h - 0.78) / 0.22) * (1 - d / size) * tw;
    };

    /* ---------- view ---------- */
    const view = { zoom: 1, cx: 0, cy: 0 };
    const viewT = { zoom: 1, cx: 0, cy: 0 };
    const clampView = (v: { zoom: number; cx: number; cy: number }) => {
      const hw = W / (2 * v.zoom), hh = H / (2 * v.zoom);
      v.cx = Math.min(W - hw, Math.max(hw, v.cx));
      v.cy = Math.min(H - hh, Math.max(hh, v.cy));
    };
    const screenToWorld = (sx: number, sy: number) => ({
      x: view.cx + (sx - W / 2) / view.zoom,
      y: view.cy + (sy - H / 2) / view.zoom,
    });
    const syncTouchAction = () => {
      // vertical page scroll stays free at 1x; while zoomed, one finger pans the scene
      wrap.style.touchAction = viewT.zoom > 1 ? "none" : "pan-y";
    };

    /* ---------- sprite layer (drawn in world space through the view) ---------- */
    let spData: Uint8ClampedArray | null = null;
    let lastAlpha = 1;
    // screen-space box that the sprites were read back from (getImageData is the
    // expensive part, so only the area that can contain sprites is copied)
    const spBox = { x: 0, y: 0, w: 0, h: 0 };

    const drawSprites = (t: number) => {
      const g = sg;
      g.setTransform(1, 0, 0, 1, 0, 0);
      g.clearRect(0, 0, W, H);
      const tl = t % T_LOOP;
      const R = moon.R;
      const L = R * 0.42;            // rocket length
      const hA = L * 0.3;            // astronaut height

      // world → screen
      g.translate(W / 2, H / 2);
      g.scale(view.zoom, view.zoom);
      g.translate(-view.cx, -view.cy);

      // Point on the curved surface, `d` along the arc from the landing site, `up` above it
      const onSurface = (d: number, up: number) => {
        const phi = THETA + d / R;
        const nx = Math.cos(phi), ny = Math.sin(phi);
        return { x: moon.cx + nx * (R + up), y: moon.cy + ny * (R + up), rot: Math.atan2(nx, -ny) };
      };

      const bez = (a: number, b1: number, c: number, d: number, u: number) =>
        (1 - u) ** 3 * a + 3 * (1 - u) ** 2 * u * b1 + 3 * (1 - u) * u * u * c + u ** 3 * d;

      /* ----- rocket state ----- */
      let rx = site.x, ry = site.y, rrot = rotUp, throttle = 0, legs = 1, hatch = 0;
      let rocketVisible = true;
      const hover = { x: site.x + n.x * R * 1.15, y: site.y + n.y * R * 1.15 };
      // approach path (off-screen bottom-left → hover point); departure retraces it
      const p0 = { x: -0.12 * W, y: H * 0.92 };
      const p1 = { x: 0.22 * W, y: H * 1.02 };
      const p2 = { x: hover.x - 0.18 * W, y: hover.y + 0.45 * H };
      const p3 = hover;
      const pathAt = (u: number) => ({
        x: bez(p0.x, p1.x, p2.x, p3.x, u),
        y: bez(p0.y, p1.y, p2.y, p3.y, u),
      });
      if (tl < T_APPROACH) {
        const u = easeInOut(clamp01(tl / T_APPROACH));
        const p = pathAt(u), q = pathAt(Math.min(1, u + 0.002));
        rx = p.x; ry = p.y;
        const velRot = Math.atan2(q.x - p.x, -(q.y - p.y));
        const flip = easeInOut(clamp01((u - 0.62) / 0.38));
        rrot = lerpAngle(velRot, rotUp, flip);
        throttle = 0.9 - 0.5 * flip;
        legs = 0;
      } else if (tl < T_DESCENT) {
        const u = easeOutCubic(clamp01((tl - T_APPROACH) / (T_DESCENT - T_APPROACH)));
        const alt = R * 1.15 * (1 - u);
        rx = site.x + n.x * alt; ry = site.y + n.y * alt;
        throttle = 0.3 + 0.55 * (1 - u);
        legs = clamp01((tl - T_APPROACH) / 2.2);
      } else if (tl < T_LIFTOFF) {
        throttle = Math.max(0, 1 - (tl - T_DESCENT) / 0.9) * 0.3;
        if (tl < T_HATCH_CLOSE) hatch = easeInOut(clamp01((tl - T_HATCH) / 1.2));
        else hatch = 1 - easeInOut(clamp01((tl - T_HATCH_CLOSE) / 1.2));
      } else if (tl < T_GONE) {
        // departure: one smooth curve. It leaves the pad straight along the
        // surface normal (first control point lies on it, so there is no kink),
        // arcs over the top-left and exits to the left where it came from.
        const u = clamp01((tl - T_LIFTOFF) / (T_GONE - T_LIFTOFF));
        const d0 = site;
        const d1 = { x: site.x + n.x * R * 1.0, y: site.y + n.y * R * 1.0 };
        const d2 = { x: 0.22 * W, y: 0.16 * H };
        const d3 = { x: -0.16 * W, y: 0.55 * H };
        const dep = (uu: number) => ({
          x: bez(d0.x, d1.x, d2.x, d3.x, uu),
          y: bez(d0.y, d1.y, d2.y, d3.y, uu),
        });
        const v = u * u;                       // gentle, continuous acceleration
        const p = dep(v), q = dep(Math.min(1, v + 0.002));
        rx = p.x; ry = p.y;
        rrot = v < 0.0005 ? rotUp : Math.atan2(q.x - p.x, -(q.y - p.y));
        throttle = clamp01((tl - T_LIFTOFF) / 0.9) * (0.9 + 0.1 * Math.sin(t * 9));
        legs = 1 - clamp01((tl - T_LIFTOFF - 1.6) / 2.0);
      } else {
        rocketVisible = false;
      }

      // flag / footprints fade once the rocket has left
      const traceAlpha = tl < T_GONE ? 1 : 1 - clamp01((tl - T_GONE) / 0.9);

      /* ----- footprints ----- */
      if (tl >= T_WALK && traceAlpha > 0) {
        const walked = clamp01((tl - T_WALK) / (T_PLANT - T_WALK));
        const count = Math.floor(walked * 9);
        g.fillStyle = `rgba(40,40,40,${(0.8 * traceAlpha).toFixed(3)})`;
        for (let i = 0; i < count; i++) {
          const d = R * (0.1 + 0.15 * (i / 9));
          const side = i % 2 ? 1 : -1;
          const f = onSurface(d, 0);
          const px = f.x - Math.sin(f.rot) * 0 + Math.cos(f.rot) * side * hA * 0.06;
          const py = f.y + Math.sin(f.rot) * side * hA * 0.06;
          g.beginPath(); g.ellipse(px, py, hA * 0.07, hA * 0.035, f.rot, 0, Math.PI * 2); g.fill();
        }
      }

      /* ----- dust: touchdown and ignition ----- */
      const dust = (t0: number, dur: number, seed: number) => {
        if (tl < t0 || tl > t0 + dur) return;
        const age = clamp01((tl - t0) / dur);
        for (let i = 0; i < 14; i++) {
          const h = hash2(i * 1.7 + seed, 3.3);
          const dir = i % 2 ? 1 : -1;
          const dist = (R * 0.06 + R * 0.34 * h) * easeOutCubic(age) * dir;
          const lift = R * 0.08 * h * Math.sin(age * Math.PI);
          const px = site.x + tg.x * dist + n.x * lift;
          const py = site.y + tg.y * dist + n.y * lift;
          g.fillStyle = `rgba(170,170,170,${(0.6 * (1 - age)).toFixed(3)})`;
          g.beginPath(); g.arc(px, py, R * (0.012 + 0.02 * h) * (0.5 + age), 0, Math.PI * 2); g.fill();
        }
      };
      dust(T_DESCENT - 0.6, 2.4, 0);
      dust(T_LIFTOFF - 0.2, 2.6, 5);

      /* ----- flag ----- */
      if (tl >= T_PLANT && traceAlpha > 0) {
        const rise = easeOutCubic(clamp01((tl - T_PLANT) / 1.4));
        const unfurl = easeOutCubic(clamp01((tl - T_PLANT - 1.0) / 1.2));
        const f = onSurface(R * 0.30, 0);
        g.save();
        g.globalAlpha = traceAlpha;
        g.translate(f.x, f.y);
        g.rotate(f.rot);
        drawFlag(g, L * 0.52, rise, unfurl, t);
        g.restore();
      }

      /* ----- rocket ----- */
      if (rocketVisible) {
        g.save();
        g.translate(rx, ry);
        g.rotate(rrot);
        drawRocket(g, L, throttle, legs, hatch, t);
        g.restore();
      }

      /* ----- astronaut ----- */
      if (tl >= T_EGRESS && tl < T_HATCH_CLOSE) {
        let along = R * 0.075;     // distance from the lander along the tangent
        let up = 0;                // height above ground
        let walk = NaN, wave = 0, facing = 1;
        if (tl < T_WALK) {
          const u = clamp01((tl - T_EGRESS) / (T_WALK - T_EGRESS));
          up = L * 0.4 * (1 - u);
          walk = u * 14;
        } else if (tl < T_PLANT) {
          const u = clamp01((tl - T_WALK) / (T_PLANT - T_WALK));
          along = R * (0.075 + 0.165 * u);
          up = Math.abs(Math.sin(u * 20)) * hA * 0.08;
          walk = u * 20;
        } else if (tl < T_RETURN) {
          along = R * 0.24;
          wave = tl >= T_WAVE ? tl - T_WAVE : 0;
        } else if (tl < T_CLIMB) {
          const u = clamp01((tl - T_RETURN) / (T_CLIMB - T_RETURN));
          along = R * (0.24 - 0.165 * u);
          up = Math.abs(Math.sin(u * 20)) * hA * 0.08;
          walk = u * 20;
          facing = -1;
        } else {
          const u = clamp01((tl - T_CLIMB) / (T_HATCH_CLOSE - T_CLIMB));
          up = L * 0.4 * u;
          walk = u * 14;
        }
        const a = onSurface(along, up);
        g.save();
        g.translate(a.x, a.y);
        g.rotate(a.rot);
        drawAstronaut(g, hA, walk, wave, facing);
        g.restore();
      }

      g.setTransform(1, 0, 0, 1, 0, 0);

      // Read back only where sprites can be: around the rocket, and around the
      // landing site while anything is happening there.
      let bx0 = Infinity, by0 = Infinity, bx1 = -Infinity, by1 = -Infinity;
      const addWorldBox = (cx: number, cy: number, r: number) => {
        const sx = (cx - view.cx) * view.zoom + W / 2, sy = (cy - view.cy) * view.zoom + H / 2;
        const sr = r * view.zoom;
        bx0 = Math.min(bx0, sx - sr); by0 = Math.min(by0, sy - sr);
        bx1 = Math.max(bx1, sx + sr); by1 = Math.max(by1, sy + sr);
      };
      if (rocketVisible) addWorldBox(rx, ry, L * 1.6);
      if (tl >= T_DESCENT - 1 && tl < T_GONE + 1.2) addWorldBox(site.x + tg.x * R * 0.15, site.y + tg.y * R * 0.15, R * 0.6);
      const x0 = Math.max(0, Math.floor(bx0)), y0 = Math.max(0, Math.floor(by0));
      const x1 = Math.min(W, Math.ceil(bx1)), y1 = Math.min(H, Math.ceil(by1));
      if (x1 - x0 > 0 && y1 - y0 > 0) {
        spBox.x = x0; spBox.y = y0; spBox.w = x1 - x0; spBox.h = y1 - y0;
        spData = g.getImageData(x0, y0, spBox.w, spBox.h).data;
      } else {
        spData = null;
      }
    };

    const spriteAt = (sx: number, sy: number) => {
      if (!spData) return -1;
      const x = Math.round(sx) - spBox.x, y = Math.round(sy) - spBox.y;
      if (x < 0 || y < 0 || x >= spBox.w || y >= spBox.h) return -1;
      const i = (y * spBox.w + x) * 4;
      const a = spData[i + 3];
      if (a < 12) return -1;
      lastAlpha = a / 255;
      return (0.2126 * spData[i] + 0.7152 * spData[i + 1] + 0.0722 * spData[i + 2]) / 255;
    };

    /* ---------- focus circle (hover devices only) ---------- */
    const target = { x: -9999, y: -9999, a: 0 };
    const lens = { x: -9999, y: -9999, a: 0 };

    let resizes = 0;
    let prevW = 0, prevH = 0;
    const resize = () => {
      resizes++;
      const r = wrap.getBoundingClientRect();
      W = Math.max(1, Math.round(r.width));
      H = Math.max(1, Math.round(r.height));
      dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = W * dpr; canvas.height = H * dpr;
      canvas.style.width = `${W}px`; canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const oldW = prevW || W, oldH = prevH || H;
      prevW = W; prevH = H;
      setWorld();
      moonTex = null;
      buildMoonTex(1, true);
      buildMoonTex(2, false);
      if (resizes === 1 || viewT.zoom === 1) {
        view.cx = viewT.cx = W / 2; view.cy = viewT.cy = H / 2;
      } else {
        const kx = W / oldW, ky = H / oldH;
        view.cx *= kx; view.cy *= ky; viewT.cx *= kx; viewT.cy *= ky;
      }
      clampView(view); clampView(viewT);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const draw = (t: number) => {
      drawSprites(t);
      ctx.clearRect(0, 0, W, H);
      const ink = isLight ? "18,19,20" : "239,239,239";
      ctx.fillStyle = `rgb(${ink})`;
      const cols = Math.ceil(W / CELL) + 1, rows = Math.ceil(H / CELL) + 1;
      const maxR = CELL * 0.58;

      // Brightness of the scene at a screen position (lens-free, exact sampling)
      const sampleScreen = (sx: number, sy: number, time: number) => {
        const w = screenToWorld(sx, sy);
        let bg = moonTexAt(w.x, w.y);
        if (bg < 0) bg = starAt(w.x, w.y, view.zoom, time);
        const sp = spriteAt(sx, sy);
        const b = sp >= 0 ? bg * (1 - lastAlpha) + sp * lastAlpha : bg;
        return isLight ? 1 - b : b;
      };

      const focusOn = lens.a > 0.01;
      // touch devices have no hover focus: give them the fine grid everywhere at max zoom
      const fineAll = !canHover && view.zoom > MAX_ZOOM * 0.8;
      const fr2 = FOCUS_R * FOCUS_R;
      const q = CELL / 4;             // sub-dot offset inside a focused cell
      const subMax = maxR * 0.5;

      ctx.beginPath();
      for (let r = 0; r < rows; r++) {
        const y = r * CELL;
        const stagger = r % 2 ? CELL / 2 : 0;
        for (let c = 0; c < cols; c++) {
          const x = c * CELL + stagger;
          let focused = fineAll;
          if (!focused && focusOn) {
            const dx = x - lens.x, dy = y - lens.y;
            // the circle grows in as the pointer arrives
            focused = dx * dx + dy * dy < fr2 * lens.a * lens.a;
          }
          if (focused) {
            // finer grid: four small dots, each sampled at its own position
            for (let j = -1; j <= 1; j += 2) {
              for (let i = -1; i <= 1; i += 2) {
                const sx = x + i * q, sy = y + j * q;
                const b = sampleScreen(sx, sy, t);
                if (b < 0.05) continue;
                const rad = Math.sqrt(b) * subMax;
                ctx.moveTo(sx + rad, sy);
                ctx.arc(sx, sy, rad, 0, Math.PI * 2);
              }
            }
          } else {
            const b = sampleScreen(x, y, t);
            if (b < 0.05) continue;
            const rad = Math.sqrt(b) * maxR;
            ctx.moveTo(x + rad, y);
            ctx.arc(x, y, rad, 0, Math.PI * 2);
          }
        }
      }
      ctx.fill();

      // focus reticle: thin ring with four ticks (the pointer itself is hidden over the banner)
      if (focusOn) {
        const rr = FOCUS_R * lens.a;
        ctx.strokeStyle = `rgba(${ink},${(0.35 * lens.a).toFixed(3)})`;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(lens.x, lens.y, rr, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath();
        for (let k = 0; k < 4; k++) {
          const a = (k * Math.PI) / 2;
          ctx.moveTo(lens.x + Math.cos(a) * (rr - 6), lens.y + Math.sin(a) * (rr - 6));
          ctx.lineTo(lens.x + Math.cos(a) * (rr + 4), lens.y + Math.sin(a) * (rr + 4));
        }
        ctx.stroke();
        // small centre mark so the exact hover point is still readable
        ctx.beginPath();
        ctx.moveTo(lens.x - 4, lens.y); ctx.lineTo(lens.x + 4, lens.y);
        ctx.moveTo(lens.x, lens.y - 4); ctx.lineTo(lens.x, lens.y + 4);
        ctx.stroke();
      }
    };

    /* ---------- demonstration zoom & hint ---------- */
    let userInteracted = false;
    let demoDone = false;
    let demoActive = false;
    let hintTimer: ReturnType<typeof setTimeout> | null = null;
    let hintDismissed = false;
    const hideHint = () => {
      hintDismissed = true;
      if (hintTimer) { clearTimeout(hintTimer); hintTimer = null; }
      hint?.classList.remove("visible");
    };
    const showHint = () => {
      if (!hint || hintDismissed || hintTimer) return;
      hint.textContent = canHover
        ? "left click to zoom in · right click to zoom out"
        : "tap to zoom in · double tap to zoom out";
      hintTimer = setTimeout(() => {
        hintTimer = null;
        if (!hintDismissed) hint.classList.add("visible");
      }, 600);
    };
    const markInteracted = () => {
      if (!userInteracted) { userInteracted = true; hideHint(); }
      if (demoActive) { demoActive = false; demoDone = true; }
    };
    const runDemo = (tl: number) => {
      if (reduce || demoDone || userInteracted) return;
      const startT = T_PLANT + 2.2, endT = T_WAVE + 2.6;
      if (!demoActive && tl >= startT && tl < endT) {
        demoActive = true;
        const phi = THETA + 0.30;
        viewT.zoom = 2;
        viewT.cx = moon.cx + Math.cos(phi) * moon.R - moon.R * 0.12;
        viewT.cy = moon.cy + Math.sin(phi) * moon.R + moon.R * 0.10;
        clampView(viewT);
      } else if (demoActive && tl >= endT) {
        demoActive = false;
        demoDone = true;
        viewT.zoom = 1; viewT.cx = W / 2; viewT.cy = H / 2;
      }
    };

    /* ---------- loop ---------- */
    let raf: number | null = null;
    let running = false;
    let last = 0;
    let simT = reduce ? T_WAVE + 1 : 0;
    const tick = (dt: number) => {
      if (!reduce) simT += dt;
      const t = simT;
      runDemo(t % T_LOOP);
      lens.x += (target.x - lens.x) * 0.22;
      lens.y += (target.y - lens.y) * 0.22;
      lens.a += (target.a - lens.a) * 0.14;
      const k = demoActive || (demoDone && !userInteracted && Math.abs(viewT.zoom - view.zoom) > 0.01) ? 0.05 : 0.16;
      view.zoom += (viewT.zoom - view.zoom) * k;
      view.cx += (viewT.cx - view.cx) * k;
      view.cy += (viewT.cy - view.cy) * k;
      clampView(view);
      if (view.zoom > 2.5 && moonTex && moonTex.ts < 4 && !(building && building.ts === 4)) buildMoonTex(4, false);
      draw(t);
    };
    const frame = (ts: number) => {
      if (!running) return;
      raf = requestAnimationFrame(frame);
      if (document.hidden) return;
      if (!last) last = ts;
      const elapsed = ts - last;
      if (elapsed < 1000 / 30) return;
      last = ts;
      tick(Math.min(0.1, elapsed / 1000));
    };
    const start = () => { if (running) return; running = true; last = 0; raf = requestAnimationFrame(frame); };
    const stop = () => { running = false; if (raf !== null) cancelAnimationFrame(raf); raf = null; };
    const io = new IntersectionObserver((e) => {
      if (e[0]?.isIntersecting) { start(); showHint(); } else stop();
    });
    io.observe(wrap);

    /* ---------- zoom actions ---------- */
    const zoomInAt = (sx: number, sy: number) => {
      markInteracted();
      if (viewT.zoom >= MAX_ZOOM) return;
      const w = screenToWorld(sx, sy);
      viewT.zoom = Math.min(MAX_ZOOM, viewT.zoom * 2);
      viewT.cx = w.x; viewT.cy = w.y;
      clampView(viewT);
      syncTouchAction();
    };
    const zoomOut = () => {
      markInteracted();
      if (viewT.zoom <= 1) return;
      viewT.zoom = Math.max(1, viewT.zoom / 2);
      if (viewT.zoom === 1) { viewT.cx = W / 2; viewT.cy = H / 2; }
      clampView(viewT);
      syncTouchAction();
    };

    /* ---------- pointer input ---------- */
    const local = (e: PointerEvent | MouseEvent) => {
      const r = wrap.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    // mouse: hover focus, click in, right-click out
    let firstMove: { x: number; y: number } | null = null;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      // a cursor merely resting over the banner on load should not dismiss the hint;
      // require a little real movement first
      if (!firstMove) firstMove = { x: e.clientX, y: e.clientY };
      else if (Math.hypot(e.clientX - firstMove.x, e.clientY - firstMove.y) > 6) hideHint();
      const p = local(e);
      target.x = p.x; target.y = p.y; target.a = 1;
      if (lens.x < -1000) { lens.x = target.x; lens.y = target.y; }
    };
    const onLeave = () => { target.a = 0; };
    let lastPointerType = "mouse";
    const onClick = (e: MouseEvent) => {
      if (lastPointerType === "touch") return;   // touch taps are handled below
      const p = local(e);
      zoomInAt(p.x, p.y);
    };
    const onContext = (e: MouseEvent) => { e.preventDefault(); if (lastPointerType !== "touch") zoomOut(); };

    // touch: tap in, double-tap out, drag to pan while zoomed
    const touch = { id: -1, x0: 0, y0: 0, lx: 0, ly: 0, t0: 0, moved: false };
    let lastTapAt = 0;
    let lastTapX = 0, lastTapY = 0;
    let tapTimer: ReturnType<typeof setTimeout> | null = null;
    const onDown = (e: PointerEvent) => {
      lastPointerType = e.pointerType;
      if (e.pointerType !== "touch" || touch.id !== -1) return;
      hideHint();
      touch.id = e.pointerId;
      touch.x0 = touch.lx = e.clientX; touch.y0 = touch.ly = e.clientY;
      touch.t0 = performance.now(); touch.moved = false;
      if (viewT.zoom > 1) { try { wrap.setPointerCapture(e.pointerId); } catch { /* ignore */ } }
    };
    const onTouchMove = (e: PointerEvent) => {
      if (e.pointerType !== "touch" || e.pointerId !== touch.id) return;
      const dx = e.clientX - touch.lx, dy = e.clientY - touch.ly;
      touch.lx = e.clientX; touch.ly = e.clientY;
      if (Math.hypot(e.clientX - touch.x0, e.clientY - touch.y0) > 8) touch.moved = true;
      if (viewT.zoom > 1 && touch.moved) {
        view.cx -= dx / view.zoom; view.cy -= dy / view.zoom;
        clampView(view);
        viewT.cx = view.cx; viewT.cy = view.cy;
        markInteracted();
      }
    };
    const onUp = (e: PointerEvent) => {
      if (e.pointerType !== "touch" || e.pointerId !== touch.id) return;
      touch.id = -1;
      const quick = performance.now() - touch.t0 < 350;
      if (touch.moved || !quick) return;
      const now = performance.now();
      const p = local(e);
      const isDouble = now - lastTapAt < 300 && Math.hypot(p.x - lastTapX, p.y - lastTapY) < 30;
      if (isDouble) {
        if (tapTimer) { clearTimeout(tapTimer); tapTimer = null; }
        lastTapAt = 0;
        zoomOut();
        return;
      }
      lastTapAt = now; lastTapX = p.x; lastTapY = p.y;
      if (tapTimer) clearTimeout(tapTimer);
      tapTimer = setTimeout(() => { tapTimer = null; zoomInAt(p.x, p.y); }, 280);
    };
    const onCancel = (e: PointerEvent) => { if (e.pointerId === touch.id) touch.id = -1; };
    const onKey = (e: KeyboardEvent) => {
      hideHint();
      if (e.key === "Enter" || e.key === "+") { e.preventDefault(); zoomInAt(W / 2, H / 2); }
      if (e.key === "Escape" || e.key === "-") { e.preventDefault(); zoomOut(); }
    };
    const onDbl = (e: MouseEvent) => e.preventDefault();

    if (canHover && !reduce) {
      wrap.addEventListener("pointermove", onMove, { passive: true });
      wrap.addEventListener("pointerleave", onLeave, { passive: true });
    }
    wrap.addEventListener("pointerdown", onDown, { passive: true });
    wrap.addEventListener("pointermove", onTouchMove, { passive: true });
    wrap.addEventListener("pointerup", onUp, { passive: true });
    wrap.addEventListener("pointercancel", onCancel, { passive: true });
    wrap.addEventListener("click", onClick);
    wrap.addEventListener("dblclick", onDbl);
    wrap.addEventListener("contextmenu", onContext);
    wrap.addEventListener("keydown", onKey);
    syncTouchAction();
    draw(simT);

    return () => {
      stop(); ro.disconnect(); io.disconnect(); mo.disconnect();
      if (building) building.cancel = true;
      hideHint();
      if (tapTimer) clearTimeout(tapTimer);
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerleave", onLeave);
      wrap.removeEventListener("pointerdown", onDown);
      wrap.removeEventListener("pointermove", onTouchMove);
      wrap.removeEventListener("pointerup", onUp);
      wrap.removeEventListener("pointercancel", onCancel);
      wrap.removeEventListener("click", onClick);
      wrap.removeEventListener("dblclick", onDbl);
      wrap.removeEventListener("contextmenu", onContext);
      wrap.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      className="moon-banner corner-box"
      role="img"
      tabIndex={0}
      aria-label="Halftone moon. A rocket lands, an astronaut plants the Straw Hat flag, then boards and leaves. Click or tap to zoom in, right-click or double-tap to zoom out."
    >
      <canvas ref={canvasRef} className="moon-banner-canvas" aria-hidden="true" />
      <span ref={hintRef} className="moon-banner-hint" aria-hidden="true" />
    </div>
  );
}
