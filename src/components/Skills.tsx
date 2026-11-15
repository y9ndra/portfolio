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
    let loaded = false;
    let frame = 0;
    let observer: IntersectionObserver | undefined;
    const stage = document.querySelector(".water-stage");
    const stageObserver = new MutationObserver(scheduleCheck);

    function cleanup() {
      observer?.disconnect();
      stageObserver.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scheduleCheck);
      window.removeEventListener("resize", scheduleCheck);
      window.removeEventListener("pageshow", scheduleCheck);
    }
    function load() {
      if (loaded) return;
      loaded = true;
      cleanup();
      setLoadJar(true);
    }
    function check() {
      frame = 0;
      const rect = section!.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0 && rect.top <= window.innerHeight + 1000 && rect.bottom >= -1000) load();
    }
    function scheduleCheck() {
      if (!loaded && !frame) frame = requestAnimationFrame(check);
    }

    if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) load(); }, { rootMargin: "1000px 0px" });
      observer.observe(section);
    }
    if (stage) stageObserver.observe(stage, { attributes: true, attributeFilter: ["data-phase", "class"] });
    window.addEventListener("scroll", scheduleCheck, { passive: true });
    window.addEventListener("resize", scheduleCheck, { passive: true });
    window.addEventListener("pageshow", scheduleCheck);
    scheduleCheck();
    return cleanup;
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
