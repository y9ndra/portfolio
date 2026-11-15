import Link from "next/link";
import Character from "@/components/character/Character";
import "@/components/character/character.css";
import "./character-lab.css";

export default function CharacterLab() {
  return <main className="character-test-lab">
    <Link className="character-test-back" href="/lab">← Back to lab</Link>
    <div className="character-test-content">
      <span className="character-test-label">CHARACTER LAB</span>
      <h1>A greeting in two moments.</h1>
      <p>Tap the character to try each part of the interaction.</p>
      <div className="character-test-stage"><Character splitGreeting /></div>
      <div className="character-test-steps">
        <p><span>01</span> The hat falls and the character says hello.</p>
        <p><span>02</span> Tap again and the breeze carries the hat away.</p>
      </div>
      <p className="character-test-note">The sequence repeats on the next tap.</p>
    </div>
  </main>;
}
