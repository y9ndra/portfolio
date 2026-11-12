import "./QuoteSection.css";

function RevealWords({ text, offset = 0 }: { text: string; offset?: number }) {
  return <>{text.split(" ").map((word, index) => <span key={`${offset}-${index}`}><span className="quote-reveal-word" style={{ animationDelay: `${0.15 + (offset + index) * 0.12}s` }}>{word}</span>{" "}</span>)}</>;
}

function ChainHalf({ side }: { side: "left" | "right" }) {
  const link = (index: number) => <g key={index}>
    <rect className="steel-link-shadow" x={index * 19 - 1} y={index % 2 ? 9 : 5} width="28" height={index % 2 ? 10 : 18} rx={index % 2 ? 5 : 9} />
    <rect className="steel-link-body" x={index * 19 - 1} y={index % 2 ? 9 : 5} width="28" height={index % 2 ? 10 : 18} rx={index % 2 ? 5 : 9} />
    <path className="steel-link-shine" d={`M${index * 19 + 5} ${index % 2 ? 10 : 6.5}h13`} />
  </g>;
  return <svg className={`quote-chain-${side}`} viewBox="0 0 120 28" preserveAspectRatio="none">
    <g className="chain-outer">{Array.from({ length: 3 }, (_, i) => link(side === "left" ? i : i + 3))}</g>
    <g className="chain-inner">{Array.from({ length: 3 }, (_, i) => link(side === "left" ? i + 3 : i))}</g>
  </svg>;
}


export default function QuoteSection() {
  return <section className="quote-section quote-section--freedom" aria-label="Favorite quote">
    <div className="wrap">
      <div className="quote-break-free" data-reveal>
        <blockquote className="quote-text" aria-label="I don't want to conquer anything. The greatest person is the one with the most freedom.">
          <span aria-hidden="true"><RevealWords text="I don't want to conquer anything." /> <RevealWords text="The greatest person is the one with the most" offset={6} /><br /><span className="quote-bound-word"><strong>FREEDOM</strong><span className="quote-period">.</span><span className="quote-chain" aria-hidden="true"><span className="quote-chain-diagonal chain-down"><ChainHalf side="left" /><ChainHalf side="right" /></span><span className="quote-chain-diagonal chain-up"><ChainHalf side="left" /><ChainHalf side="right" /></span><svg className="quote-lock" viewBox="0 0 36 44">
  <g className="lock-piece lock-left"><path className="lock-shackle" d="M9 20v-8a9 9 0 0 1 9-9" /><path className="lock-metal" d="M18 19H9a4 4 0 0 0-4 4v13a4 4 0 0 0 4 4h9l-2-5 3-4-3-4 2-4z" /><path className="lock-highlight" d="M8 24v10" /></g>
  <g className="lock-piece lock-right"><path className="lock-shackle" d="M18 3a9 9 0 0 1 9 9v8" /><path className="lock-metal" d="M18 19h9a4 4 0 0 1 4 4v13a4 4 0 0 1-4 4h-9l-2-5 3-4-3-4 2-4z" /></g>
  <path className="lock-crack" d="M18 19l-2 4 3 4-3 4 3 4-1 5" />
</svg><span className="quote-break-sparks"><i /><i /><i /><i /></span></span></span></span>
        </blockquote>
        <div className="quote-freedom-author author-lines"><span className="author-decoration author-before" aria-hidden="true" /><span>Monkey D. Luffy</span><span className="author-decoration author-after" aria-hidden="true" /></div>
      </div>
    </div>
  </section>;
}
