import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    convexUrl: process.env.NEXT_PUBLIC_CONVEX_URL ? "set" : "missing",
    convexSiteUrl: process.env.NEXT_PUBLIC_CONVEX_SITE_URL ? "set" : "missing",
    githubClientId: process.env.GITHUB_CLIENT_ID ? "set" : "missing",
    betterAuthSecret: process.env.BETTER_AUTH_SECRET ? "set" : "missing",
  });
}
