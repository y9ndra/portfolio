import { SKILLS } from "@/data/portfolio";

export default function Skills() {
  return (
    <section id="skills" className="section" aria-label="Skills">
      <div className="wrap">

        <div className="section-head" data-reveal>
          <span className="section-title">Skills</span>
          <div className="section-rule" />
        </div>

        <div className="skills-grid" data-reveal data-delay="1">
          {SKILLS.map((cat) => (
            <div key={cat.category} className="skills-row">
              <div className="skills-cat">{cat.category}</div>
              <div className="skills-items">
                {cat.items.map((skill) => (
                  <div key={skill} className="skills-pill">
                    {skill}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

