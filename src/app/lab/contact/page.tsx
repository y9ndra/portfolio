"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { PERSONAL } from "@/data/portfolio";
import QuoteSection from "@/components/QuoteSection";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import "./contact-lab.css";

const designs = [
  { id: "center-orbit", name: "Centred orbit", description: "Fine curved lines gather around a centred invitation." },
  { id: "center-bridge", name: "The bridge", description: "The invitation settles in the middle while a fine line leads into the quote." },
  { id: "center-fold", name: "An invitation unfolds", description: "A soft, open panel unfolds around the invitation, then lets the page breathe." },
  { id: "center-signal", name: "A little signal", description: "A small pulse travels from the heading to a centred email action." },
  { id: "center-editorial", name: "Centred editorial", description: "Oversized type and a delicate underline turn the invitation into a final statement." },
  { id: "outgoing", name: "Outgoing message", description: "An invitation becomes a message ready to send." },
  { id: "chair", name: "Pull up a chair", description: "A sweeping arrow enters the space and points to the invitation." },
  { id: "exchange", name: "The final conversation", description: "Two thoughts meet in a personal exchange, with the email action between them." },
  { id: "path", name: "A path to the horizon", description: "A fine line travels past the invitation toward the quote." },
  { id: "open-invite", name: "The open invitation", description: "Oversized typography and a moving arrow lead toward an email." },
  { id: "bottle", name: "Message in a bottle", description: "A small monochrome bottle releases a note beside the invitation." },
  { id: "centered", name: "The invitation", description: "A centred invitation naturally leads into the quote below." },
  { id: "letter", name: "An open letter", description: "A personal, letter-inspired layout gives the contact section a warmer voice." },
  { id: "split", name: "Two sides", description: "A bold message on the left balances the invitation and email on the right." },
  { id: "conversation", name: "Conversation starter", description: "An editorial heading leads into a clear, full-width email action." },
  { id: "horizon", name: "Open horizon", description: "A restrained horizon motif connects the end of the page to the ocean banner." },
  { id: "outline", name: "Open frame", description: "An incomplete frame gathers the contact content without closing off the quote." },
] as const;
type Design = (typeof designs)[number];

export default function ContactLab() {
  const [design, setDesign] = useState<Design>(designs[0]);
  const [version, setVersion] = useState(0);
  const originalTheme = useRef<string | null>(null);
  useScrollReveal();
  useEffect(() => {
    originalTheme.current = document.documentElement.getAttribute("data-theme");
    return () => { if (originalTheme.current === null) document.documentElement.removeAttribute("data-theme"); else document.documentElement.setAttribute("data-theme", originalTheme.current); };
  }, []);
  function toggleTheme() { const root = document.documentElement; root.setAttribute("data-theme", root.getAttribute("data-theme") === "light" ? "dark" : "light"); }
  return <main className="contactlab">
    <div className="contactlab-top"><Link href="/lab">← Banner lab</Link><button type="button" onClick={toggleTheme}>◐ Switch theme</button></div>
    <header className="contactlab-intro"><span>CONTACT DESIGN LAB / 01—17</span><h1>A better ending.</h1><p>Explore ways the contact section can lead naturally into your quote and footer. Each concept uses your current content.</p></header>
    <div className="contactlab-options" role="group" aria-label="Contact design options">{designs.map((option, index) => <button key={option.id} type="button" aria-pressed={design.id === option.id} onClick={() => { setDesign(option); setVersion(value => value + 1); }}><small>{String(index + 1).padStart(2, "0")}</small>{option.name}</button>)}</div>
    <div className="contactlab-heading"><div><span>NOW VIEWING</span><h2>{design.name}</h2><p>{design.description}</p></div><button type="button" onClick={() => setVersion(value => value + 1)}>↻ Replay</button></div>
    <div className="contactlab-stage" key={`${design.id}-${version}`}><div className="contactlab-inner">
      <section className={`contact-preview contact-preview-${design.id}`} aria-label="Contact preview">
        <div className="contact-preview-decoration" aria-hidden="true"><span /></div>
        {design.id === "path" && <svg className="contact-path" viewBox="0 0 650 320" preserveAspectRatio="none" aria-hidden="true"><path d="M0 28 H390 Q438 28 438 75 V130 Q438 178 490 178 H600 Q635 178 635 220 V255 Q635 290 590 290 H325 V320" pathLength="1" /></svg>}
        {design.id === "bottle" && <svg className="contact-bottle" viewBox="0 0 100 150" aria-hidden="true"><g className="bottle-note"><path d="M33 49V12h34v37" /><path d="M39 22h21M39 28h18M39 34h20" /></g><path d="M39 49V33h22v16c0 12 18 15 18 33v42c0 8-6 14-14 14H35c-8 0-14-6-14-14V82c0-18 18-21 18-33Z" /><path d="M38 33h24v-8H38zM28 102c14-6 28 5 44-1" /></svg>}
        {(design.id === "chair" || design.id === "open-invite") && <span className="contact-big-arrow" aria-hidden="true">↗</span>}
        <div className="contact-preview-content"><div className="contact-preview-kicker">CONTACT <span>↗</span></div><h3>{design.id === "exchange" ? <>You have an idea?<em>Let&rsquo;s talk about it.</em></> : <>Let&rsquo;s build something <em>meaningful.</em></>}</h3><div className="contact-preview-message"><p>Whether it&apos;s a project, an opportunity, or just a conversation — I&apos;m always open to connecting.</p><a href={`mailto:${PERSONAL.email}`} className="contact-preview-link"><span>Send me an email</span><span aria-hidden="true">↗</span></a></div></div>
      </section>
      <QuoteSection />
      <footer className="contactlab-footer"><div>© 2026 Yugendhra E <span>◉ — views</span></div><div className="contactlab-socials"><a href={PERSONAL.github} aria-label="GitHub">GH ↗</a><a href={PERSONAL.linkedin} aria-label="LinkedIn">IN ↗</a><a href={PERSONAL.leetcode} aria-label="LeetCode">LC ↗</a></div></footer>
    </div></div><p className="contactlab-note">The quote uses your live animation. Footer view count is a placeholder in this preview. The main page is unchanged.</p>
  </main>;
}
