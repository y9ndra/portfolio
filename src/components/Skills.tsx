import { SKILLS } from "@/data/portfolio";
import SkillsJar from "@/components/SkillsJar";

export default function Skills() {
  return (
    <section id="skills" className="section" aria-label="Skills">
      <div className="wrap">
        <div className="section-head" data-reveal>
          <span className="section-title">Skills</span>
          <div className="section-rule" />
        </div>

        {/* Interactive Physics Chamber */}
        <div data-reveal data-delay="1">
          <SkillsJar />
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
