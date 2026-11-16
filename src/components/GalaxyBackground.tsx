"use client";

import { useSyncExternalStore } from "react";
import dynamic from "next/dynamic";

// ogl + the shader are only needed on the client, after first paint
const Galaxy = dynamic(() => import("./Galaxy"), { ssr: false });

function subscribeTheme(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}

const getTheme = () => document.documentElement.getAttribute("data-theme") === "light";
const serverTheme = () => false;
const subscribeMounted = () => () => {};
const getMounted = () => true;
const serverMounted = () => false;

export default function GalaxyBackground() {
  const mounted = useSyncExternalStore(subscribeMounted, getMounted, serverMounted);
  const isLight = useSyncExternalStore(subscribeTheme, getTheme, serverTheme);

  if (!mounted) {
    return null;
  }

  return (
    <div
      className="galaxy-bg-fixed"
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "none",
        overflow: "hidden",
        opacity: isLight ? 0.35 : 1,
        transition: "opacity 0.4s ease",
        transform: "translateZ(0)",
      }}
      aria-hidden="true"
    >
      <Galaxy
        mouseRepulsion={true}
        mouseInteraction={false}
        density={isLight ? 1.5 : 3}
        glowIntensity={isLight ? 0.06 : 0.07}
        saturation={0}
        hueShift={0}
        twinkleIntensity={isLight ? 0.02 : 0.02}
        rotationSpeed={0}
        repulsionStrength={0}
        autoCenterRepulsion={0}
        starSpeed={0}
        speed={0.1}
        transparent={true}
        lightMode={isLight}
      />
    </div>
  );
}
