"use client";

import Link from "next/link";
import { OPEN_SOURCE } from "@/data/portfolio";
import { OrgCard, Num, Sparkline, useOssStats, MergeIcon, PrIcon, IssueIcon } from "@/components/OpenSource";
import Footer from "@/components/Footer";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const ProjectsIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);

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
  const totals = data?.totals ?? null;
  const act = data?.activity ?? null;
  // one scale for every tile, so the biggest total climbs highest
  const scaleMax = totals ? Math.max(totals.merged, totals.open, totals.issues, OPEN_SOURCE.length) : OPEN_SOURCE.length;
  const tiles: { key: string; icon: React.ReactNode; label: string; value: number | null; series: number[] | null; tone?: "merged" | "open" }[] = [
    { key: "merged", icon: <MergeIcon />, label: "merged", value: totals ? totals.merged : null, series: act?.merged ?? null, tone: "merged" },
    { key: "open", icon: <PrIcon />, label: "open", value: totals ? totals.open : null, series: act?.open ?? null, tone: "open" },
    { key: "issues", icon: <IssueIcon />, label: totals && totals.issues === 1 ? "issue" : "issues", value: totals ? totals.issues : null, series: act?.issues ?? null },
    // projects is already a running count, so feed the daily deltas
    { key: "projects", icon: <ProjectsIcon />, label: "orgs", value: OPEN_SOURCE.length, series: act ? act.projects.map((v, i, a) => (i === 0 ? v : v - a[i - 1])) : null },
  ];

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

        {/* Overall numbers across every project, each with a twelve-month trend */}
        <div className="wrap">
          <div className="oss-tiles a1" role="list" aria-label="Totals across all projects">
            {tiles.map((t) => (
              <div key={t.key} className="oss-tile corner-box" role="listitem">
                <span className="oss-tile-icon">{t.icon}</span>
                <div className="oss-tile-body">
                  <Num value={t.value} go={go} tone={t.tone} />
                  <span className="oss-label">{t.label}</span>
                </div>
                <Sparkline points={t.series} go={go} tone={t.tone} max={scaleMax} />
              </div>
            ))}
          </div>
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
