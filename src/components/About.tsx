import { PERSONAL } from "@/data/portfolio";

export default function About() {
  return (
    <section id="about" className="section" aria-label="About">
      <div className="wrap">

        <div className="section-head" data-reveal>
          <span className="section-title">About</span>
          <div className="section-rule" />
        </div>

        <div className="about-body corner-box" data-reveal data-delay="1">
          <p>
            Final-year <strong>B.Tech IT</strong> student with a focus on <strong>backend engineering</strong> and <strong>full-stack development</strong>.
          </p>
          <p>
            I build products that are <strong>fast</strong>, <strong>reliable</strong>, and <strong>purposeful</strong> — from real-time communication platforms to AI-assisted applications.
          </p>
          <p>
            I care deeply about <strong>clean architecture</strong>, meaningful user experiences, and writing code that lasts.
          </p>
        </div>

      </div>
    </section>
  );
}
