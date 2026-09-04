import { NextResponse } from "next/server";

export const revalidate = 3600; // Cache on server/CDN for 1 hour

export async function GET() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch("https://github-contributions-api.jogruber.de/v4/y9ndra?y=last", {
      signal: controller.signal,
      next: { revalidate: 3600 },
      headers: {
        "User-Agent": "Portfolio-App",
      },
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Upstream API returned status ${res.status}`);
    }

    const data = await res.json();

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Contributions API error:", message);
    return NextResponse.json(
      { error: "Failed to fetch GitHub contributions", details: message },
      { status: 502 }
    );
  }
}
