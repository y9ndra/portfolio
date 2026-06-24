import { kv } from "@vercel/kv";
import { NextResponse } from "next/server";

// Simulated in-memory database fallback for local development (when environment variables are missing)
let localViewsCount = 120;

export async function POST() {
  const isKvConfigured = process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN;

  if (!isKvConfigured) {
    localViewsCount += 1;
    return NextResponse.json({ views: localViewsCount });
  }

  try {
    const count = await kv.incr("portfolio_views");
    return NextResponse.json({ views: count });
  } catch (error) {
    console.error("Vercel KV Error:", error);
    return NextResponse.json({ views: 0 }, { status: 500 });
  }
}
