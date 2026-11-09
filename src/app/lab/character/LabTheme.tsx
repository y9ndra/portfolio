"use client";

import { useEffect } from "react";
import { Moon, Sun } from "lucide-react";

export default function LabTheme() {
  useEffect(() => {
    const root = document.documentElement;
    const original = root.getAttribute("data-theme");
    return () => {
      if (original === null) root.removeAttribute("data-theme");
      else root.setAttribute("data-theme", original);
    };
  }, []);

  function toggle() {
    const root = document.documentElement;
    root.setAttribute("data-theme", root.getAttribute("data-theme") === "light" ? "dark" : "light");
  }

  return <button type="button" className="character-theme-toggle" onClick={toggle} aria-label="Switch between light and dark theme" title="Switch theme">
    <Sun className="character-theme-sun" size={16} aria-hidden="true" />
    <Moon className="character-theme-moon" size={16} aria-hidden="true" />
    <span>Switch theme</span>
  </button>;
}
