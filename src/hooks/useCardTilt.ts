"use client";

import { useEffect, useRef } from "react";

interface TiltOptions {
  maxTiltX?: number;     // Vertical tilt degrees (pitch), default 6
  maxTiltY?: number;     // Horizontal tilt degrees (yaw), default 5
  scale?: number;        // Scale factor on hover, default 1.015
  perspective?: number;  // 3D perspective distance in px, default 1000
  glare?: boolean;       // Enable dynamic light reflection sheen, default true
  glareRadius?: number;  // Cursor spotlight glow radius in px, default 380
}

export function useCardTilt<T extends HTMLElement = HTMLElement>(options: TiltOptions = {}) {
  const cardRef = useRef<T>(null);
  const glareRef = useRef<HTMLDivElement>(null);

  const {
    maxTiltX = 6,
    maxTiltY = 5,
    scale = 1.015,
    perspective = 1000,
    glare = true,
    glareRadius = 380,
  } = options;

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    // Only enable on pointer-accurate, hover-capable devices (desktop mouse/trackpad)
    // Disables on mobile/touch screens to ensure 100% natural, frictionless scrolling
    const mediaHover = window.matchMedia("(hover: hover) and (pointer: fine)");
    const mediaReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (!mediaHover.matches || mediaReducedMotion.matches) {
      return;
    }

    let rafId: number | null = null;
    let isHovering = false;

    const onPointerEnter = () => {
      isHovering = true;
      // Snappy transition while tracking cursor
      card.style.transition = "transform 0.15s ease-out, box-shadow 0.2s ease, border-color 0.2s ease";
      if (glare && glareRef.current) {
        glareRef.current.style.opacity = "1";
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isHovering) return;

      const rect = card.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        // Perspective rotation:
        // Top tilts toward viewer when cursor is at top (y < 0.5)
        // Right tilts toward viewer when cursor is at right (x > 0.5)
        const rotX = (y - 0.5) * (maxTiltX * 2);
        const rotY = (x - 0.5) * (maxTiltY * 2);

        // Dynamic shadow casts away from the light/cursor
        const shadowX = (-rotY * 1.8).toFixed(1);
        const shadowY = (Math.abs(rotX) * 1.5 + 8).toFixed(1);

        card.style.transform = `perspective(${perspective}px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) scale3d(${scale}, ${scale}, ${scale})`;
        card.style.boxShadow = `${shadowX}px ${shadowY}px 28px -2px var(--card-tilt-shadow, rgba(0,0,0,0.35)), 0 0 0 1px var(--border-h)`;

        // Specular light glare follows cursor position
        if (glare && glareRef.current) {
          glareRef.current.style.background = `radial-gradient(circle ${glareRadius}px at ${(x * 100).toFixed(1)}% ${(y * 100).toFixed(1)}%, var(--card-glare-color, rgba(255,255,255,0.08)), transparent 70%)`;
        }
      });
    };

    const onPointerLeave = () => {
      isHovering = false;
      if (rafId) cancelAnimationFrame(rafId);

      // Smooth elastic return to neutral baseline
      card.style.transition = "transform 0.5s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.5s cubic-bezier(0.23, 1, 0.32, 1), border-color 0.25s ease";
      card.style.transform = `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
      card.style.boxShadow = "";

      if (glare && glareRef.current) {
        glareRef.current.style.opacity = "0";
      }
    };

    card.addEventListener("pointerenter", onPointerEnter);
    card.addEventListener("pointermove", onPointerMove, { passive: true });
    card.addEventListener("pointerleave", onPointerLeave);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      card.removeEventListener("pointerenter", onPointerEnter);
      card.removeEventListener("pointermove", onPointerMove);
      card.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [maxTiltX, maxTiltY, scale, perspective, glare, glareRadius]);

  return { cardRef, glareRef };
}
