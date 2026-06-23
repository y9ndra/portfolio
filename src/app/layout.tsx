import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Playfair_Display, Hanken_Grotesk } from "next/font/google";
import Navbar from "@/components/Navbar";
import ClickSound from "@/components/ClickSound";
import "./globals.css";


const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  style: ["normal", "italic"],
});

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Yugendhra E — Software Developer",
  description:
    "Final-year B.Tech IT student building scalable backend systems and full-stack applications. Explore my projects and skills.",
  keywords: [
    "Yugendhra",
    "software developer",
    "full-stack developer",
    "backend engineer",
    "React",
    "Node.js",
    "Next.js",
    "portfolio",
  ],
  authors: [{ name: "Yugendhra E" }],
  openGraph: {
    title: "Yugendhra E — Software Developer",
    description:
      "Building scalable backend systems and full-stack applications.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} ${playfair.variable} ${hanken.variable} scroll-smooth`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var theme = localStorage.getItem('theme') || 'dark';
                document.documentElement.setAttribute('data-theme', theme);
              })();
            `,
          }}
        />
      </head>
      <body
        className="antialiased"
        style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
      >
        <ClickSound />
        <Navbar />
        {children}
      </body>
    </html>
  );
}
