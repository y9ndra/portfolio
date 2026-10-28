"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { OPEN_SOURCE } from "@/data/portfolio";
import type { OrgStats, OssActivity } from "@/lib/github-oss";

/**
 * Open Source — organisations contributed to, with live counts from /api/oss.
 * The home section shows the featured ones; /open-source lists them all, and
 * each card opens /open-source/[org] with the full PR list.
 */

interface OssResponse {
  user: string;
  orgs: OrgStats[];
  totals: { merged: number; open: number; reviews: number; issues: number };
  activity?: OssActivity;
}

export const MergeIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="18" cy="18" r="3" /><circle cx="6" cy="6" r="3" />
    <path d="M6 21V9a9 9 0 0 0 9 9" />
  </svg>
);
export const PrIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="18" cy="18" r="3" /><circle cx="6" cy="6" r="3" />
    <path d="M13 6h3a2 2 0 0 1 2 2v7" /><line x1="6" y1="9" x2="6" y2="21" />
  </svg>
);
const EyeIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
  </svg>
);
export const IssueIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3" />
  </svg>
);
const StarIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);
const ForkIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="12" cy="18" r="3" /><circle cx="6" cy="6" r="3" /><circle cx="18" cy="6" r="3" />
    <path d="M18 9a9 9 0 0 1-9 9" /><path d="M6 9v3a3 3 0 0 0 3 3h3" />
  </svg>
);
const ArrowRight = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M3 8h10M9 4l4 4-4 4" />
  </svg>
);

/** Fetches /api/oss once; `failed` lets cards fall back to dashes. */
export function useOssStats() {
  const [data, setData] = useState<OssResponse | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let cancelled = false;
    fetch("/api/oss")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d: OssResponse) => { if (!cancelled) setData(d); })
      .catch(() => { if (!cancelled) setFailed(true); });
    return () => { cancelled = true; };
  }, []);
  return { data, failed };
}

/** Counts up from 0 once `go` is true; respects prefers-reduced-motion. */
function useCountUp(target: number | null, go: boolean) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (target === null || !go) return;
    const instant = window.matchMedia("(prefers-reduced-motion: reduce)").matches || target === 0;
    let raf = 0;
    const t0 = performance.now();
    const dur = 700 + Math.min(600, target * 20);
    const tick = (t: number) => {
      if (instant) { setValue(target); return; }
      const u = Math.min(1, (t - t0) / dur);
      const e = 1 - Math.pow(1 - u, 3);
      setValue(Math.round(target * e));
      if (u < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    // throttled or background tabs may never paint a frame: land on the target regardless
    const settle = window.setTimeout(() => { cancelAnimationFrame(raf); setValue(target); }, dur + 150);
    return () => { cancelAnimationFrame(raf); clearTimeout(settle); };
  }, [target, go]);
  return value;
}

/** A counting number for the totals tiles. */
export function Num({ value, go, tone }: { value: number | null; go: boolean; tone?: "merged" | "open" }) {
  const n = useCountUp(value, go);
  return <span className={`oss-num ${tone ?? ""}`}>{value === null ? "—" : n}</span>;
}

/**
 * Tiny line chart of a running total, drawn behind a tile's number.
 * `points` are per-day counts; the line starts at zero, is cumulative, and is
 * scaled to `max` (shared across tiles so bigger totals climb higher).
 */
export function Sparkline({ points, go, tone, max: scale }: { points: number[] | null; go: boolean; tone?: "merged" | "open"; max?: number }) {
  if (!points || points.length < 1) return null;
  const cum = points.reduce<number[]>((out, v) => [...out, out[out.length - 1] + v], [0]);
  const max = Math.max(1, scale ?? cum[cum.length - 1]);
  const W = 100, H = 40, TOP = 4, BOTTOM = 37;
  const pts = cum.map((v, i) => `${(i / (cum.length - 1)) * W},${BOTTOM - (v / max) * (BOTTOM - TOP)}`).join(" ");
  return (
    <svg className={`oss-spark ${tone ?? ""} ${go ? "go" : ""}`} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden>
      <polyline points={pts} pathLength={1} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export function Stat({ icon, label, value, go, strong, tone }: { icon: React.ReactNode; label: string; value: number | null; go: boolean; strong?: boolean; tone?: "merged" | "open" }) {
  const n = useCountUp(value, go);
  return (
    <span className={`oss-stat ${strong ? "strong" : ""} ${tone ?? ""}`}>
      <span className="oss-stat-icon">{icon}</span>
      <span className="oss-stat-num">{value === null ? "—" : n}</span>
      <span className="oss-stat-label">{label}</span>
    </span>
  );
}

interface OrgCardProps {
  meta: (typeof OPEN_SOURCE)[number];
  stats: OrgStats | null;
  go: boolean;
  delay: string;
  /** where the detail page's back button should return to */
  backUrl: string;
  /** home page: counts only, no "worked on" tags */
  compact?: boolean;
}

export function OrgCard({ meta, stats, go, delay, backUrl, compact = false }: OrgCardProps) {
  const router = useRouter();
  const repos = stats?.repos ?? [];
  const repoInfo = stats?.repoInfo ?? {};
  const mainRepo = repos[0];
  const mainInfo = mainRepo ? repoInfo[mainRepo] : undefined;
  const extraRepos = repos.slice(1);   // the main repo already sits in the header chip
  const href = `/open-source/${meta.org}`;
  const fmt = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : String(n));

  const open = () => {
    try { sessionStorage.setItem("oss_back_url", backUrl); } catch { /* unavailable */ }
    router.push(href);
  };
  const onClick = (e: React.MouseEvent) => {
    const t = e.target as HTMLElement;
    if (t.closest("a")) return;   // external links keep their own behaviour
    open();
  };
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); }
  };

  return (
    <article
      className="oss-card corner-box"
      data-reveal
      data-delay={delay}
      role="link"
      tabIndex={0}
      aria-label={`${meta.name}: view pull requests`}
      onClick={onClick}
      onKeyDown={onKey}
    >
      <div className="oss-head">
        <a href={`https://github.com/${meta.org}`} target="_blank" rel="noopener noreferrer" className="oss-logo" aria-label={`${meta.name} on GitHub`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`https://github.com/${meta.org}.png?size=96`} alt="" width={40} height={40} loading="lazy" />
        </a>
        <div className="oss-title-col">
          <div className="oss-title-row">
            <h3 className="oss-name">{meta.name}</h3>
          </div>
          <p className="oss-tagline">{meta.tagline}</p>
        </div>
        {mainRepo && (
          <div className="oss-aside">
            <span className="oss-repo-chip">
              <span className="oss-repo-owner">{mainRepo.split("/")[0]}/</span>{mainRepo.split("/")[1]}
            </span>
            {mainInfo && (
              <span className="oss-repo-row">
                <span className="oss-repo-meta"><StarIcon /> {fmt(mainInfo.stars)}</span>
                <span className="oss-repo-meta"><ForkIcon /> {fmt(mainInfo.forks)}</span>
              </span>
            )}
          </div>
        )}
      </div>

      {/* counts on the left, areas worked on to the right (full list page only) */}
      <div className="oss-card-row">
        <div className="oss-stats">
          <Stat icon={<MergeIcon />} label="merged" value={stats ? stats.merged : null} go={go} strong tone="merged" />
          <Stat icon={<PrIcon />} label="open" value={stats ? stats.open : null} go={go} tone="open" />
          {(stats?.reviews ?? 0) > 0 && <Stat icon={<EyeIcon />} label="reviewed" value={stats ? stats.reviews : null} go={go} />}
          <Stat icon={<IssueIcon />} label="issues" value={stats ? stats.issues : null} go={go} />
        </div>
        {!compact && (meta.areas?.length || extraRepos.length > 0) && (
          <div className="proj-tags oss-card-tags" aria-label="Worked on">
            {meta.areas?.map((a) => <span key={a} className="proj-tag">{a}</span>)}
            {extraRepos.map((r) => <span key={r} className="proj-tag proj-tag-more">{r}</span>)}
          </div>
        )}
      </div>

      {/* the whole card opens the org page; this just hints at it */}
      <span className="oss-card-arrow" aria-hidden="true"><ArrowRight /></span>
    </article>
  );
}

/** Home page section: featured organisations only, plus a link to the full list. */
export default function OpenSource() {
  const { data, failed } = useOssStats();
  const [inView, setInView] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver((e) => { if (e[0]?.isIntersecting) { setInView(true); io.disconnect(); } }, { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const go = inView && (data !== null || failed);
  const byOrg = new Map((data?.orgs ?? []).map((s) => [s.org, s]));
  const featured = OPEN_SOURCE.filter((o) => o.featured);

  return (
    <section id="open-source" className="section" aria-label="Open Source" ref={sectionRef}>
      <div className="wrap">
        <div className="section-head" data-reveal>
          <span className="section-title">Open Source</span>
          <div className="section-rule" />
        </div>

        <div className="oss-list">
          {featured.map((meta, i) => (
            <OrgCard key={meta.org} meta={meta} stats={data ? byOrg.get(meta.org) ?? null : null} go={go} delay={String((i % 3) + 1)} backUrl="/#open-source" compact />
          ))}
        </div>

        <div className="proj-view-all-wrap" data-reveal>
          <Link href="/open-source" className="btn btn-line proj-view-all-btn">
            <span className="btn-label">All Open Source</span>
            <ArrowRight />
          </Link>
        </div>
      </div>
    </section>
  );
}
