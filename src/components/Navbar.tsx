"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sun, Moon, User2, Briefcase, Cpu, FolderGit2, BookOpen, Mail, X, ChevronDown } from "lucide-react";
import { BLOGS } from "@/data/portfolio";

const LINKS = [
  { label: "About",         id: "about",         key: "1", icon: User2 },
  { label: "Experience",    id: "experience",    key: "2", icon: Briefcase },
  { label: "Skills",        id: "skills",        key: "3", icon: Cpu },
  { label: "Projects",      id: "projects",      key: "4", icon: FolderGit2 },
  { label: "Blog",          id: "blog",          key: "5", icon: BookOpen },
  { label: "Contact",       id: "contact",       key: "6", icon: Mail },
];

export default function Navbar() {
  const [active, setActive] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const io = useRef<IntersectionObserver | null>(null);
  const ignoreScroll = useRef(false);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === "/";

  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [mounted, setMounted] = useState(false);
  const userInteracted = useRef(false);

  // Blog dynamic chapter navigation states
  const [activeChapter, setActiveChapter] = useState(0);
  const [menuMode, setMenuMode] = useState<"main" | "chapters">("main");

  // Route detection & Chapter loading
  const pathParts = pathname.replace(/\/$/, "").split("/");
  const blogId = pathParts.length >= 3 && pathParts[1] === "blog" ? pathParts[2] : null;
  const currentBlog = blogId ? BLOGS.find(b => b.id === blogId) : null;
  const hasChapters = !!(currentBlog && currentBlog.chapters && currentBlog.chapters.length > 0);
  const chapters = currentBlog?.chapters || [];

  // Listen to custom event "blog-chapter-change"
  useEffect(() => {
    if (!hasChapters) return;

    const handleChapterChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (typeof customEvent.detail?.activeChapter === "number") {
        setActiveChapter(customEvent.detail.activeChapter);
      }
    };

    window.addEventListener("blog-chapter-change", handleChapterChange);
    return () => {
      window.removeEventListener("blog-chapter-change", handleChapterChange);
    };
  }, [hasChapters]);

  // Idea 1: Quick Reveal animation on initial load
  useEffect(() => {
    const handleInteraction = () => {
      userInteracted.current = true;
    };
    
    window.addEventListener("scroll", handleInteraction, { once: true, passive: true });
    window.addEventListener("mousedown", handleInteraction, { once: true, passive: true });
    window.addEventListener("keydown", handleInteraction, { once: true, passive: true });

    const timerOpen = setTimeout(() => {
      if (!userInteracted.current && window.scrollY < 50) {
        setIsOpen(true);
      }
    }, 1000); // Delay slightly to allow page load transitions to finish

    const timerClose = setTimeout(() => {
      if (!userInteracted.current) {
        setIsOpen(false);
      }
    }, 3200); // Stay open for 2.2 seconds

    return () => {
      window.removeEventListener("scroll", handleInteraction);
      window.removeEventListener("mousedown", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
      clearTimeout(timerOpen);
      clearTimeout(timerClose);
    };
  }, []);

  // Set active route highlights for sub-routes
  useEffect(() => {
    if (pathname.startsWith("/blog")) {
      setActive("blog");
    } else if (pathname.startsWith("/projects")) {
      setActive("projects");
    }
  }, [pathname]);

  // Calculate position in the semi-circular arc
  const getCoordinates = (index: number, total: number) => {
    const radius = 125; // px radius of the arc
    const startAngle = 165; // left-most angle (in degrees)
    const endAngle = 15; // right-most angle (in degrees)
    const angleStep = (endAngle - startAngle) / (total - 1);
    const angleRad = ((startAngle + index * angleStep) * Math.PI) / 180;
    
    const x = Math.round(radius * Math.cos(angleRad));
    const y = Math.round(-radius * Math.sin(angleRad)); // negative moves it UP
    
    return { x, y };
  };

  // Scroll Progress Listener (Universal across pages)
  useEffect(() => {
    const isSubRoute = pathname.startsWith("/blog") || pathname.startsWith("/projects");
    
    const handleProgress = () => {
      if (isSubRoute) {
        return;
      }
      
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const currentProgress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(currentProgress);
        sessionStorage.setItem("homeScrollProgress", currentProgress.toString());
      } else {
        setScrollProgress(0);
      }
    };
    
    if (isSubRoute) {
      const saved = sessionStorage.getItem("homeScrollProgress");
      if (saved) {
        setScrollProgress(parseFloat(saved));
      } else {
        const sectionId = pathname.startsWith("/blog") ? "blog" : "projects";
        const idx = LINKS.findIndex(l => l.id === sectionId);
        const ratio = idx !== -1 ? (idx / (LINKS.length - 1)) * 100 : 80;
        setScrollProgress(ratio);
      }
    } else {
      window.addEventListener("scroll", handleProgress, { passive: true });
      handleProgress();
    }
    
    return () => window.removeEventListener("scroll", handleProgress);
  }, [pathname]);

  // Auto-collapse radial menu on actual scroll
  useEffect(() => {
    if (!isOpen) return;

    const handleScrollCollapse = () => {
      setIsOpen(false);
    };

    window.addEventListener("scroll", handleScrollCollapse, { passive: true });
    return () => window.removeEventListener("scroll", handleScrollCollapse);
  }, [isOpen]);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const currentTheme =
      savedTheme ||
      (document.documentElement.getAttribute("data-theme") as "light" | "dark") ||
      "dark";
    
    const timer = setTimeout(() => {
      setTheme(currentTheme);
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);
  const navRef = useRef<HTMLDivElement | null>(null);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem("theme", nextTheme);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const go = (id: string) => {
    setActive(id);
    ignoreScroll.current = true;
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    scrollTimeout.current = setTimeout(() => {
      ignoreScroll.current = false;
    }, 1000);

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
        if (ignoreScroll.current) return;

        const isAtBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 15;
        if (isAtBottom) {
          setActive("contact");
          return;
        }

        for (const e of entries) {
          if (e.isIntersecting) setActive(e.target.id);
        }
      },
      { rootMargin: "-30% 0px -65% 0px" }
    );
    document.querySelectorAll("section[id], .hero").forEach((s) => io.current?.observe(s));

    const handleScroll = () => {
      if (ignoreScroll.current) return;

      const isAtBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 15;
      if (isAtBottom) {
        setActive("contact");
        return;
      }

      const sections = document.querySelectorAll("section[id]");
      const targetY = window.innerHeight * 0.35;
      
      for (const s of sections) {
        const rect = s.getBoundingClientRect();
        if (rect.top <= targetY && rect.bottom >= targetY) {
          setActive(s.id);
          break;
        }
      }
    };

    const handleScrollEnd = () => {
      ignoreScroll.current = false;
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    };

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

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("scrollend", handleScrollEnd);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      io.current?.disconnect();
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("scrollend", handleScrollEnd);
      window.removeEventListener("keydown", handleKeyDown);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHome]);

  const getChapterNumLabel = (index: number) => {
    return `CH ${String(index).padStart(2, "0")}`;
  };

  const getChapterTitleLabel = (chapterTitle?: string) => {
    if (!chapterTitle) return "";
    let cleanTitle = chapterTitle;
    if (cleanTitle.toLowerCase().startsWith("chapter") && cleanTitle.includes(":")) {
      cleanTitle = cleanTitle.split(":").slice(1).join(":").trim();
    }
    return cleanTitle;
  };

  const getSubArcCoordinates = (index: number, total: number) => {
    const radius = 80;
    if (total === 1) {
      return { x: 0, y: -radius };
    }
    const startAngle = 145; // left-most angle
    const endAngle = 35;   // right-most angle
    const angleStep = (endAngle - startAngle) / (total - 1);
    const angleRad = ((startAngle + index * angleStep) * Math.PI) / 180;
    
    const x = Math.round(radius * Math.cos(angleRad));
    const y = Math.round(-radius * Math.sin(angleRad)); // negative moves it UP
    
    return { x, y };
  };

  return (
    <nav 
      ref={navRef}
      className={`navbar-radial ${isOpen ? "open" : ""}`}
      role="navigation" 
      aria-label="Main Navigation"
    >
      {/* 6 Radial Section Buttons + Floating Theme Toggle */}
      <div className="radial-arc-container">
        {/* Main navigation links */}
        {LINKS.map((link, idx) => {
          const { x, y } = getCoordinates(idx, LINKS.length);
          const isLinkActive = active === link.id;
          const showLink = isOpen && (!hasChapters || menuMode === "main");
          
          return (
            <div
              key={link.id}
              className={`radial-item ${isLinkActive ? "active" : ""}`}
              style={{
                transform: showLink
                  ? `translate(${x}px, ${y}px) scale(1)` 
                  : `translate(0, 0) scale(0)`,
                opacity: showLink ? 1 : 0,
                transitionDelay: showLink ? `${idx * 20}ms` : "0ms",
                pointerEvents: showLink ? "auto" : "none",
              }}
            >
              {/* Tooltip showing label on hover */}
              <span className="radial-tooltip">{link.label}</span>
              
              {/* Button */}
              <button
                className="radial-btn"
                onClick={() => {
                  userInteracted.current = true;
                  go(link.id);
                  setIsOpen(false);
                }}
                aria-label={link.label}
              >
                <link.icon size={17} />
              </button>
            </div>
          );
        })}

        {/* Chapter navigation links */}
        {hasChapters && chapters.map((ch, idx) => {
          const { x, y } = getCoordinates(idx, chapters.length);
          const isActive = idx === activeChapter;
          const showChapter = isOpen && menuMode === "chapters";
          
          return (
            <div
              key={idx}
              className={`radial-item chapter-radial-item ${isActive ? "active" : ""}`}
              style={{
                transform: showChapter
                  ? `translate(${x}px, ${y}px) scale(1)` 
                  : `translate(0, 0) scale(0)`,
                opacity: showChapter ? 1 : 0,
                transitionDelay: showChapter ? `${idx * 20}ms` : "0ms",
                pointerEvents: showChapter ? "auto" : "none",
              }}
            >
              {/* Tooltip showing label on hover */}
              <span className="radial-tooltip">{getChapterTitleLabel(ch.title)}</span>
              
              {/* Button */}
              <button
                className="radial-btn chapter-radial-btn"
                onClick={() => {
                  userInteracted.current = true;
                  setActiveChapter(idx);
                  setIsOpen(false);
                  
                  // Scroll to target chapter section in the page
                  const element = document.getElementById(`chapter-${idx + 1}`);
                  if (element) {
                    element.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                aria-label={idx === 0 ? "Go to Intro" : idx === chapters.length - 1 ? "Go to Outro" : `Go to chapter ${idx}`}
              >
                {idx === 0 ? "I" : idx === chapters.length - 1 ? "O" : idx}
              </button>
            </div>
          );
        })}

        {/* Floating Theme Toggle (straight up at half-radius) */}
        <div
          className="radial-item radial-theme-float"
          style={{
            transform: isOpen 
              ? "translate(0px, -62px) scale(1)" 
              : "translate(0px, 0px) scale(0)",
            opacity: isOpen ? 1 : 0,
            transitionDelay: isOpen ? "120ms" : "0ms",
          }}
        >
          <span className="radial-tooltip">Theme</span>
          <button
            className="radial-btn"
            onClick={() => {
              userInteracted.current = true;
              toggleTheme();
            }}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {mounted && theme === "dark" ? (
              <Sun className="text-amber-400 animate-pulse-slow" size={16} />
            ) : mounted && theme === "light" ? (
              <Moon className="text-indigo-500" size={16} />
            ) : (
              <span style={{ width: 16, height: 16 }} />
            )}
          </button>
        </div>
      </div>

      {/* Central Interactive Toggle */}
      <div className="radial-center-wrap">
        {hasChapters && !isOpen ? (
          /* Alternative 2: Dual-Segment Pill wrapper */
          <div className="radial-central-control mode-pill dual-segment-pill">
            {/* Left Segment: Main Menu Toggle */}
            <button
              className="pill-segment-btn segment-left"
              onClick={() => {
                userInteracted.current = true;
                setMenuMode("main");
                setIsOpen(true);
              }}
              aria-label="Open main navigation menu"
            >
              <span className="radial-pill-text">
                {LINKS.find(l => l.id === active)?.label || "About"}
              </span>
              <div className="radial-pill-progress">
                <svg width="22" height="22" viewBox="0 0 24 24">
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                    className="progress-ring-bg"
                    fill="none"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                    className="progress-ring-fill"
                    fill="none"
                    strokeDasharray="56.54"
                    strokeDashoffset={56.54 - (scrollProgress / 100) * 56.54}
                    transform="rotate(-90 12 12)"
                  />
                </svg>
              </div>
            </button>

            {/* Vertical Divider */}
            <div className="pill-segment-divider" />

            {/* Right Segment: Active Chapter & Radial Arc Trigger */}
            <button
              className="pill-segment-btn segment-right"
              onClick={() => {
                userInteracted.current = true;
                setMenuMode("chapters");
                setIsOpen(true);
              }}
              aria-label="Open chapter navigation menu"
            >
              {activeChapter === 0 || activeChapter === chapters.length - 1 ? (
                /* Intro or Outro: Just the title alone */
                <span className="chapter-pill-title chapter-pill-title-solo">
                  {getChapterTitleLabel(chapters[activeChapter]?.title)}
                </span>
              ) : (
                /* Standard Chapter: Number and Title */
                <>
                  <span className="chapter-pill-num">
                    {getChapterNumLabel(activeChapter)}
                  </span>
                  <span className="chapter-pill-divider"> : </span>
                  <span className="chapter-pill-title">
                    {getChapterTitleLabel(chapters[activeChapter]?.title)}
                  </span>
                </>
              )}
              <ChevronDown size={12} className="chapter-pill-chevron" />
            </button>
          </div>
        ) : (
          /* Standard Single Pill/Circle button */
          <button
            className={`radial-central-control ${isOpen ? "mode-circle" : "mode-pill"}`}
            onClick={() => {
              userInteracted.current = true;
              if (isOpen) {
                setIsOpen(false);
              } else {
                setMenuMode("main");
                setIsOpen(true);
              }
            }}
            aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
          >
            {/* Collapsed Pill Content */}
            <div 
              className="content-pill" 
              style={{ 
                opacity: isOpen ? 0 : 1,
                pointerEvents: isOpen ? "none" : "auto"
              }}
            >
              <span className="radial-pill-text">
                {LINKS.find(l => l.id === active)?.label || "About"}
              </span>
              <div className="radial-pill-progress">
                <svg width="22" height="22" viewBox="0 0 24 24">
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                    className="progress-ring-bg"
                    fill="none"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                    className="progress-ring-fill"
                    fill="none"
                    strokeDasharray="56.54"
                    strokeDashoffset={56.54 - (scrollProgress / 100) * 56.54}
                    transform="rotate(-90 12 12)"
                  />
                </svg>
              </div>
            </div>

            {/* Expanded Circle Content */}
            <div 
              className="content-circle" 
              style={{ 
                opacity: isOpen ? 1 : 0,
                pointerEvents: isOpen ? "auto" : "none"
              }}
            >
              <X size={17} />
            </div>
          </button>
        )}
      </div>
    </nav>
  );
}
