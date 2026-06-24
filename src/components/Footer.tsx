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
    const key = "last_known_global_views";

    fetch("/api/views", { method: "POST" })
      .then((res) => {
        if (!res.ok) throw new Error("API failed");
        return res.json();
      })
      .then((data) => {
        const count = data.views;
        setViews(count);
        localStorage.setItem(key, count.toString());
      })
      .catch((err) => {
        console.error("View count fetch failed:", err);
        const stored = localStorage.getItem(key) || localStorage.getItem("portfolio_views");
        const count = stored ? parseInt(stored, 10) + 1 : 1;
        localStorage.setItem(key, count.toString());
        setViews(count);
      });
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
