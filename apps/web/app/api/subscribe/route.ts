import { NextRequest, NextResponse } from "next/server";

const RESEND_API_KEY = process.env.RESEND_API_KEY;

const AUDIENCE_IDS: Record<string, string> = {
  "memory-stack": "e37ae485-e4ef-4fad-8618-13d735304777",
  "roundtable": "8cb8a40f-d535-496b-8caa-e6729b0c8b37",
};

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!RESEND_API_KEY) {
    return NextResponse.json({ error: "Missing RESEND_API_KEY" }, { status: 503 });
  }

  let body: { email?: string; firstName?: string; audience?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { email, firstName, audience = "roundtable" } = body;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }

  const audienceId = AUDIENCE_IDS[audience];
  if (!audienceId) {
    return NextResponse.json({ error: "Unknown audience" }, { status: 400 });
  }

  const res = await fetch(`https://api.resend.com/audiences/${audienceId}/contacts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, first_name: firstName ?? "", unsubscribed: false }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Resend contact error:", err);
    return NextResponse.json({ error: "Failed to subscribe" }, { status: 502 });
  }

  return NextResponse.json({ success: true });
}
