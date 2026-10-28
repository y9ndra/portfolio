import { OPEN_SOURCE, PERSONAL } from "@/data/portfolio";

/**
 * GitHub open-source contribution data, shared by the /api/oss route and the
 * /open-source pages. Uses the public search API (optionally authenticated via
 * GITHUB_TOKEN) and relies on Next's fetch cache for hourly revalidation.
 */

export const OSS_USER = PERSONAL.github.split("/").pop() ?? "";
export type OssMeta = (typeof OPEN_SOURCE)[number];

const API = "https://api.github.com/search/issues";
const PER_PAGE = 100;
const MAX_PAGES = 3;
const REVALIDATE = 3600;

interface SearchItem {
  title: string;
  number: number;
  html_url: string;
  repository_url: string;
  state: "open" | "closed";
  pull_request?: { merged_at: string | null };
  created_at: string;
  updated_at: string;
  closed_at: string | null;
}

export interface OrgStats {
  org: string;
  merged: number;
  open: number;
  closed: number;
  reviews: number;
  issues: number;
  repos: string[];
  lastActive: string | null;
  /** up to six PRs that best show the work: merged first (newest), then open */
  recent: OssPR[];
  /** stars / forks per repo touched, from the repos API */
  repoInfo: Record<string, { stars: number; forks: number }>;
}

export interface OssPR {
  title: string;
  number: number;
  url: string;
  repo: string;
  state: "merged" | "open";
  createdAt: string;
  mergedAt: string | null;
}

export function ossMeta(org: string): OssMeta | undefined {
  return OPEN_SOURCE.find((o) => o.org.toLowerCase() === org.toLowerCase());
}

export function orgLogins(meta: OssMeta): string[] {
  return [meta.org, ...(meta.aliases ?? [])];
}

function baseHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "Portfolio-App",
  };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  return headers;
}

async function search(q: string): Promise<SearchItem[]> {
  const headers = baseHeaders();

  const items: SearchItem[] = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(`${API}?q=${encodeURIComponent(q)}&per_page=${PER_PAGE}&page=${page}&sort=created&order=desc`, {
      headers,
      signal: controller.signal,
      next: { revalidate: REVALIDATE },
    });
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error(`GitHub search returned ${res.status}`);
    const data = (await res.json()) as { total_count: number; items: SearchItem[] };
    items.push(...data.items);
    if (items.length >= data.total_count || data.items.length < PER_PAGE) break;
  }
  return items;
}

const repoOf = (item: SearchItem) => item.repository_url.split("/repos/")[1];
const toPR = (it: SearchItem, merged: boolean): OssPR => ({
  title: it.title,
  number: it.number,
  url: it.html_url,
  repo: repoOf(it),
  state: merged ? "merged" : "open",
  createdAt: it.created_at,
  mergedAt: it.pull_request?.merged_at ?? null,
});

// Renamed organisations still show their old login on older PRs; fold aliases
// into the current login.
const aliasToOrg = new Map<string, string>();
for (const o of OPEN_SOURCE) {
  for (const login of orgLogins(o)) aliasToOrg.set(login.toLowerCase(), o.org);
}
const orgOf = (item: SearchItem) => aliasToOrg.get(repoOf(item).split("/")[0].toLowerCase()) ?? null;

/** Per-org counts across every configured organisation (three searches total). */
export async function fetchOssStats() {
  const own = `-user:${OSS_USER}`;
  const [prs, reviewed, issues] = await Promise.all([
    search(`is:pr author:${OSS_USER} ${own}`),
    search(`type:pr reviewed-by:${OSS_USER} -author:${OSS_USER} ${own}`),
    search(`is:issue author:${OSS_USER} ${own}`),
  ]);

  const stats = new Map<string, OrgStats>();
  const get = (org: string) => {
    let s = stats.get(org);
    if (!s) {
      s = { org, merged: 0, open: 0, closed: 0, reviews: 0, issues: 0, repos: [], lastActive: null, recent: [], repoInfo: {} };
      stats.set(org, s);
    }
    return s;
  };
  const touch = (s: OrgStats, item: SearchItem) => {
    const repo = repoOf(item);
    if (!s.repos.includes(repo)) s.repos.push(repo);
    if (!s.lastActive || item.updated_at > s.lastActive) s.lastActive = item.updated_at;
  };

  const candidates = new Map<string, OssPR[]>();
  for (const it of prs) {
    const org = orgOf(it);
    if (!org) continue;
    const s = get(org);
    const merged = !!it.pull_request?.merged_at;
    if (merged) s.merged++;
    else if (it.state === "open") s.open++;
    else s.closed++;
    touch(s, it);
    if (merged || it.state === "open") {
      const list = candidates.get(org) ?? [];
      list.push(toPR(it, merged));
      candidates.set(org, list);
    }
  }
  for (const [org, list] of candidates) {
    const rank = (p: OssPR) => (p.state === "merged" ? 1 : 0);
    list.sort((a, b) => rank(b) - rank(a) || ((b.mergedAt ?? b.createdAt) < (a.mergedAt ?? a.createdAt) ? -1 : 1));
    get(org).recent = list.slice(0, 6);
  }

  // Social proof for each repo touched (one cheap call per repo, cached an hour)
  const allRepos = [...new Set([...stats.values()].flatMap((s) => s.repos))];
  const infos = await Promise.all(allRepos.map(async (repo) => {
    try {
      const res = await fetch(`https://api.github.com/repos/${repo}`, { headers: baseHeaders(), next: { revalidate: REVALIDATE } });
      if (!res.ok) return null;
      const d = (await res.json()) as { stargazers_count: number; forks_count: number };
      return { repo, stars: d.stargazers_count, forks: d.forks_count };
    } catch { return null; }
  }));
  for (const info of infos) {
    if (!info) continue;
    for (const s of stats.values()) if (s.repos.includes(info.repo)) s.repoInfo[info.repo] = { stars: info.stars, forks: info.forks };
  }
  for (const it of reviewed) {
    const org = orgOf(it);
    if (!org) continue;
    const s = get(org);
    s.reviews++;
    touch(s, it);
  }
  for (const it of issues) {
    const org = orgOf(it);
    if (!org) continue;
    const s = get(org);
    s.issues++;
    touch(s, it);
  }

  const orgs = OPEN_SOURCE.map((o) => stats.get(o.org) ?? get(o.org));

  const totals = orgs.reduce(
    (t, s) => ({ merged: t.merged + s.merged, open: t.open + s.open, reviews: t.reviews + s.reviews, issues: t.issues + s.issues }),
    { merged: 0, open: 0, reviews: 0, issues: 0 }
  );
  return { user: OSS_USER, orgs, totals, fetchedAt: new Date().toISOString() };
}

/** Merged and open PRs raised in one organisation (closed-unmerged are skipped), newest first. */
export async function fetchOrgPRs(meta: OssMeta): Promise<OssPR[]> {
  // The current login is authoritative (GitHub redirects renamed orgs, so old
  // PRs already report the new owner). Old logins are searched best-effort:
  // GitHub answers 422 for a login that no longer exists, which is not an error here.
  const primary = search(`is:pr author:${OSS_USER} org:${meta.org}`);
  const legacy = (meta.aliases ?? []).map((login) =>
    search(`is:pr author:${OSS_USER} org:${login}`).catch(() => [] as SearchItem[])
  );
  const lists = await Promise.all([primary, ...legacy]);
  const seen = new Set<string>();
  const out: OssPR[] = [];
  for (const it of lists.flat()) {
    if (seen.has(it.html_url)) continue;
    seen.add(it.html_url);
    const merged = !!it.pull_request?.merged_at;
    if (!merged && it.state !== "open") continue;
    out.push(toPR(it, merged));
  }
  out.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return out;
}
