import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { OPEN_SOURCE } from "@/data/portfolio";
import { fetchOrgPRs, ossMeta, OSS_USER, type OssPR } from "@/lib/github-oss";
import Footer from "@/components/Footer";
import { OssBackButton } from "../OssBackButton";
import { OrgPrList } from "./OrgPrList";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://yugendhra.me";

interface PageProps {
  params: Promise<{ org: string }>;
}

export const revalidate = 3600;

export async function generateStaticParams() {
  return OPEN_SOURCE.map((o) => ({ org: o.org }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { org } = await params;
  const meta = ossMeta(org);
  if (!meta) return {};
  const title = `${meta.name} contributions — Yugendhra E`;
  const description = `Pull requests Yugendhra E has raised to ${meta.name}.`;
  return {
    metadataBase: new URL(BASE_URL),
    title,
    description,
    openGraph: { siteName: "Yugendhra E", title, description, type: "website" },
    twitter: { card: "summary", title, description },
  };
}

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
const LiveIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="globe-icon">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
    <path d="M2 12h20" />
  </svg>
);

export default async function OpenSourceOrgPage({ params }: PageProps) {
  const { org } = await params;
  const meta = ossMeta(org);
  if (!meta) notFound();

  let prs: OssPR[] | null = null;
  try {
    prs = await fetchOrgPRs(meta);
  } catch (error: unknown) {
    console.error("Org PR fetch failed:", error instanceof Error ? error.message : String(error));
  }
  const merged = prs?.filter((p) => p.state === "merged") ?? [];
  const open = prs?.filter((p) => p.state === "open") ?? [];
  const allPrsUrl = `https://github.com/pulls?q=${encodeURIComponent(`is:pr author:${OSS_USER} org:${meta.org}`)}`;

  return (
    <>
      <main className="proj-page-main">
        <div className="wrap">
          <div className="proj-detail-back-wrap a0">
            <OssBackButton />
          </div>
        </div>

        <div className="wrap">
          <header className="oss-org-header corner-box a1">
            {/* faded org mark as a banner backdrop */}
            <div className="oss-org-watermark" aria-hidden="true">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`https://github.com/${meta.org}.png?size=400`} alt="" />
            </div>
            <a href={`https://github.com/${meta.org}`} target="_blank" rel="noopener noreferrer" className="oss-logo oss-logo-lg" aria-label={`${meta.name} on GitHub`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`https://github.com/${meta.org}.png?size=128`} alt="" width={56} height={56} />
            </a>
            <div className="oss-org-title-col">
              <div className="proj-detail-title-row">
                <h1 className="proj-detail-title">{meta.name}</h1>
              </div>
              <p className="proj-detail-desc">{meta.tagline}</p>
              {meta.areas && meta.areas.length > 0 && (
                <div className="proj-tags oss-org-tags">
                  {meta.areas.map((a) => <span key={a} className="proj-tag">{a}</span>)}
                </div>
              )}
              <div className="oss-stats oss-stats-inline">
                <span className="oss-stat strong merged"><span className="oss-stat-icon"><MergeIcon /></span><span className="oss-stat-num">{prs ? merged.length : "—"}</span><span className="oss-stat-label">merged</span></span>
                <span className="oss-stat open"><span className="oss-stat-icon"><PrIcon /></span><span className="oss-stat-num">{prs ? open.length : "—"}</span><span className="oss-stat-label">open</span></span>
              </div>
            </div>
            <div className="oss-org-aside">
              <div className="proj-actions">
                <a href={meta.url} target="_blank" rel="noopener noreferrer" className="proj-live-btn">
                  <LiveIcon /> <span className="btn-label">Site</span>
                </a>
                <a href={allPrsUrl} target="_blank" rel="noopener noreferrer" className="proj-gh-btn">
                  <GH /> <span className="btn-label">GitHub</span>
                </a>
              </div>
            </div>
          </header>
        </div>

        <div className="wrap">
          {prs === null ? (
            <div className="oss-pr-empty corner-box a2">
              Couldn&rsquo;t load pull requests from GitHub right now.{" "}
              <a href={allPrsUrl} target="_blank" rel="noopener noreferrer">View them on GitHub</a>.
            </div>
          ) : prs.length === 0 ? (
            <div className="oss-pr-empty corner-box a2">No merged or open pull requests yet.</div>
          ) : (
            <OrgPrList prs={prs} />
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
