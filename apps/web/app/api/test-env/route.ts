import { NextResponse } from "next/server";
export async function GET() {
  const u = process.env.NEXT_PUBLIC_CONVEX_URL ?? "";
  const s = process.env.NEXT_PUBLIC_CONVEX_SITE_URL ?? "";
  return NextResponse.json({ url: u, urlLen: u.length, urlNL: u.endsWith("\n"), site: s, siteLen: s.length, siteNL: s.endsWith("\n") });
}
