"use client";

import Link from "next/link";
import { PROJECTS } from "@/data/portfolio";
import { ProjectCard } from "@/components/ProjectCard";
import Footer from "@/components/Footer";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const ArrowLeft = () => (
  <svg
    width="14"
    height="14"
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

export default function AllProjectsClient() {
  useScrollReveal();

  return (
    <>
      <main className="proj-page-main">
        {/* Back button aligned to main container */}
        <div className="wrap">
          <div className="proj-detail-back-wrap a0">
            <Link href="/#projects" className="proj-detail-back">
              <ArrowLeft /> <span className="btn-label">Back to Home</span>
            </Link>
          </div>
        </div>

        {/* Page Header */}
        <div className="wrap">
          <header className="proj-page-header a1">
            <h1 className="sr-only">All Projects</h1>
            <div className="section-head">
              <span className="section-title">Projects</span>
            </div>
          </header>
        </div>

        {/* All Projects List */}
        <div className="wrap">
          <div className="proj-list a2">
            {PROJECTS.map((p, i) => (
              <ProjectCard key={p.id} {...p} delay={String((i % 3) + 1)} />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
