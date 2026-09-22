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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://yugendhra.me"),
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
    siteName: "Yugendhra E",
    title: "Yugendhra E — Software Developer",
    description:
      "Building scalable backend systems and full-stack applications.",
    type: "website",
    images: [
      {
        url: "/assets/images/profile+v6.png",
        width: 1200,
        height: 630,
        alt: "Yugendhra E — Portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Yugendhra E — Software Developer",
    description:
      "Building scalable backend systems and full-stack applications.",
    images: ["/assets/images/profile+v6.png"],
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
      suppressHydrationWarning
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
