"use client";

import { useState, useEffect, useRef } from "react";
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
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

interface ApiResponse {
  total: Record<string, number>;
  contributions: ApiResponseDay[];
}

export default function GithubCalendar() {
  // State
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [calendarGrid, setCalendarGrid] = useState<DayData[][]>([]);
  const [months, setMonths] = useState<string[]>([
    "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"
  ]);
  const [activeDay, setActiveDay] = useState<{ wIdx: number; dIdx: number } | null>(null);
  const activeTooltipRef = useRef<HTMLSpanElement>(null);

  const handleDayClick = (day: DayData, wIdx: number, dIdx: number) => {
    if (activeDay?.wIdx === wIdx && activeDay?.dIdx === dIdx) {
      setActiveDay(null);
    } else {
      setActiveDay({ wIdx, dIdx });
    }
  };

  // Fetch real data on mount
  useEffect(() => {
    let active = true;
    
    async function fetchContributions() {
      try {
        const res = await fetch("https://github-contributions-api.jogruber.de/v4/y9ndra?y=last");
        if (!res.ok) throw new Error("Failed to fetch github calendar data");
        const data: ApiResponse = await res.json();
        
        if (!active) return;

        if (data.contributions && data.contributions.length > 0) {
          const grid: DayData[][] = [];
          let currentWeek: DayData[] = [];

          data.contributions.forEach((day) => {
            const parts = day.date.split("-");
            const dateObj = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
            const formattedDate = dateObj.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            });

            const dayData: DayData = {
              date: formattedDate,
              level: day.level,
              count: day.count,
            };

            if (dateObj.getDay() === 0 && currentWeek.length > 0) {
              grid.push(currentWeek);
              currentWeek = [];
            }
            currentWeek.push(dayData);
          });

          if (currentWeek.length > 0) {
            grid.push(currentWeek);
          }

          // Slice exactly the last 53 weeks to fit our UI layout
          const finalGrid = grid.slice(-53);
          
          // Calculate dynamic month labels
          const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          const firstDateParts = data.contributions[0].date.split("-");
          const startMonth = parseInt(firstDateParts[1], 10) - 1;
          const dynamicMonths: string[] = [];
          for (let i = 0; i < 12; i++) {
            dynamicMonths.push(monthNames[(startMonth + i) % 12]);
          }

          setCalendarGrid(finalGrid);
          setMonths(dynamicMonths);
          const total = data.total?.lastYear ?? Object.values(data.total || {})[0] ?? 0;
          setTotalCount(total);
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

  // Auto-close tooltip on vertical page scroll or horizontal calendar scroll
  useEffect(() => {
    if (!activeDay) return;

    const handleScroll = () => {
      setActiveDay(null);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    
    const scrollEl = document.querySelector(".gc-scroll");
    if (scrollEl) {
      scrollEl.addEventListener("scroll", handleScroll, { passive: true });
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollEl) {
        scrollEl.removeEventListener("scroll", handleScroll);
      }
    };
  }, [activeDay]);

  // Adjust active tooltip position to prevent clipping at viewport edges on mobile
  useEffect(() => {
    if (activeDay && activeTooltipRef.current) {
      const tooltip = activeTooltipRef.current;
      const padding = 12; // safety margin from viewport edges
      
      // Reset any previous custom transform to let browser compute original rect first
      tooltip.style.transform = "";
      
      // Use requestAnimationFrame to check layout after render
      requestAnimationFrame(() => {
        const freshRect = tooltip.getBoundingClientRect();
        let offset = 0;
        
        if (freshRect.left < padding) {
          offset = padding - freshRect.left;
        } else if (freshRect.right > window.innerWidth - padding) {
          offset = window.innerWidth - padding - freshRect.right;
        }
        
        if (offset !== 0) {
          const isLeft = tooltip.classList.contains("align-left");
          const isRight = tooltip.classList.contains("align-right");
          
          if (isLeft || isRight) {
            tooltip.style.transform = `translateX(${offset}px)`;
          } else {
            tooltip.style.transform = `translate(-50%, 0) translateX(${offset}px)`;
          }
          tooltip.style.setProperty("--arrow-offset", `${-offset}px`);
        } else {
          tooltip.style.setProperty("--arrow-offset", "0px");
        }
      });
    }
  }, [activeDay]);

  // Helper to determine month label for each column in skeleton loading state
  const getSkeletonMonthLabels = () => {
    const labels: string[] = Array(53).fill("");
    const indices = [0, 4, 9, 13, 18, 22, 27, 31, 35, 40, 44, 49];
    indices.forEach((wIdx, mIdx) => {
      if (wIdx < 53) {
        labels[wIdx] = months[mIdx] || "";
      }
    });
    return labels;
  };

  // Helper to determine month label for each column in loaded state
  const getLoadedMonthLabels = () => {
    const labels: string[] = Array(calendarGrid.length).fill("");
    let lastRenderedIndex = -10;

    calendarGrid.forEach((week, wIdx) => {
      if (!week || week.length === 0) return;
      
      const currentMonth = week[0].date.split(" ")[0];
      
      if (wIdx === 0) {
        let nextMonthStartsSoon = false;
        for (let i = 1; i <= 2; i++) {
          const nextWeek = calendarGrid[i];
          if (nextWeek && nextWeek.length > 0) {
            const nextMonth = nextWeek[0].date.split(" ")[0];
            if (nextMonth !== currentMonth) {
              nextMonthStartsSoon = true;
              break;
            }
          }
        }
        if (!nextMonthStartsSoon) {
          labels[wIdx] = currentMonth;
          lastRenderedIndex = wIdx;
        }
      } else {
        const prevWeek = calendarGrid[wIdx - 1];
        if (prevWeek && prevWeek.length > 0) {
          const prevMonth = prevWeek[0].date.split(" ")[0];
          if (currentMonth !== prevMonth) {
            if (wIdx - lastRenderedIndex >= 3 && wIdx < calendarGrid.length - 2) {
              labels[wIdx] = currentMonth;
              lastRenderedIndex = wIdx;
            }
          }
        }
      }
    });

    return labels;
  };

  if (loading) {
    return (
      <div className="gc-wrap corner-box" style={{ opacity: 0.7 }}>
        {/* Header Skeleton */}
        <div className="gc-head">
          <div className="gc-title" style={{ display: "flex", gap: "0.25rem", alignItems: "center" }}>
            <span className="gc-skeleton-bar" style={{ width: "35px", height: "12px", borderRadius: "3px" }} />
            <span style={{ fontSize: "0.65rem", color: "var(--t3)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Contributions</span>
          </div>
          <div className="gc-period">
            <CAL_ICON /> Last Year
          </div>
        </div>

        {/* Grid container with scrolling for mobile */}
        <div className="gc-scroll">
          <div style={{ minWidth: "580px" }}>
            {/* Months labels */}
            <div className="gc-months-row">
              {getSkeletonMonthLabels().map((m, wIdx) => (
                <div key={wIdx} className="gc-month-col">
                  {m && <span className="gc-month-label">{m}</span>}
                </div>
              ))}
            </div>
            <div className="gc-grid">
              {Array.from({ length: 53 }).map((_, wIdx) => (
                <div key={wIdx} className="gc-col">
                  {Array.from({ length: 7 }).map((_, dIdx) => (
                    <div
                      key={dIdx}
                      className="gc-day gc-skeleton-day"
                      style={{
                        animationDelay: `${(wIdx + dIdx) * 15}ms`,
                      }}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="gc-foot">
          <span className="gc-user" style={{ opacity: 0.5, pointerEvents: "none" }}>
            @y9ndra <LINK_ICON />
          </span>
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

      {/* Grid container with scrolling for mobile */}
      <div className="gc-scroll">
        <div style={{ minWidth: "580px" }}>
          {/* Months labels */}
          <div className="gc-months-row">
            {getLoadedMonthLabels().map((m, wIdx) => (
              <div key={wIdx} className="gc-month-col">
                {m && <span className="gc-month-label">{m}</span>}
              </div>
            ))}
          </div>
          <div className="gc-grid">
            {calendarGrid.map((week, wIdx) => (
              <div key={wIdx} className="gc-col">
                {week.map((day, dIdx) => {
                  const isActive = activeDay?.wIdx === wIdx && activeDay?.dIdx === dIdx;
                  return (
                    <div
                      key={dIdx}
                      tabIndex={0}
                      className={`gc-day lvl-${day.level} ${isActive ? "active" : ""}`}
                      onClick={() => handleDayClick(day, wIdx, dIdx)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          handleDayClick(day, wIdx, dIdx);
                          e.preventDefault();
                        }
                      }}
                      onBlur={() => setActiveDay(null)}
                    >
                      <span
                        ref={isActive ? activeTooltipRef : null}
                        className={`gc-day-tooltip ${wIdx < 10 ? "align-left" : wIdx > 42 ? "align-right" : "align-center"}`}
                      >
                        <strong>{day.count}</strong> {day.count === 1 ? "contribution" : "contributions"} on {day.date}
                      </span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
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
