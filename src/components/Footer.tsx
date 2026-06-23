"use client";

import { useEffect, useState } from "react";

const EyeIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function Footer() {
  const [views, setViews] = useState<number | null>(null);

  useEffect(() => {
    // Simple localStorage-based page view counter
    const key = "portfolio_views";
    const stored = localStorage.getItem(key);
    const count = stored ? parseInt(stored, 10) + 1 : 1;
    localStorage.setItem(key, count.toString());
    setViews(count);
  }, []);

  return (
    <footer>
      <div className="footer">
        <span className="ft">© 2026 Yugendhra E</span>
        <div className="footer-views">
          <EyeIcon />
          <span className="ft">{views !== null ? `${views.toLocaleString()} views` : "—"}</span>
        </div>
      </div>
    </footer>
  );
}
