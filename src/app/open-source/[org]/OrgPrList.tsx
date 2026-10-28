"use client";

import { useState } from "react";
import type { OssPR } from "@/lib/github-oss";

/**
 * One list of every merged and open PR (newest raised first), headed by a
 * "Pull Requests" pill, a dashed rule and All / Merged / Open filter chips.
 */

type Filter = "all" | "merged" | "open";

const MergeIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="18" cy="18" r="3" /><circle cx="6" cy="6" r="3" />
    <path d="M6 21V9a9 9 0 0 0 9 9" />
  </svg>
);
const PrIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="18" cy="18" r="3" /><circle cx="6" cy="6" r="3" />
    <path d="M13 6h3a2 2 0 0 1 2 2v7" /><line x1="6" y1="9" x2="6" y2="21" />
  </svg>
);
const GH = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

/** "[server][photos] Fix x" → ["server", "photos"]; the title itself stays as on GitHub */
const bracketTags = (title: string) => {
  const tags: string[] = [];
  let rest = title.trim();
  const re = /^\[([^\]]+)\]\s*/;
  let m: RegExpExecArray | null;
  while ((m = re.exec(rest))) {
    tags.push(m[1]);
    rest = rest.slice(m[0].length);
  }
  return tags;
};

function PRCard({ pr }: { pr: OssPR }) {
  const tags = bracketTags(pr.title);
  const [owner, name] = pr.repo.split("/");
  return (
    <li className="oss-pr corner-box">
      <div className="oss-pr-top">
        <span className={`oss-pr-pill ${pr.state}`}>
          {pr.state === "merged" ? <MergeIcon /> : <PrIcon />}{pr.state}
        </span>
        <span className="oss-pr-date">
          {pr.state === "merged" && pr.mergedAt ? `merged ${fmtDate(pr.mergedAt)}` : `opened ${fmtDate(pr.createdAt)}`}
        </span>
      </div>
      <h2 className="oss-pr-title">
        <a href={pr.url} target="_blank" rel="noopener noreferrer">{pr.title}</a>
      </h2>
      <div className="oss-pr-bottom">
        <div className="oss-pr-chips">
          <span className="proj-tag">{owner}/{name} #{pr.number}</span>
          {tags.map((t) => <span key={t} className="proj-tag">{t}</span>)}
        </div>
        <a href={pr.url} target="_blank" rel="noopener noreferrer" className="proj-gh-btn" aria-label={`Open pull request #${pr.number} on GitHub`}>
          <GH /> <span className="btn-label">View PR</span>
        </a>
      </div>
    </li>
  );
}

export function OrgPrList({ prs }: { prs: OssPR[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const hasMerged = prs.some((p) => p.state === "merged");
  const hasOpen = prs.some((p) => p.state === "open");
  const shown = filter === "all" ? prs : prs.filter((p) => p.state === filter);

  const chip = (value: Filter, label: string) => (
    <button
      type="button"
      className={`oss-filter ${value} ${filter === value ? "on" : ""}`}
      aria-pressed={filter === value}
      onClick={() => setFilter(value)}
    >
      {value !== "all" && <span className="oss-filter-dot" aria-hidden="true" />}
      {label}
    </button>
  );

  return (
    <section className="a2" aria-label="Pull requests">
      <div className="section-head oss-pr-head">
        <span className="section-title">Pull Requests</span>
        <span className="oss-section-rule" aria-hidden="true" />
        {/* only offer a filter when both states exist; otherwise it would filter nothing */}
        {hasMerged && hasOpen && (
          <div className="oss-filters" role="group" aria-label="Filter pull requests">
            {chip("all", "All")}
            {chip("merged", "Merged")}
            {chip("open", "Open")}
          </div>
        )}
      </div>
      <ol className="oss-pr-list">
        {shown.map((pr) => <PRCard key={pr.url} pr={pr} />)}
      </ol>
    </section>
  );
}
