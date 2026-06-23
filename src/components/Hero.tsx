"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { PERSONAL } from "@/data/portfolio";
import GithubCalendar from "@/components/GithubCalendar";

const GH = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
  </svg>
);
const LI = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);
const LC = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0zm-2.866 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H20.79a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z"/>
  </svg>
);
const DL = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
    <path d="M8 2v8M5 7l3 3 3-3M2 13h12" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const AR = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
    <path d="M2.5 6h7M6 2.5l3.5 3.5L6 9.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const PIN_ICON = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);
const CLOCK_ICON = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

export default function Hero() {
  const [err, setErr] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState("");

  useEffect(() => {
    setMounted(true);
    const updateClock = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
          timeZone: "Asia/Kolkata",
        })
      );
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="about" className="section" aria-label="About">
      <div className="hero-inner">

        {/* Profile row */}
        <div className="hero-profile a0">
          <div className="hero-avatar">
            {!err ? (
              <Image src={PERSONAL.avatar} alt="Yugendhra E" fill style={{ objectFit: "cover" }} priority onError={() => setErr(true)} />
            ) : (
              <div className="hero-avatar-fallback">YE</div>
            )}
          </div>
          <div className="hero-content-col">
            <div className="hero-info">
              <h1 className="hero-name">Yugendhra E</h1>

              <div className="hero-tagline">
                {PERSONAL.title} · Building scalable systems
              </div>

              <div className="hero-meta">
                <span className="hero-meta-item">
                  <PIN_ICON /> India
                </span>
                <span className="hero-meta-item">
                  <CLOCK_ICON /> {mounted ? time : "--:--:-- --"}
                </span>
              </div>
            </div>

            {/* About text, directly rendered with dangerous HTML for highlights */}
            <div className="hero-bio a1">
              {PERSONAL.about.map((paragraph, index) => (
                <p key={index} dangerouslySetInnerHTML={{ __html: paragraph }} />
              ))}
            </div>
          </div>
        </div>

        {/* Actions - Grouped to Left (social links) and Right (Resume & Contact) */}
        <div className="hero-actions a2">
          <div className="hero-actions-left">
            <a id="hero-gh" href={PERSONAL.github} target="_blank" rel="noopener noreferrer" className="ic" aria-label="GitHub">
              <GH />
            </a>
            <a id="hero-li" href={PERSONAL.linkedin} target="_blank" rel="noopener noreferrer" className="ic" aria-label="LinkedIn">
              <LI />
            </a>
            <a id="hero-lc" href={PERSONAL.leetcode} target="_blank" rel="noopener noreferrer" className="ic" aria-label="LeetCode">
              <LC />
            </a>
          </div>

          <div className="hero-actions-right">
            <a id="hero-resume" href={PERSONAL.resume} target="_blank" rel="noopener noreferrer" className="btn btn-solid">
              <DL /> Resume
            </a>
            <a
              id="hero-contact"
              href="#contact"
              onClick={(e) => { e.preventDefault(); document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" }); }}
              className="btn btn-line"
            >
              Contact <AR />
            </a>
          </div>
        </div>

        {/* GitHub Contributions */}
        <div className="a3">
          <GithubCalendar />
        </div>

      </div>
    </section>
  );
}
