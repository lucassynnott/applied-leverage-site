import { NextResponse } from "next/server";

export async function GET() {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL ?? "";
  const convexSiteUrl = process.env.NEXT_PUBLIC_CONVEX_SITE_URL ?? "";
  const githubClientId = process.env.GITHUB_CLIENT_ID ?? "";
  const betterAuthSecret = process.env.BETTER_AUTH_SECRET ?? "";
  return NextResponse.json({
    convexUrl: { value: convexUrl, len: convexUrl.length, endsWithNewline: convexUrl.endsWith("\n") },
    convexSiteUrl: { value: convexSiteUrl, len: convexSiteUrl.length, endsWithNewline: convexSiteUrl.endsWith("\n") },
    githubClientId: { value: githubClientId, len: githubClientId.length, endsWithNewline: githubClientId.endsWith("\n") },
    betterAuthSecret: { len: betterAuthSecret.length, endsWithNewline: betterAuthSecret.endsWith("\n") },
  });
}
