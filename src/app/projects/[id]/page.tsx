import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PROJECTS } from "@/data/portfolio";

export async function generateStaticParams() {
  return PROJECTS.map((p) => ({ id: p.id }));
}

const GH = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

const ArrowLeft = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M10 3L5 8l5 5" />
  </svg>
);

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = PROJECTS.find((p) => p.id === id);

  if (!project) notFound();

  return (
    <main className="proj-detail-main">

      {/* Back button — aligned to main page width */}
      <div className="wrap">
        <div className="proj-detail-back-wrap a0">
          <Link href="/#projects" className="proj-detail-back">
            <ArrowLeft /> Back to Projects
          </Link>
        </div>
      </div>

      {/* Banner image — aligned to main page width */}
      {project.image && (
        <div className="wrap a1">
          <div className="proj-detail-banner">
            <Image
              src={project.image}
              alt={project.title}
              fill
              style={{ objectFit: "contain" }}
              priority
            />
            <div className="proj-detail-banner-overlay" />
          </div>
        </div>
      )}

      {/* Content — constrained to --w like main page */}
      <div className="wrap">
        <div className="proj-detail-content">

          {/* Header */}
          <div className="proj-detail-header a2">
            <div className="proj-detail-title-row">
              <h1 className="proj-detail-title">{project.title}</h1>
              {"year" in project && (
                <span className="proj-detail-year">{(project as { year?: string }).year}</span>
              )}
            </div>
            <p className="proj-detail-desc">{project.description}</p>

            {/* Action buttons */}
            <div className="proj-detail-actions">
              {project.github && project.github !== "#" && (
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="proj-detail-gh-btn"
                >
                  <GH /> View on GitHub
                </a>
              )}
              {project.demo && project.demo !== "#" && (
                <a
                  href={project.demo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="proj-detail-gh-btn"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden style={{ marginRight: "0.25rem" }}>
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                  Live Demo
                </a>
              )}
            </div>
          </div>

          {/* Tech stack */}
          <div className="proj-detail-section a2">
            <h2 className="proj-detail-section-title">Technologies Used</h2>
            <div className="proj-detail-tags">
              {project.tech.map((t) => (
                <span key={t} className="proj-detail-tag">{t}</span>
              ))}
            </div>
          </div>

          {/* What was done */}
          {"highlights" in project && Array.isArray((project as { highlights?: string[] }).highlights) && (
            <div className="proj-detail-section a3">
              <h2 className="proj-detail-section-title">What I Built</h2>
              <ul className="proj-detail-highlights">
                {(project as { highlights: string[] }).highlights.map((h, i) => (
                  <li key={i} className="proj-detail-highlight-item">
                    <span className="proj-detail-bullet" />
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Stats if available */}
          {"stats" in project && Array.isArray((project as { stats?: unknown[] }).stats) && (
            <div className="proj-detail-section a4">
              <h2 className="proj-detail-section-title">Project Stats</h2>
              <div className="proj-detail-stats-grid">
                {(project as { stats: { label: string; value: string }[] }).stats.map((s, idx) => (
                  <div key={idx} className="proj-detail-stat-card">
                    <span className="proj-detail-stat-label">{s.label}</span>
                    <span className="proj-detail-stat-value">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* What I Learned */}
          {"learned" in project && (
            <div className="proj-detail-section a4">
              <h2 className="proj-detail-section-title">What I Learned</h2>
              {Array.isArray((project as { learned?: unknown }).learned) ? (
                <ul className="proj-detail-highlights">
                  {(project as { learned: string[] }).learned.map((item, i) => (
                    <li key={i} className="proj-detail-highlight-item">
                      <span className="proj-detail-bullet" />
                      <span dangerouslySetInnerHTML={{ __html: item }} />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="proj-detail-learned-text">
                  {typeof (project as { learned?: unknown }).learned === "string" && (project as unknown as { learned: string }).learned}
                </p>
              )}
            </div>
          )}

        </div>
      </div>
    </main>
  );
}
