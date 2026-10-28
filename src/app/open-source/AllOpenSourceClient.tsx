"use client";

import Link from "next/link";
import { OPEN_SOURCE } from "@/data/portfolio";
import { OrgCard, useOssStats } from "@/components/OpenSource";
import Footer from "@/components/Footer";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const ArrowLeft = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M10 3L5 8l5 5" />
  </svg>
);

export default function AllOpenSourceClient() {
  useScrollReveal();
  const { data, failed } = useOssStats();
  // the whole page sits near the fold, so counts animate as soon as data lands
  const go = data !== null || failed;
  const byOrg = new Map((data?.orgs ?? []).map((s) => [s.org, s]));

  return (
    <>
      <main className="proj-page-main">
        <div className="wrap">
          <div className="proj-detail-back-wrap a0">
            <Link href="/#open-source" className="proj-detail-back">
              <ArrowLeft /> <span className="btn-label">Back to Home</span>
            </Link>
          </div>
        </div>

        <div className="wrap">
          <header className="proj-page-header a1">
            <h1 className="sr-only">All Open Source Contributions</h1>
            <div className="section-head">
              <span className="section-title">Open Source</span>
            </div>
          </header>
        </div>

        <div className="wrap">
          <div className="section-head oss-section-head a2" aria-hidden="true">
            <span className="section-title">Organizations</span>
            <span className="oss-section-rule" />
          </div>
          <div className="oss-list a2">
            {OPEN_SOURCE.map((meta, i) => (
              <OrgCard key={meta.org} meta={meta} stats={data ? byOrg.get(meta.org) ?? null : null} go={go} delay={String((i % 3) + 1)} backUrl="/open-source" />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
