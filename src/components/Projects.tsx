"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { PROJECTS } from "@/data/portfolio";
import { GH, LiveIcon, NPMIcon } from "@/components/ProjectCard";
import "./ProjectCircle.css";

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


const projects = PROJECTS.slice(0, 3);

export default function Projects() {
  const router = useRouter();
  const [rotation, setRotation] = useState(0);
  const [dragAngle, setDragAngle] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});
  const stageRef = useRef<HTMLDivElement>(null);
  const start = useRef<{x: number; y: number; offset: number; time: number; lastX: number; lastTime: number; velocity: number} | null>(null);
  const swiped = useRef(false);
  const activeIndex = ((-rotation % projects.length) + projects.length) % projects.length;

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        const saved = Number(sessionStorage.getItem("home_active_project_index"));
        if (Number.isInteger(saved) && saved > 0 && saved < projects.length) {
          setRotation(-saved);
        }
      } catch {}
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const rotate = useCallback((step: number) => {
    setRotation(current => {
      const next = current + step;
      const index = ((-next % projects.length) + projects.length) % projects.length;
      try { sessionStorage.setItem("home_active_project_index", String(index)); } catch {}
      return next;
    });
  }, []);

  useEffect(() => {
    function key(event: KeyboardEvent) {
      const target = event.target as HTMLElement;
      if (target.closest("input, textarea, select, [contenteditable=true]")) return;
      const rect = stageRef.current?.getBoundingClientRect();
      if (!rect || rect.top >= innerHeight || rect.bottom <= 0) return;
      if (event.key === "ArrowLeft") { event.preventDefault(); rotate(1); }
      if (event.key === "ArrowRight") { event.preventDefault(); rotate(-1); }
    }
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [rotate]);

  function openProject(event: React.MouseEvent, index: number, id: string) {
    if (swiped.current || (event.target as HTMLElement).closest("a, button")) return;
    if (index !== activeIndex) {
      rotate((index - activeIndex + projects.length) % projects.length === 1 ? -1 : 1);
      return;
    }
    try {
      sessionStorage.setItem("projects_back_url", "/#projects");
      sessionStorage.setItem("home_active_project_index", String(index));
    } catch {}
    if (event.metaKey || event.ctrlKey) window.open(`/projects/${id}`, "_blank");
    else router.push(`/projects/${id}`);
  }

  function pointerDown(event: React.PointerEvent) {
    if (event.button !== 0 || (event.target as HTMLElement).closest("a, button")) return;
    const ring = stageRef.current?.querySelector(".project-circle-ring");
    let offset = 0;
    if (ring) {
      const matrix = new DOMMatrixReadOnly(getComputedStyle(ring).transform);
      const angle = Math.atan2(-matrix.m13, matrix.m11) * 180 / Math.PI;
      const target = rotation * 120;
      const currentAngle = angle + Math.round((target - angle) / 360) * 360;
      offset = currentAngle - target;
    }
    start.current = { x: event.clientX, y: event.clientY, offset, time: event.timeStamp, lastX: event.clientX, lastTime: event.timeStamp, velocity: 0 };
    swiped.current = false;
  }
  function pointerMove(event: React.PointerEvent) {
    if (!start.current) return;
    const dx = event.clientX - start.current.x;
    const dy = event.clientY - start.current.y;
    if (!swiped.current && (Math.abs(dx) < 8 || Math.abs(dx) <= Math.abs(dy))) return;
    if (!swiped.current) {
      swiped.current = true;
      setDragging(true);
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    const elapsed = event.timeStamp - start.current.lastTime;
    if (elapsed > 0) {
      start.current.velocity = (event.clientX - start.current.lastX) / elapsed;
      start.current.lastX = event.clientX;
      start.current.lastTime = event.timeStamp;
    }
    const width = event.currentTarget.clientWidth;
    setDragAngle(start.current.offset + dx / Math.max(width * 0.45, 1) * 120);
  }
  function pointerUp(event: React.PointerEvent) {
    if (!start.current) return;
    const dx = event.clientX - start.current.x;
    const dy = event.clientY - start.current.y;
    const gesture = start.current;
    start.current = null;
    if (swiped.current && Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      const width = event.currentTarget.clientWidth;
      const velocity = event.timeStamp - gesture.lastTime < 100 ? gesture.velocity : 0;
      const projected = gesture.offset + (dx + velocity * 140) / Math.max(width * 0.45, 1) * 120;
      let steps = Math.round(projected / 120);
      if (steps === 0 && Math.abs(gesture.offset) < 30) steps = dx > 0 ? 1 : -1;
      rotate(steps);
    }
    setDragging(false);
    setDragAngle(0);
  }

  return (
    <section id="projects" className="section" aria-label="Projects">
      <div className="wrap">
        <div className="section-head section-head-split" data-reveal>
          <span className="section-title">Projects</span>
          <div className="proj-deck-controls">
            <button type="button" className="proj-deck-nav-btn" onClick={() => rotate(1)} aria-label="Previous project" title="Previous project"><ArrowLeftNav /></button>
            <button type="button" className="proj-deck-nav-btn" onClick={() => rotate(-1)} aria-label="Next project" title="Next project"><ArrowRightNav /></button>
          </div>
        </div>
        <div className="proj-deck-wrap" data-reveal data-delay="1">
          <div ref={stageRef} className={`project-circle-stage${dragging ? " is-dragging" : ""}`} onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={() => { start.current = null; setDragging(false); setDragAngle(0); }} onDragStart={event => event.preventDefault()}>
            <div className="project-circle-sizing" aria-hidden="true">
              {projects.map(p => <div className="proj-item proj-deck-item corner-box" key={p.id}>
                <div className="proj-deck-banner-wrap"><div className="proj-deck-banner" /></div>
                <div className="proj-body proj-deck-body">
                  <div className="proj-row"><h3 className="proj-name">{p.title}</h3><div className="proj-actions">{p.demo && p.demo !== "#" && <span className="proj-live-btn"><LiveIcon /> <span className="btn-label">Live</span></span>}{p.github && p.github !== "#" && <span className="proj-gh-btn"><GH /> <span className="btn-label">GitHub</span></span>}</div></div>
                  <p className="proj-desc">{p.description}</p>
                  <div className="proj-tech-section"><span className="proj-tech-label">Technologies Used:</span><div className="proj-tags">{p.tech.slice(0, 6).map(t => <span key={t} className="proj-tag">{t}</span>)}{p.tech.length > 6 && <span className="proj-tag">+{p.tech.length - 6} more</span>}</div></div>
                  <span className="proj-view-more">View details →</span>
                </div>
              </div>)}
            </div>
            <div className="project-circle-ring" style={{ transform: `translateZ(calc(-1 * var(--project-radius))) rotateY(${rotation * 120 + dragAngle}deg)` }}>
              {projects.map((p, i) => {
                const isFront = i === activeIndex;
                const imgErr = !!imgErrors[p.id];
                const showImg = !!p.image && !imgErr;
                return <div className="project-circle-position" key={p.id} style={{ transform: `rotateY(${i * 120}deg) translateZ(var(--project-radius))` }}>
                  <div className={`proj-deck-card-wrap project-circle-card ${isFront ? "front" : "wing"}`}
                    style={{ transform: `rotateY(${-(i * 120 + rotation * 120 + dragAngle)}deg)` }}
                    role="button" tabIndex={0} aria-label={`${p.title} project card${isFront ? " (active)" : ""}`}
                    onClick={event => openProject(event, i, p.id)}
                    onKeyDown={event => { if (event.target === event.currentTarget && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); event.currentTarget.click(); } }}>
                  <article id={`proj-deck-${p.id}`} className="proj-item proj-deck-item corner-box tilt-card">

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
                </div>;
              })}
            </div>
          </div>
        </div>
        <div className="proj-view-all-wrap" data-reveal><Link href="/projects" className="btn btn-line proj-view-all-btn"><span className="btn-label">All Projects</span><ArrowRight /></Link></div>
      </div>
    </section>
  );
}
