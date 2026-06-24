import Redis from "ioredis";
import { NextResponse } from "next/server";

let redis: Redis | null = null;
let localViewsCount = 120;

if (process.env.KV_REDIS_URL) {
  redis = new Redis(process.env.KV_REDIS_URL);
}

export async function POST() {
  if (!redis) {
    localViewsCount += 1;
    return NextResponse.json({ views: localViewsCount });
  }

  try {
    const count = await redis.incr("portfolio_views");
    return NextResponse.json({ views: count });
  } catch (error) {
    console.error("Redis Error:", error);
    return NextResponse.json({ views: 0 }, { status: 500 });
  }
}
