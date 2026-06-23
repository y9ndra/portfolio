"use client";

import { useMemo, useState, useEffect } from "react";
import { PERSONAL } from "@/data/portfolio";

const CAL_ICON = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const LINK_ICON = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

interface DayData {
  date: string;
  level: number;
  count: number;
}

interface ApiResponseDay {
  color: string;
  contributionCount: number;
  contributionLevel: "NONE" | "FIRST_QUARTILE" | "SECOND_QUARTILE" | "THIRD_QUARTILE" | "FOURTH_QUARTILE";
  date: string;
}

interface ApiResponse {
  contributions: ApiResponseDay[][];
  totalContributions: number;
}

export default function GithubCalendar() {
  // State
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [calendarGrid, setCalendarGrid] = useState<DayData[][]>([]);

  // Fetch real data on mount
  useEffect(() => {
    let active = true;
    
    async function fetchContributions() {
      try {
        const res = await fetch("https://github-contributions-api.deno.dev/y9ndra.json");
        if (!res.ok) throw new Error("Failed to fetch github calendar data");
        const data: ApiResponse = await res.json();
        
        if (!active) return;

        if (data.contributions && data.contributions.length > 0) {
          const levelMap: Record<string, number> = {
            NONE: 0,
            FIRST_QUARTILE: 1,
            SECOND_QUARTILE: 2,
            THIRD_QUARTILE: 3,
            FOURTH_QUARTILE: 4,
          };

          const grid: DayData[][] = data.contributions.map((week) =>
            week.map((day) => {
              const parts = day.date.split("-");
              const dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
              const formattedDate = dateObj.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              });
              return {
                date: formattedDate,
                level: levelMap[day.contributionLevel] ?? 0,
                count: day.contributionCount,
              };
            })
          );

          // Slice exactly the last 53 weeks to fit our UI layout
          const finalGrid = grid.slice(-53);
          
          setCalendarGrid(finalGrid);
          setTotalCount(data.totalContributions || 0);
          setLoading(false);
        }
      } catch (err) {
        console.error("Error loading github calendar data:", err);
        setLoading(false); 
      }
    }

    fetchContributions();

    return () => {
      active = false;
    };
  }, []);

  const months = ["Jun", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun"];

  if (loading) {
    return (
      <div className="gc-wrap corner-box gc-loading" style={{ height: "148px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.75rem", color: "var(--t3)" }}>
          Loading Contributions...
        </p>
      </div>
    );
  }

  return (
    <div className="gc-wrap corner-box a1" data-reveal data-delay="1">
      
      {/* Header */}
      <div className="gc-head">
        <div className="gc-title">
          <span className="gc-count">{totalCount.toLocaleString()}</span> Contributions
        </div>
        <div className="gc-period">
          <CAL_ICON /> Last Year
        </div>
      </div>

      {/* Months labels */}
      <div className="gc-months">
        {months.map((m, i) => (
          <span key={`${m}-${i}`}>{m}</span>
        ))}
      </div>

      {/* Grid container with scrolling for mobile */}
      <div className="gc-scroll">
        <div className="gc-grid">
          {calendarGrid.map((week, wIdx) => (
            <div key={wIdx} className="gc-col">
              {week.map((day, dIdx) => (
                <div
                  key={dIdx}
                  className={`gc-day lvl-${day.level}`}
                  title={`${day.count} contributions on ${day.date}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="gc-foot">
        <a
          href={PERSONAL.github}
          target="_blank"
          rel="noopener noreferrer"
          className="gc-user"
          id="gc-profile-link"
        >
          @y9ndra <LINK_ICON />
        </a>
        <div className="gc-legend">
          <span>Less</span>
          <span className="gc-key lvl-0" />
          <span className="gc-key lvl-1" />
          <span className="gc-key lvl-2" />
          <span className="gc-key lvl-3" />
          <span className="gc-key lvl-4" />
          <span>More</span>
        </div>
      </div>

    </div>
  );
}
