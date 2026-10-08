"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCardTilt } from "@/hooks/useCardTilt";
import type { PROJECTS } from "@/data/portfolio";

export const GH = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

export const LiveIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="globe-icon">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
    <path d="M2 12h20" />
  </svg>
);

export const NPMIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden className="npm-icon">
    <path d="M1.763 0C.786 0 0 .786 0 1.763v20.474C0 23.214.786 24 1.763 24h20.474c.977 0 1.763-.786 1.763-1.763V1.763C24 .786 23.214 0 22.237 0zM5.13 5.323l13.837.019-.009 13.836h-3.464l.01-10.382h-3.456L12.04 19.17H5.113z" />
  </svg>
);

export type ProjectCardProps = (typeof PROJECTS)[number] & { delay?: string };

export function ProjectCard({ id, title, description, tech, github, demo, image, delay = "1" }: ProjectCardProps) {
  const router = useRouter();
  const [imgErr, setImgErr] = useState(false);
  const showImg = !!image && !imgErr;
  const { cardRef, glareRef } = useCardTilt<HTMLElement>();

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent navigation if click was on a button or link
    const target = e.target as HTMLElement;
    if (target.closest("a") || target.closest("button")) {
      return;
    }
    router.push(`/projects/${id}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      router.push(`/projects/${id}`);
    }
  };

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      className="proj-card-link"
      aria-label={`View ${title} details`}
      style={{ cursor: "pointer" }}
      data-reveal
      data-delay={delay}
    >
      <article
        ref={cardRef}
        id={`proj-${id}`}
        className="proj-item corner-box tilt-card"
      >
        <div ref={glareRef} className="card-glare" aria-hidden="true" />
        {/* Left: image */}
        <div className="proj-img-col">
          {showImg ? (
            <div className="proj-img-wrap">
              <Image
                src={image}
                alt={title}
                fill
                sizes="(max-width: 768px) 100vw, 240px"
                style={{ objectFit: "contain" }}
                onError={() => setImgErr(true)}
              />
            </div>
          ) : (
            <div className="proj-img-wrap proj-img-empty">
              <span className="proj-img-placeholder">No Preview</span>
            </div>
          )}
        </div>

        {/* Right: content */}
        <div className="proj-body">
          <div className="proj-row">
            <h3 className="proj-name">{title}</h3>
            <div className="proj-actions">
              {demo && demo !== "#" && (
                <a
                  href={demo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="proj-live-btn"
                  aria-label={`${title} ${demo.includes("npmjs.com") ? "npm Package" : "Live Demo"}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  {demo.includes("npmjs.com") ? <NPMIcon /> : <LiveIcon />} <span className="btn-label">{demo.includes("npmjs.com") ? "npm" : "Live"}</span>
                </a>
              )}
              {github && github !== "#" && (
                <a
                  href={github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="proj-gh-btn"
                  aria-label={`${title} GitHub`}
                  id={`proj-${id}-gh`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <GH /> <span className="btn-label">GitHub</span>
                </a>
              )}
            </div>
          </div>
          <p className="proj-desc">{description}</p>
          <div className="proj-tech-section">
            <span className="proj-tech-label">Technologies Used:</span>
            <div className="proj-tags">
              {tech.slice(0, 6).map((t) => <span key={t} className="proj-tag">{t}</span>)}
              {tech.length > 6 && (
                <span className="proj-tag proj-tag-more" title={tech.slice(6).join(", ")}>
                  +{tech.length - 6} more
                </span>
              )}
            </div>
          </div>
          <span className="proj-view-more">View details →</span>
        </div>
      </article>
    </div>
  );
}
