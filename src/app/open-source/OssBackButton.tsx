"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const ArrowLeft = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M10 3L5 8l5 5" />
  </svg>
);

/** Returns to wherever the org card was opened from: the home section or the full list. */
export function OssBackButton() {
  const [backUrl, setBackUrl] = useState("/open-source");
  useEffect(() => {
    // read after mount (not during render) so server and client markup match
    const id = setTimeout(() => {
      try {
        const saved = sessionStorage.getItem("oss_back_url");
        if (saved === "/#open-source" || saved === "/open-source") setBackUrl(saved);
      } catch { /* sessionStorage unavailable */ }
    }, 0);
    return () => clearTimeout(id);
  }, []);
  return (
    <Link href={backUrl} className="proj-detail-back">
      <ArrowLeft /> <span className="btn-label">{backUrl === "/open-source" ? "All Open Source" : "Back to Home"}</span>
    </Link>
  );
}
