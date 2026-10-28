import { NextResponse } from "next/server";
import { fetchOssStats } from "@/lib/github-oss";

/** Open-source contribution counts grouped by organisation; cached for an hour. */
export const revalidate = 3600;

export async function GET() {
  try {
    const data = await fetchOssStats();
    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("OSS API error:", message);
    return NextResponse.json({ error: "Failed to fetch open-source stats", details: message }, { status: 502 });
  }
}
