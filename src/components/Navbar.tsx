"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const LINKS = [
  { label: "About",         id: "about",         key: "1" },
  { label: "Experience",    id: "experience",    key: "2" },
  { label: "Skills",        id: "skills",        key: "3" },
  { label: "Projects",      id: "projects",      key: "4" },
  { label: "Contact",       id: "contact",       key: "5" },
];

export default function Navbar() {
  const [active, setActive] = useState("");
  const io = useRef<IntersectionObserver | null>(null);
  const pathname = usePathname();
  const isHome = pathname === "/";

  const go = (id: string) => {
    if (isHome) {
      if (id === "hero") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      window.location.href = `/#${id}`;
    }
  };

  useEffect(() => {
    if (!isHome) return;

    io.current = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(e.target.id);
        }
      },
      { rootMargin: "-30% 0px -65% 0px" }
    );
    document.querySelectorAll("section[id], .hero").forEach((s) => io.current?.observe(s));

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          activeEl.getAttribute("contenteditable") === "true")
      ) {
        return;
      }

      const link = LINKS.find((l) => l.key === e.key);
      if (link) {
        e.preventDefault();
        go(link.id);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      io.current?.disconnect();
      window.removeEventListener("keydown", handleKeyDown);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHome]);

  return (
    <nav className="navbar-dock">
      <div className="dock-inner">
        <ul className="dock-links">
          {LINKS.map(({ label, id }) => (
            <li key={id} className="dock-item">
              <button
                className={`dock-link${active === id ? " active" : ""}`}
                onClick={() => go(id)}
              >
                <span className="dock-label">{label}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
