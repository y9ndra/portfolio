import { PERSONAL } from "@/data/portfolio";

const Arr = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
    <path d="M2.5 6h7M6 2.5l3.5 3.5L7 9.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function Contact() {
  return (
    <section id="contact" className="section" aria-label="Contact">
      <div className="wrap">

        <div className="section-head" data-reveal>
          <span className="section-title">Contact</span>
          <div className="section-rule" />
        </div>

        <h2 className="contact-hed" data-reveal data-delay="1">
          Let&rsquo;s build something<br />meaningful.
        </h2>

        <p className="contact-sub" data-reveal data-delay="2">
          Whether it&apos;s a project, an opportunity, or just a conversation -
          I&apos;m always open to connecting.
        </p>

        <div className="contact-actions-row" data-reveal data-delay="3">
          <a href={`mailto:${PERSONAL.email}`} className="btn btn-solid" id="contact-cta">
            <span className="btn-label">Send me an email</span> <Arr />
          </a>
        </div>

      </div>
    </section>
  );
}
