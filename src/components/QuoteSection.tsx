"use client";

import { useEffect, useState } from "react";
import { AnimeQuote, ONE_PIECE_QUOTES, getNextNonRepeatingQuote } from "@/data/quotes";

export default function QuoteSection() {
  const [quote, setQuote] = useState<AnimeQuote>(ONE_PIECE_QUOTES[0]);

  useEffect(() => {
    const nextQuote = getNextNonRepeatingQuote();
    if (nextQuote) {
      setQuote(nextQuote);
    }
  }, []);

  return (
    <section className="quote-section" aria-label="Quote of the moment">
      <div className="wrap">
        <div className="quote-standalone">
          <blockquote className="quote-text">
            &ldquo;{quote.quote}&rdquo;
          </blockquote>
          <div className="quote-author">
            ~ {quote.author}
          </div>
        </div>
      </div>
    </section>
  );
}
