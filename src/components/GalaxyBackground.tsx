"use client";

import { useEffect, useState } from "react";
import Galaxy from "./Galaxy";

export default function GalaxyBackground() {
  const [mounted, setMounted] = useState(false);
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    setMounted(true);

    const updateTheme = () => {
      setIsLight(document.documentElement.getAttribute("data-theme") === "light");
    };

    updateTheme();

    const observer = new MutationObserver(() => {
      updateTheme();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
  }, []);

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
        mouseInteraction={true}
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
