"use client";

import { useState } from "react";
import { EXPERIENCES } from "@/data/portfolio";

const BRIEFCASE_ICON = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);

const CHEVRON_ICON = ({ isExpanded }: { isExpanded: boolean }) => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{
      transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
      transition: "transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
      color: "var(--t2)",
    }}
    aria-hidden
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

export default function Experience() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleExpand = (idx: number) => {
    setExpandedIndex(expandedIndex === idx ? null : idx);
  };

  return (
    <section id="experience" className="section" aria-label="Work Experience">
      <div className="wrap">
        
        <div className="section-head" data-reveal>
          <span className="section-title">Work Experience</span>
          <div className="section-rule" />
        </div>

        <div className="exp-timeline" data-reveal data-delay="1">
          {EXPERIENCES.map((exp, idx) => {
            const isActive = exp.status.toLowerCase() === "active";
            const isExpanded = expandedIndex === idx;
            return (
              <div key={idx} className="exp-item">
                {/* Timeline node */}
                <div className="exp-node">
                  <div className={`exp-dot ${isActive ? "active" : "done"}`} />
                </div>

                {/* Content card */}
                <div 
                  className={`exp-content corner-box ${isExpanded ? "expanded" : ""}`}
                  onClick={() => toggleExpand(idx)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="exp-header">
                    <div className="exp-company-group">
                      <div className="exp-logo">
                        {exp.logo ? (
                          <img src={exp.logo} alt={`${exp.company} logo`} className="exp-logo-img" />
                        ) : (
                          <BRIEFCASE_ICON />
                        )}
                      </div>
                      <div>
                        <div className="exp-company-row">
                          <h3 className="exp-company">{exp.company}</h3>
                          {exp.status.toLowerCase() !== "done" && (
                            <span className={`exp-badge ${isActive ? "active" : "done"}`}>
                              <span className="badge-dot" /> {exp.status}
                            </span>
                          )}
                        </div>
                        <p className="exp-role">{exp.role}</p>
                      </div>
                    </div>
                    <div className="exp-date-group">
                      <span className="exp-date">{exp.date}</span>
                      <div className={`exp-chevron-wrap ${isExpanded ? "open" : ""}`}>
                        <CHEVRON_ICON isExpanded={isExpanded} />
                      </div>
                    </div>
                  </div>

                  <div className={`exp-details-wrap ${isExpanded ? "open" : ""}`}>
                    <ul className="exp-details">
                      {exp.description.map((desc, dIdx) => (
                        <li key={dIdx} className="exp-detail-item">
                          {desc}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
