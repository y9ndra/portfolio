"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sun, Moon } from "lucide-react";

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
  const router = useRouter();
  const isHome = pathname === "/";

  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const currentTheme =
      savedTheme ||
      (document.documentElement.getAttribute("data-theme") as "light" | "dark") ||
      "dark";
    setTheme(currentTheme);
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem("theme", nextTheme);
  };

  const go = (id: string) => {
    if (isHome) {
      if (id === "hero") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      router.push(`/#${id}`);
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
          <li className="dock-item">
            <span className="dock-sep" />
          </li>
          <li className="dock-item">
            <button
              className="theme-toggle-btn"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              {mounted && theme === "dark" ? (
                <Sun className="theme-toggle-icon text-amber-400 animate-pulse-slow" size={15} />
              ) : mounted && theme === "light" ? (
                <Moon className="theme-toggle-icon text-indigo-500" size={15} />
              ) : (
                <span style={{ width: 15, height: 15 }} />
              )}
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
}
