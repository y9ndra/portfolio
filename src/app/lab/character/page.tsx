import Image from "next/image";
import Link from "next/link";
import { PERSONAL } from "@/data/portfolio";
import Character from "./Character";
import LabTheme from "./LabTheme";
import "./character.css";

export default function CharacterLab() {
  return (
    <main className="character-lab">
      <div className="character-lab-header"><Link href="/lab">← Back to lab</Link><LabTheme /></div>
      <h1>Character lab</h1>
      <p>Preview the character in the portfolio’s hero section.</p>
      <div className="water-stage character-lab-banner" aria-label="Coastal banner preview">
        <div className="water-frame">
          <Image src="/assets/water/inlet-unlit.webp" alt="Coastal inlet with a lighthouse" fill sizes="(max-width: 680px) calc(100vw - 32px), 650px" style={{ objectFit: "cover" }} unoptimized />
        </div>
      </div>
      <div className="hero-inner">
      <div className="hero-profile character-lab-preview">
        <Character />
        <div className="hero-info">
          <div className="hero-name">Yugendhra E</div>
          <div className="hero-tagline">{PERSONAL.title}<span className="hero-tagline-extra"> · Building scalable systems</span></div>
          <div className="hero-meta"><span className="hero-meta-item">India</span></div>
        </div>
      </div>
      <div className="hero-bio">{PERSONAL.about.map((paragraph, index) => <p key={index} dangerouslySetInnerHTML={{ __html: paragraph }} />)}</div>
      </div>
      <p className="character-lab-note">Move your cursor to look around, or tap the character for a greeting.</p>
    </main>
  );
}
