export interface AnimeQuote {
  quote: string;
  author: string;
}

export const ONE_PIECE_QUOTES: AnimeQuote[] = [
  {
    quote: "If you don't take risks, you can't create a future.",
    author: "Monkey D. Luffy",
  },
  {
    quote: "As long as I'm alive, I have infinite possibilities!",
    author: "Monkey D. Luffy",
  },
  {
    quote: "Stop counting what you have lost. What is gone is gone, ask yourself what still remains!",
    author: "Jinbe",
  },
  {
    quote: "When the world shoves you around, you've just gotta stand up and shove back.",
    author: "Roronoa Zoro",
  },
  {
    quote: "People's dreams have no end!",
    author: "Marshall D. Teach",
  },
  {
    quote: "No one is born into this world to be alone.",
    author: "Jaguar D. Saul",
  },
  {
    quote: "When do you think a person dies? A person dies only when they are forgotten.",
    author: "Dr. Hiluluk",
  },
  {
    quote: "By experiencing both victory and defeat, running away and shedding tears, that is how you truly grow.",
    author: "Shanks",
  },
  {
    quote: "Live a life with no regrets.",
    author: "Portgas D. Ace",
  },
  {
    quote: "Don't rush. Take your time to build your own strength.",
    author: "Silvers Rayleigh",
  },
  {
    quote: "Never forget: as long as you are alive, there are endless chances for happiness.",
    author: "Bell-mère",
  },
  {
    quote: "Miracles only happen to those who never give up. Never underestimate your own will to keep moving forward.",
    author: "Emporio Ivankov",
  },
  {
    quote: "Neither God nor the Devil can help someone who has lost the will to fight.",
    author: "Brook",
  },
  {
    quote: "Everyone has things they can do and things they cannot. Focus on what only you can do.",
    author: "Sanji",
  },
  {
    quote: "No matter what you build, it isn't good or bad. A person must take pride in what they create with their own hands.",
    author: "Tom",
  },
  {
    quote: "There is no crime in simply existing. Being alive is never a wrong thing.",
    author: "Franky",
  },
  {
    quote: "It doesn't matter who you were born to. We are all children of the open sea.",
    author: "Edward Newgate",
  },
  {
    quote: "There comes a time when you must stand your ground, especially when someone laughs at your dreams.",
    author: "Usopp",
  },
  {
    quote: "Counting the things you've defeated is pointless. What truly matters is the number of lives and dreams you protect.",
    author: "Fujitora",
  },
  {
    quote: "Fools who don't respect the past are doomed to repeat it.",
    author: "Nico Robin",
  },
  {
    quote: "As long as people continue to seek freedom, the dreams in their hearts will never cease to exist.",
    author: "Gol D. Roger",
  },
  {
    quote: "Do not pass down hatred to the next generation. Break the cycle with your own actions.",
    author: "Fisher Tiger",
  },
  {
    quote: "Don't bind yourself to the pain of the past. Walk forward, because you are free.",
    author: "Donquixote Rosinante",
  },
  {
    quote: "It is too early for you to die. Know yourself, know the world, and become strong.",
    author: "Dracule Mihawk",
  },
  {
    quote: "A heart without doubt, that is what true strength is.",
    author: "Owner Zeff",
  },
  {
    quote: "The young carry infinite potential. Always bet on the future, never cling to the past.",
    author: "Monkey D. Garp",
  },
  {
    quote: "Ideals without the strength to back them up are nothing but illusions.",
    author: "Sir Crocodile",
  },
  {
    quote: "Kids who have never seen peace and kids who have never seen war have different values.",
    author: "Donquixote Doflamingo",
  },
  {
    quote: "Whoever stands at the top decides what is right and what is wrong. The winner becomes justice!",
    author: "Donquixote Doflamingo",
  },
  {
    quote: "I have decided to follow my dream. If I die fighting for it, then at least I tried!",
    author: "Monkey D. Luffy",
  },
  {
    quote: "Whether it exists or not does not matter. What matters is having the courage to chase it.",
    author: "Mont Blanc Cricket",
  },
  {
    quote: "Inherited will, the tide of the ages, and the dreams of people. These are things that will never be stopped.",
    author: "Gol D. Roger",
  },
  {
    quote: "Scars on the back are a swordsman's shame.",
    author: "Roronoa Zoro",
  },
  {
    quote: "Friendship has nothing to do with how long you have known each other.",
    author: "Bon Clay",
  },
];

const DECK_STORAGE_KEY = "op_quotes_deck";
const LAST_STORAGE_KEY = "op_last_quote_index";

function shuffleIndices(total: number): number[] {
  const indices = Array.from({ length: total }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return indices;
}

/**
 * Draws the next random quote from a shuffled deck stored in localStorage.
 * Guarantees that EVERY quote is displayed exactly once before any repeat can happen.
 * When the deck is exhausted, it reshuffles all quotes for a fresh non-repeating cycle.
 */
export function getNextNonRepeatingQuote(): AnimeQuote {
  if (typeof window === "undefined") {
    return ONE_PIECE_QUOTES[0];
  }

  try {
    let deck: number[] = [];
    const savedDeck = localStorage.getItem(DECK_STORAGE_KEY);
    const lastIndex = Number(localStorage.getItem(LAST_STORAGE_KEY));

    if (savedDeck) {
      deck = JSON.parse(savedDeck);
      deck = deck.filter((i) => typeof i === "number" && i >= 0 && i < ONE_PIECE_QUOTES.length);
    }

    // When all quotes have been displayed once, create a fresh shuffled deck
    if (deck.length === 0) {
      deck = shuffleIndices(ONE_PIECE_QUOTES.length);

      // Prevent showing the exact same quote back-to-back across deck resets
      if (deck.length > 1 && deck[0] === lastIndex) {
        const swapIdx = Math.floor(Math.random() * (deck.length - 1)) + 1;
        [deck[0], deck[swapIdx]] = [deck[swapIdx], deck[0]];
      }
    }

    const nextIndex = deck.shift()!;
    localStorage.setItem(DECK_STORAGE_KEY, JSON.stringify(deck));
    localStorage.setItem(LAST_STORAGE_KEY, String(nextIndex));

    return ONE_PIECE_QUOTES[nextIndex];
  } catch {
    const fallbackIndex = Math.floor(Math.random() * ONE_PIECE_QUOTES.length);
    return ONE_PIECE_QUOTES[fallbackIndex];
  }
}

