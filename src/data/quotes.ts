export interface AnimeQuote {
  id: string;
  quote: string;
  character: string;
  title?: string;
  arc?: string;
}

export const ONE_PIECE_QUOTES: AnimeQuote[] = [
  {
    id: "luffy-risks",
    quote: "If you don't take risks, you can't create a future.",
    character: "Monkey D. Luffy",
    title: "Captain of the Straw Hat Pirates",
  },
  {
    id: "jinbe-remains",
    quote: "Stop counting what you have lost. What is gone is gone — ask yourself what still remains!",
    character: "Jinbe",
    title: "Knight of the Sea",
    arc: "Post-War",
  },
  {
    id: "zoro-shove-back",
    quote: "When the world shoves you around, you've just gotta stand up and shove back.",
    character: "Roronoa Zoro",
    title: "Swordsman",
  },
  {
    id: "teach-dreams",
    quote: "People's dreams... have no end!",
    character: "Marshall D. Teach",
    title: "Blackbeard",
    arc: "Jaya",
  },
  {
    id: "saul-alone",
    quote: "No one is born into this world to be alone.",
    character: "Jaguar D. Saul",
    arc: "Ohara",
  },
  {
    id: "hiluluk-forgotten",
    quote: "When do you think a person dies? A person dies only when they are forgotten.",
    character: "Dr. Hiluluk",
    title: "Doctor",
    arc: "Drum Island",
  },
  {
    id: "shanks-grow",
    quote: "By experiencing both victory and defeat, running away and shedding tears — that is how you truly grow.",
    character: "Shanks",
    title: "Red-Haired Shanks",
  },
  {
    id: "ace-no-regrets",
    quote: "Live a life with no regrets.",
    character: "Portgas D. Ace",
    title: "Second Division Commander",
  },
  {
    id: "rayleigh-strength",
    quote: "Don't rush. Take your time to build your own strength.",
    character: "Silvers Rayleigh",
    title: "Dark King",
  },
  {
    id: "bellmere-happiness",
    quote: "Never forget: as long as you are alive, there are endless chances for happiness.",
    character: "Bell-mère",
    arc: "Arlong Park",
  },
];
