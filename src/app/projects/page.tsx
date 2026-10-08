import type { Metadata } from "next";
import AllProjectsClient from "./AllProjectsClient";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://yugendhra.me";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: "Projects — Yugendhra E",
  description:
    "A complete catalog of distributed systems, backend infrastructure, developer tools, and full-stack applications built by Yugendhra E.",
  openGraph: {
    siteName: "Yugendhra E",
    title: "Projects — Yugendhra E",
    description:
      "A complete catalog of distributed systems, backend infrastructure, developer tools, and full-stack applications built by Yugendhra E.",
    type: "website",
    images: [
      {
        url: "/assets/images/profile+v6.png",
        width: 1200,
        height: 630,
        alt: "Yugendhra E — Projects",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Projects — Yugendhra E",
    description:
      "A complete catalog of distributed systems, backend infrastructure, developer tools, and full-stack applications built by Yugendhra E.",
    images: ["/assets/images/profile+v6.png"],
  },
};

export default function ProjectsPage() {
  return <AllProjectsClient />;
}
