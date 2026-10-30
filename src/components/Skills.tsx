"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { SKILLS } from "@/data/portfolio";

// matter-js physics is below the fold: load it on the client, after the page is interactive
const SkillsJar = dynamic(() => import("@/components/SkillsJar"), { ssr: false });

export default function Skills() {
  const sectionRef = useRef<HTMLElement>(null);
  const [loadJar, setLoadJar] = useState(false);
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setLoadJar(true);
        observer.disconnect();
      }
    }, { rootMargin: "1000px 0px" });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);
  return (
    <section id="skills" className="section" aria-label="Skills" ref={sectionRef}>
      <div className="wrap">
        <div className="section-head" data-reveal>
          <span className="section-title">Skills</span>
          <div className="section-rule" />
        </div>

        {/* Interactive Physics Chamber */}
        <div data-reveal data-delay="1">
          {loadJar ? <SkillsJar /> : <div aria-hidden="true" style={{ height: 420 }} />}
        </div>

        {/* Accessible screen-reader & SEO semantic structure */}
        <div className="sr-only">
          <h3>Full Skills List</h3>
          {SKILLS.map((cat) => (
            <div key={cat.category}>
              <h4>{cat.category}</h4>
              <ul>
                {cat.items.map((skill) => (
                  <li key={skill}>{skill}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
