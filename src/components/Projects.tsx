"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { PROJECTS } from "@/data/portfolio";

const GH = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

type ProjectCardProps = (typeof import("@/data/portfolio").PROJECTS)[number] & { delay: string };

function ProjectCard({ id, title, description, tech, github, demo, image, delay }: ProjectCardProps) {
  const router = useRouter();
  const [imgErr, setImgErr] = useState(false);
  const showImg = !!image && !imgErr;

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
    >
      <article
        id={`proj-${id}`}
        className="proj-item corner-box"
        data-reveal
        data-delay={delay}
      >
        {/* Left: image */}
        <div className="proj-img-col">
          {showImg ? (
            <div className="proj-img-wrap">
              <Image
                src={image}
                alt={title}
                fill
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
                  className="proj-gh-btn"
                  aria-label={`${title} Live Demo`}
                  onClick={(e) => e.stopPropagation()}
                >
                  Live
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
                  <GH /> GitHub
                </a>
              )}
            </div>
          </div>
          <p className="proj-desc">{description}</p>
          <div className="proj-tech-section">
            <span className="proj-tech-label">Technologies Used:</span>
            <div className="proj-tags">
              {tech.map((t) => <span key={t} className="proj-tag">{t}</span>)}
            </div>
          </div>
          <span className="proj-view-more">View details →</span>
        </div>
      </article>
    </div>
  );
}

export default function Projects() {
  return (
    <section id="projects" className="section" aria-label="Projects">
      <div className="wrap">

        <div className="section-head" data-reveal>
          <span className="section-title">Projects</span>
          <div className="section-rule" />
        </div>

        <div className="proj-list">
          {PROJECTS.map((p, i) => (
            <ProjectCard key={p.id} {...p} delay={String((i % 3) + 1)} />
          ))}
        </div>

      </div>
    </section>
  );
}
