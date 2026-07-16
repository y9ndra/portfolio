import Redis from "ioredis";
import { NextResponse, NextRequest } from "next/server";

let redis: Redis | null = null;
const localViewsMap = new Map<string, number>();

if (process.env.KV_REDIS_URL) {
  redis = new Redis(process.env.KV_REDIS_URL);
}

export async function POST(req: NextRequest) {
  let blogId: string | null = null;
  try {
    const body = await req.json();
    if (body && body.id) {
      blogId = body.id;
    }
  } catch (e) {
    // No valid JSON body
  }

  const key = blogId ? `blog_views:${blogId}` : "portfolio_views";

  if (!redis) {
    const current = localViewsMap.get(key) || (blogId ? 45 : 120);
    const nextVal = current + 1;
    localViewsMap.set(key, nextVal);
    return NextResponse.json({ views: nextVal });
  }

  try {
    const count = await redis.incr(key);
    return NextResponse.json({ views: count });
  } catch (error) {
    console.error("Redis Error:", error);
    return NextResponse.json({ views: 0 }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const blogId = searchParams.get("id");
  const key = blogId ? `blog_views:${blogId}` : "portfolio_views";

  if (!redis) {
    const current = localViewsMap.get(key) || (blogId ? 45 : 120);
    return NextResponse.json({ views: current });
  }

  try {
    const val = await redis.get(key);
    const count = val ? parseInt(val, 10) : 0;
    return NextResponse.json({ views: count });
  } catch (error) {
    console.error("Redis Error:", error);
    return NextResponse.json({ views: 0 }, { status: 500 });
  }
}
