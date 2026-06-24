import { NextResponse } from "next/server";

export async function GET() {
  // Only return the keys (names), NOT the values, to keep your credentials secure
  const keys = Object.keys(process.env).filter(
    (key) => key.startsWith("KV") || key.startsWith("REDIS") || key.startsWith("STORAGE")
  );
  return NextResponse.json({ envKeys: keys });
}
