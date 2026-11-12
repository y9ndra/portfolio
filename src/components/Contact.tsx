import { PERSONAL } from "@/data/portfolio";
import "./ContactLayout.css";

export default function Contact() {
  return (
    <section id="contact" className="section" aria-label="Contact">
      <div className="wrap">
        <div className="section-head" data-reveal>
          <span className="section-title">Contact</span>
          <div className="section-rule" />
        </div>
        <div className="contact-side-layout" data-reveal>
          <h2 className="contact-side-title">Let&rsquo;s build something meaningful.</h2>
          <div className="contact-side-message">
            <p>Whether it&apos;s a project, an opportunity, or just a conversation — I&apos;m always open to connecting.</p>
            <a href={`mailto:${PERSONAL.email}`} className="btn btn-solid contact-side-link" id="contact-cta"><span className="btn-label">Send me an email</span><svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M2.5 6h7M6 2.5l3.5 3.5L7 9.5" strokeLinecap="round" strokeLinejoin="round" /></svg></a>
          </div>
        </div>
      </div>
    </section>
  );
}
