import type { Metadata } from "next";
import AllOpenSourceClient from "./AllOpenSourceClient";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://yugendhra.me";
const TITLE = "Open Source — Yugendhra E";
const DESCRIPTION = "Open-source projects Yugendhra E has contributed to, with live pull request counts from GitHub.";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { siteName: "Yugendhra E", title: TITLE, description: DESCRIPTION, type: "website" },
  twitter: { card: "summary", title: TITLE, description: DESCRIPTION },
};

export default function OpenSourcePage() {
  return <AllOpenSourceClient />;
}
