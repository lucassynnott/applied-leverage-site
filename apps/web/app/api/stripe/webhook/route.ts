import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import {
  buildGatewayInstallUrl,
  getGatewayBaseUrl,
  isArchetype,
} from "@/lib/team-install";
import { upsertCheckoutSessionRecord } from "@/lib/team-install-store";

export const runtime = "nodejs";

const DEFAULT_SIGNATURE_TOLERANCE_SECONDS = 300;

type StripeMetadata = Record<string, string | null | undefined>;

type StripeCheckoutSession = {
  id: string;
  metadata?: StripeMetadata | null;
  customer_email?: string | null;
  customer_details?: {
    email?: string | null;
  } | null;
};

type StripeEvent = {
  type?: string;
  data?: {
    object?: unknown;
  };
};

function parseSignatureHeader(signatureHeader: string): {
  timestamp: number;
  signatures: string[];
} {
  const components = signatureHeader
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  const timestampPart = components.find((part) => part.startsWith("t="));
  const signatures = components
    .filter((part) => part.startsWith("v1="))
    .map((part) => part.slice(3))
    .filter(Boolean);

  if (!timestampPart || signatures.length === 0) {
    throw new Error("Invalid Stripe-Signature header");
  }

  const timestamp = Number(timestampPart.slice(2));
  if (!Number.isFinite(timestamp)) {
    throw new Error("Invalid Stripe-Signature timestamp");
  }

  return { timestamp, signatures };
}

function verifyStripeSignature(
  rawBody: Buffer,
  signatureHeader: string,
  secret: string,
  toleranceSeconds = DEFAULT_SIGNATURE_TOLERANCE_SECONDS,
): void {
  const { timestamp, signatures } = parseSignatureHeader(signatureHeader);
  const ageSeconds = Math.abs(Math.floor(Date.now() / 1000) - timestamp);
  if (ageSeconds > toleranceSeconds) {
    throw new Error("Stripe signature timestamp outside tolerance");
  }

  const signedPayload = `${timestamp}.${rawBody.toString("utf8")}`;
  const expected = createHmac("sha256", secret)
    .update(signedPayload)
    .digest("hex");
  const expectedBuffer = Buffer.from(expected, "utf8");

  const verified = signatures.some((signature) => {
    const receivedBuffer = Buffer.from(signature, "utf8");
    return receivedBuffer.length === expectedBuffer.length
      && timingSafeEqual(receivedBuffer, expectedBuffer);
  });

  if (!verified) {
    throw new Error("Stripe signature verification failed");
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function getMetadataValue(
  metadata: StripeMetadata | null | undefined,
  keys: string[],
): string | null {
  if (!metadata) {
    return null;
  }

  for (const key of keys) {
    const value = metadata[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }

  return null;
}

async function syncLocalCheckoutRecord(event: StripeEvent): Promise<void> {
  if (event.type !== "checkout.session.completed" && event.type !== "checkout.session.expired") {
    return;
  }

  const session = event.data?.object;
  if (!isRecord(session) || typeof session.id !== "string") {
    return;
  }

  const metadata = isRecord(session.metadata)
    ? (session.metadata as StripeMetadata)
    : null;
  const installCode = getMetadataValue(metadata, ["install_code", "installCode"]);
  const archetypeValue = getMetadataValue(metadata, [
    "archetype_slug",
    "archetype",
    "template",
  ]);

  if (!installCode || !archetypeValue || !isArchetype(archetypeValue)) {
    return;
  }

  await upsertCheckoutSessionRecord({
    sessionId: session.id,
    installCode,
    archetype: archetypeValue,
    status: event.type === "checkout.session.completed" ? "queued" : "failed",
    installUrl: buildGatewayInstallUrl({
      gatewayBaseUrl: getGatewayBaseUrl(),
      archetype: archetypeValue,
      installCode,
    }),
    customerEmail:
      typeof session.customer_email === "string"
        ? session.customer_email
        : isRecord(session.customer_details)
          && typeof session.customer_details.email === "string"
          ? session.customer_details.email
          : null,
    error:
      event.type === "checkout.session.expired"
        ? "Stripe checkout expired before payment completed."
        : null,
    paidAt: event.type === "checkout.session.completed" ? Date.now() : null,
    updatedAt: Date.now(),
  });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json(
      { error: "Missing STRIPE_WEBHOOK_SECRET" },
      { status: 503 },
    );
  }

  const signatureHeader = request.headers.get("stripe-signature");
  if (!signatureHeader) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 },
    );
  }

  const rawText = await request.text();
  const rawBody = Buffer.from(rawText, "utf8");

  try {
    verifyStripeSignature(rawBody, signatureHeader, webhookSecret);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Stripe signature verification failed",
      },
      { status: 400 },
    );
  }

  let event: StripeEvent;
  try {
    event = JSON.parse(rawText) as StripeEvent;
  } catch {
    return NextResponse.json(
      { error: "Stripe webhook body is not valid JSON" },
      { status: 400 },
    );
  }

  await syncLocalCheckoutRecord(event).catch(() => undefined);

  try {
    const upstream = await fetch(`${getGatewayBaseUrl()}/stripe/webhook`, {
      method: "POST",
      headers: {
        "content-type": request.headers.get("content-type") || "application/json",
        "stripe-signature": signatureHeader,
      },
      body: rawBody,
      cache: "no-store",
    });

    const responseBody = await upstream.text();
    return new NextResponse(responseBody, {
      status: upstream.status,
      headers: {
        "content-type":
          upstream.headers.get("content-type") || "application/json",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to forward Stripe webhook to TeamPilot gateway" },
      { status: 502 },
    );
  }
}
