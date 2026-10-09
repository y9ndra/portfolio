"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { PROJECTS } from "@/data/portfolio";
import { GH, LiveIcon, NPMIcon } from "@/components/ProjectCard";

export { GH, LiveIcon, NPMIcon };

const ArrowLeftNav = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M10 3L5 8l5 5" />
  </svg>
);

const ArrowRightNav = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M6 3l5 5-5 5" />
  </svg>
);

const ArrowRight = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M3 8h10M9 4l4 4-4 4" />
  </svg>
);

export default function Projects() {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});
  const [cursorTilt, setCursorTilt] = useState({ x: 0, y: 0 });
  const [fanExtra, setFanExtra] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(1024);

  useEffect(() => {
    const handleResize = () => {
      setViewportWidth(window.innerWidth);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const stageRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);
  const dragStartX = useRef<number | null>(null);
  const hasSwiped = useRef(false);

  const projects = PROJECTS.slice(0, 3);
  const total = projects.length;
  const [prevActiveIndex, setPrevActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPrevActiveIndex(activeIndex);
    }, 600);
    return () => clearTimeout(timer);
  }, [activeIndex]);

  const handlePrev = useCallback(() => {
    setPrevActiveIndex(activeIndex);
    setActiveIndex((prev) => (prev - 1 + total) % total);
  }, [activeIndex, total]);

  const handleNext = useCallback(() => {
    setPrevActiveIndex(activeIndex);
    setActiveIndex((prev) => (prev + 1) % total);
  }, [activeIndex, total]);

  const handleCardClick = (e: React.MouseEvent, index: number, id: string) => {
    const target = e.target as HTMLElement;
    if (target.closest(".proj-actions") || target.closest("a") || target.closest("button")) {
      return;
    }
    if (hasSwiped.current) {
      e.preventDefault();
      return;
    }
    if (index === activeIndex) {
      router.push(`/projects/${id}`);
    } else {
      e.preventDefault();
      setPrevActiveIndex(activeIndex);
      setActiveIndex(index);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number, id: string) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (index === activeIndex) {
        router.push(`/projects/${id}`);
      } else {
        setPrevActiveIndex(activeIndex);
        setActiveIndex(index);
      }
    }
  };

  // Keyboard left/right arrow navigation when projects section is in view
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          activeEl.getAttribute("contenteditable") === "true")
      ) {
        return;
      }

      const stage = stageRef.current;
      if (!stage) return;
      const rect = stage.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      if (!inView) return;

      if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleNext, handlePrev]);

  // Pointer drag & 3D tilt tracking
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (target.closest("a") || target.closest("button")) {
      return;
    }
    dragStartX.current = e.clientX;
    hasSwiped.current = false;
    setIsDragging(true);
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (dragStartX.current !== null) {
      const deltaX = e.clientX - dragStartX.current;
      if (Math.abs(deltaX) > 15) {
        hasSwiped.current = true;
      }
      setDragOffset(deltaX);
    }

    const stage = stageRef.current;
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    const normX = (e.clientX - rect.left) / rect.width - 0.5;
    const normY = (e.clientY - rect.top) / rect.height - 0.5;

    const target = e.target as HTMLElement;
    if (target.closest(".proj-actions") || target.closest("a") || target.closest("button")) {
      setCursorTilt({ x: 0, y: 0 });
    } else {
      setCursorTilt({
        x: Math.round(-normY * 4.5),
        y: Math.round(normX * 5),
      });
    }
    setFanExtra(Math.abs(normX) * 1.5);

    if (glareRef.current) {
      const cardRect = glareRef.current.getBoundingClientRect();
      const px = Math.round(((e.clientX - cardRect.left) / cardRect.width) * 100);
      const py = Math.round(((e.clientY - cardRect.top) / cardRect.height) * 100);
      glareRef.current.style.background = `radial-gradient(circle 380px at ${px}% ${py}%, var(--card-glare-color, rgba(255,255,255,0.18)), transparent 68%)`;
      glareRef.current.style.opacity = "1";
    }
  };

  const handlePointerUp = (e?: React.PointerEvent) => {
    if (e && e.currentTarget) {
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
    }
    if (dragStartX.current !== null) {
      if (dragOffset < -40) {
        handleNext();
      } else if (dragOffset > 40) {
        handlePrev();
      }
    }
    dragStartX.current = null;
    setDragOffset(0);
    setIsDragging(false);
    setTimeout(() => {
      hasSwiped.current = false;
    }, 60);
  };

  const handlePointerLeave = (e: React.PointerEvent) => {
    handlePointerUp(e);
    setCursorTilt({ x: 0, y: 0 });
    setFanExtra(0);
    if (glareRef.current) {
      glareRef.current.style.opacity = "0";
    }
  };

  // Touch swipe support for mobile devices
  const handleTouchStart = (e: React.TouchEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("a") || target.closest("button")) {
      return;
    }
    dragStartX.current = e.touches[0].clientX;
    hasSwiped.current = false;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (dragStartX.current === null) return;
    const deltaX = e.touches[0].clientX - dragStartX.current;
    if (Math.abs(deltaX) > 15) {
      hasSwiped.current = true;
    }
    setDragOffset(deltaX);
  };

  const handleTouchEnd = () => {
    handlePointerUp();
  };

  return (
    <section id="projects" className="section" aria-label="Projects">
      <div className="wrap">

        <div className="section-head section-head-split" data-reveal>
          <span className="section-title">Projects</span>
          <div className="proj-deck-controls">
            <button
              type="button"
              className="proj-deck-nav-btn"
              onClick={handlePrev}
              aria-label="Previous project"
              title="Previous project"
            >
              <ArrowLeftNav />
            </button>
            <button
              type="button"
              className="proj-deck-nav-btn"
              onClick={handleNext}
              aria-label="Next project"
              title="Next project"
            >
              <ArrowRightNav />
            </button>
          </div>
        </div>

        <div className="proj-deck-wrap" data-reveal data-delay="1">

          {/* 3D Arc Fan Stage with Swipe & Drag Interaction */}
          <div
            ref={stageRef}
            className={`proj-deck-stage ${isDragging ? "dragging" : ""}`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerLeave}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onDragStart={(e) => e.preventDefault()}
          >
            {/* Natural Height Spacer for responsive container sizing */}
            <div className="proj-deck-spacer" aria-hidden="true">
              <div className="proj-item proj-deck-item corner-box" style={{ visibility: "hidden", pointerEvents: "none" }}>
                <div className="proj-deck-banner-wrap">
                  <div className="proj-deck-banner" />
                </div>
                <div className="proj-body proj-deck-body">
                  <div className="proj-row">
                    <h3 className="proj-name">{PROJECTS[2].title}</h3>
                    <div className="proj-actions">
                      <span className="proj-live-btn"><LiveIcon /> <span className="btn-label">Live</span></span>
                      <span className="proj-gh-btn"><GH /> <span className="btn-label">GitHub</span></span>
                    </div>
                  </div>
                  <p className="proj-desc">{PROJECTS[0].description}</p>
                  <div className="proj-tech-section">
                    <span className="proj-tech-label">Technologies Used:</span>
                    <div className="proj-tags">
                      <span className="proj-tag">TypeScript</span>
                      <span className="proj-tag">React 19</span>
                      <span className="proj-tag">Node.js</span>
                      <span className="proj-tag">Socket.IO</span>
                      <span className="proj-tag">Redis</span>
                      <span className="proj-tag">+20 more</span>
                    </div>
                  </div>
                  <span className="proj-view-more">View details →</span>
                </div>
              </div>
            </div>

            {/* 3D Stacked Cards: Stable DOM order to prevent DOM-reordering transition glitches */}
            {projects.map((p, i) => {
              const diff = (i - activeIndex + total) % total;
              const isFront = diff === 0;
              const isRight = diff === 1;
              const isLeft = diff === 2;
              const isExiting = i === prevActiveIndex && !isFront;

              // Normalized drag progress (-1 to 1) along the triangle
              const dragProgress = Math.max(-1, Math.min(1, dragOffset / 180));

              let x = 0;
              let y = 0;
              let z = 35;
              let rotZ = 0;
              let scale = 0.91;
              let opacity = 1;
              let zIndex = isFront ? 60 : isExiting ? 25 : 10;
              let boxShadow = "0 20px 42px rgba(0, 0, 0, 0.48), 0 0 0 1px var(--border-h)";

              const isMobile = viewportWidth < 640;
              const wingOffset = viewportWidth >= 640
                ? 56
                : viewportWidth <= 360
                ? 44
                : 52;
              const wingRot = 5;

              if (isDragging && dragOffset !== 0) {
                // Interactive Triangle Carousel: all 3 cards move synchronously during drag!
                if (dragProgress > 0) {
                  // User dragging RIGHT:
                  // Mid -> Right, Right -> Left (across back), Left -> Mid
                  const pNorm = dragProgress;
                  if (isFront) {
                    x = Math.round(dragOffset * 0.72);
                    y = Math.round(pNorm * 6);
                    z = Math.round(35 - pNorm * 80);
                    rotZ = Number((pNorm * wingRot).toFixed(2));
                    scale = Number((0.91 + pNorm * 0.02).toFixed(3));
                    opacity = Number((1 - pNorm * 0.45).toFixed(2));
                  } else if (isRight) {
                    x = Math.round(wingOffset - pNorm * (wingOffset * 2));
                    y = 6;
                    z = -45;
                    rotZ = Number((wingRot - pNorm * (wingRot * 2)).toFixed(2));
                    scale = 0.93;
                    opacity = 0.55;
                    boxShadow = "0 10px 24px rgba(0, 0, 0, 0.3)";
                  } else if (isLeft) {
                    x = Math.round(-wingOffset + pNorm * wingOffset);
                    y = Math.round(6 - pNorm * 6);
                    z = Math.round(-45 + pNorm * 80);
                    rotZ = Number((-wingRot + pNorm * wingRot).toFixed(2));
                    scale = Number((0.93 - pNorm * 0.02).toFixed(3));
                    opacity = Number((0.55 + pNorm * 0.45).toFixed(2));
                    zIndex = 40; // Rising Left card comes forward
                    boxShadow = "0 10px 24px rgba(0, 0, 0, 0.3)";
                  }
                } else {
                  // User dragging LEFT:
                  // Mid -> Left, Left -> Right (across back), Right -> Mid
                  const mag = -dragProgress;
                  if (isFront) {
                    x = Math.round(dragOffset * 0.72);
                    y = Math.round(mag * 6);
                    z = Math.round(35 - mag * 80);
                    rotZ = Number((-mag * wingRot).toFixed(2));
                    scale = Number((0.91 + mag * 0.02).toFixed(3));
                    opacity = Number((1 - mag * 0.45).toFixed(2));
                  } else if (isLeft) {
                    x = Math.round(-wingOffset + mag * (wingOffset * 2));
                    y = 6;
                    z = -45;
                    rotZ = Number((-wingRot + mag * (wingRot * 2)).toFixed(2));
                    scale = 0.93;
                    opacity = 0.55;
                    boxShadow = "0 10px 24px rgba(0, 0, 0, 0.3)";
                  } else if (isRight) {
                    x = Math.round(wingOffset - mag * wingOffset);
                    y = Math.round(6 - mag * 6);
                    z = Math.round(-45 + mag * 80);
                    rotZ = Number((wingRot - mag * wingRot).toFixed(2));
                    scale = Number((0.93 - mag * 0.02).toFixed(3));
                    opacity = Number((0.55 + mag * 0.45).toFixed(2));
                    zIndex = 40; // Rising Right card comes forward
                    boxShadow = "0 10px 24px rgba(0, 0, 0, 0.3)";
                  }
                }
              } else {
                // Resting positions with subtle hover fan expansion:
                if (isFront) {
                  x = 0;
                  y = 0;
                  z = 35;
                  rotZ = 0;
                  scale = 0.91;
                  opacity = 1;
                  boxShadow = "0 20px 42px rgba(0, 0, 0, 0.48), 0 0 0 1px var(--border-h)";
                } else if (isRight) {
                  x = Math.round(wingOffset + (isMobile ? 0 : fanExtra * 14));
                  y = 6;
                  z = -45;
                  rotZ = Number((wingRot + (isMobile ? 0 : fanExtra * 1.5)).toFixed(2));
                  scale = 0.93;
                  opacity = 0.55;
                  boxShadow = "0 10px 24px rgba(0, 0, 0, 0.3)";
                } else if (isLeft) {
                  x = Math.round(-wingOffset - (isMobile ? 0 : fanExtra * 14));
                  y = 6;
                  z = -45;
                  rotZ = Number((-wingRot - (isMobile ? 0 : fanExtra * 1.5)).toFixed(2));
                  scale = 0.93;
                  opacity = 0.55;
                  boxShadow = "0 10px 24px rgba(0, 0, 0, 0.3)";
                }
              }

              // Apply subtle cursor 3D tilt
              const tiltX = isFront ? cursorTilt.x : Math.round(cursorTilt.x * 0.25);
              const tiltY = isFront ? cursorTilt.y : Math.round(cursorTilt.y * 0.25);
              const transform = `translate3d(${x}px, ${y}px, ${z}px) rotateZ(${rotZ}deg) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(${scale})`;

              const imgErr = !!imgErrors[p.id];
              const showImg = !!p.image && !imgErr;

              return (
                <div
                  key={p.id}
                  role="button"
                  tabIndex={0}
                  onClick={(e) => handleCardClick(e, i, p.id)}
                  onKeyDown={(e) => handleKeyDown(e, i, p.id)}
                  className={`proj-deck-card-wrap ${isFront ? "front" : "wing"}${isExiting ? " exiting" : ""}`}
                  style={{
                    transform,
                    zIndex,
                    opacity,
                    boxShadow,
                    transition: isDragging
                      ? "none"
                      : "transform 0.55s cubic-bezier(0.2, 0.9, 0.3, 1), opacity 0.5s ease, box-shadow 0.45s ease",
                  }}
                  aria-label={`${p.title} project card${isFront ? " (active)" : ""}`}
                >
                  <article id={`proj-deck-${p.id}`} className="proj-item proj-deck-item corner-box tilt-card">
                    {/* Active card glare sheen */}
                    {isFront && <div ref={glareRef} className="card-glare" aria-hidden="true" />}

                    {/* Top: Full-width Banner Image */}
                    <div className="proj-deck-banner-wrap">
                      {showImg ? (
                        <div className="proj-deck-banner">
                          <Image
                            src={p.image}
                            alt={p.title}
                            fill
                            sizes="(max-width: 768px) 100vw, 650px"
                            style={{ objectFit: "cover" }}
                            onError={() => setImgErrors((prev) => ({ ...prev, [p.id]: true }))}
                            priority={i === 0}
                            draggable={false}
                          />
                        </div>
                      ) : (
                        <div className="proj-deck-banner proj-deck-banner-empty">
                          <span className="proj-img-placeholder">No Preview</span>
                        </div>
                      )}
                    </div>

                    {/* Bottom: Content Body */}
                    <div className="proj-body proj-deck-body">
                      <div className="proj-row">
                        <h3 className="proj-name">{p.title}</h3>
                        <div className="proj-actions">
                          {p.demo && p.demo !== "#" && (
                            <a
                              href={p.demo}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="proj-live-btn"
                              aria-label={`${p.title} ${p.demo.includes("npmjs.com") ? "npm Package" : "Live Demo"}`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              {p.demo.includes("npmjs.com") ? <NPMIcon /> : <LiveIcon />}
                              <span className="btn-label">{p.demo.includes("npmjs.com") ? "npm" : "Live"}</span>
                            </a>
                          )}
                          {p.github && p.github !== "#" && (
                            <a
                              href={p.github}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="proj-gh-btn"
                              aria-label={`${p.title} GitHub`}
                              id={`proj-deck-${p.id}-gh`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <GH /> <span className="btn-label">GitHub</span>
                            </a>
                          )}
                        </div>
                      </div>

                      <p className="proj-desc">{p.description}</p>

                      <div className="proj-tech-section">
                        <span className="proj-tech-label">Technologies Used:</span>
                        <div className="proj-tags">
                          {p.tech.slice(0, 6).map((t) => (
                            <span key={t} className="proj-tag">
                              {t}
                            </span>
                          ))}
                          {p.tech.length > 6 && (
                            <span className="proj-tag proj-tag-more" title={p.tech.slice(6).join(", ")}>
                              +{p.tech.length - 6} more
                            </span>
                          )}
                        </div>
                      </div>

                      <span className="proj-view-more">View details →</span>
                    </div>
                  </article>
                </div>
              );
            })}
          </div>

        </div>

        {/* Compact Right-Aligned All Projects Link */}
        <div className="proj-view-all-wrap" data-reveal>
          <Link href="/projects" className="btn btn-line proj-view-all-btn">
            <span className="btn-label">All Projects</span>
            <ArrowRight />
          </Link>
        </div>

      </div>
    </section>
  );
}
