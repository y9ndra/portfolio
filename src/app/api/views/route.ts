import Redis from "ioredis";
import { NextResponse, NextRequest } from "next/server";

let redis: Redis | null = null;
const localViewsMap = new Map<string, number>();
const localRateLimitMap = new Map<string, { count: number; expiresAt: number }>();

if (process.env.KV_REDIS_URL) {
  redis = new Redis(process.env.KV_REDIS_URL);
}

interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
}

async function isRateLimited(req: NextRequest, limit = 30, windowMs = 60000): Promise<RateLimitResult> {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.headers.get("x-real-ip") || "127.0.0.1";
  const now = Date.now();
  const windowIndex = Math.floor(now / windowMs);
  const key = `rate_limit:${ip}:${windowIndex}`;

  if (!redis) {
    // Clean up expired keys to prevent memory leak
    for (const [k, v] of localRateLimitMap.entries()) {
      if (v.expiresAt < now) {
        localRateLimitMap.delete(k);
      }
    }

    const current = localRateLimitMap.get(key) || { count: 0, expiresAt: now + windowMs };
    current.count += 1;
    localRateLimitMap.set(key, current);

    return {
      allowed: current.count <= limit,
      limit,
      remaining: Math.max(0, limit - current.count),
    };
  }

  try {
    const count = await redis.incr(key);
    if (count === 1) {
      await redis.expire(key, Math.ceil(windowMs / 1000));
    }
    return {
      allowed: count <= limit,
      limit,
      remaining: Math.max(0, limit - count),
    };
  } catch (err) {
    console.error("Rate Limiter Redis error:", err);
    // Fail open if Redis has issues
    return { allowed: true, limit, remaining: limit };
  }
}

export async function POST(req: NextRequest) {
  const limitCheck = await isRateLimited(req, 15, 60000); // 15 write requests per minute
  if (!limitCheck.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": String(limitCheck.limit),
          "X-RateLimit-Remaining": String(limitCheck.remaining),
        },
      }
    );
  }

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
  const limitCheck = await isRateLimited(req, 45, 60000); // 45 read requests per minute
  if (!limitCheck.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": String(limitCheck.limit),
          "X-RateLimit-Remaining": String(limitCheck.remaining),
        },
      }
    );
  }

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

