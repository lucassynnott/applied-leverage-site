import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import {
  ARCHETYPE_LABELS,
  buildCheckoutReturnUrls,
  buildGatewayInstallUrl,
  getGatewayBaseUrl,
  isArchetype,
} from "@/lib/team-install";
import { upsertCheckoutSessionRecord } from "@/lib/team-install-store";

export const runtime = "nodejs";

type StripeCheckoutSessionResponse = {
  id?: string;
  url?: string;
};

async function createStripeCheckoutSession(params: {
  stripeKey: string;
  origin: string;
  archetype: keyof typeof ARCHETYPE_LABELS;
  installCode: string;
}): Promise<{ id: string; url: string }> {
  const { successUrl, cancelUrl } = buildCheckoutReturnUrls({
    origin: params.origin,
    archetype: params.archetype,
    installCode: params.installCode,
  });

  const label = ARCHETYPE_LABELS[params.archetype];
  const body = new URLSearchParams({
    mode: "subscription",
    "line_items[0][price_data][currency]": "usd",
    "line_items[0][price_data][product_data][name]": `TeamPilot - ${label}`,
    "line_items[0][price_data][product_data][description]":
      `AI agent team deployed in your Slack workspace (${params.archetype})`,
    "line_items[0][price_data][recurring][interval]": "month",
    "line_items[0][price_data][unit_amount]": "29700",
    "line_items[0][quantity]": "1",
    success_url: successUrl,
    cancel_url: cancelUrl,
    client_reference_id: params.installCode,
    "metadata[install_code]": params.installCode,
    "metadata[archetype_slug]": params.archetype,
    "metadata[archetype]": params.archetype,
    "metadata[claw_recipe_slug]": params.archetype,
    "metadata[source]": "applied-leverage-site",
  });

  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${params.stripeKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
    cache: "no-store",
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Stripe checkout session failed (${response.status}): ${details}`);
  }

  const session = (await response.json()) as StripeCheckoutSessionResponse;
  if (!session.id || !session.url) {
    throw new Error("Stripe checkout session response was missing id or url");
  }

  return {
    id: session.id,
    url: session.url,
  };
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const archetype = request.nextUrl.searchParams.get("archetype");
  if (!archetype || !isArchetype(archetype)) {
    return NextResponse.json(
      {
        error:
          "archetype must be one of marketing-machine, sales-accelerator, ops-commander, support-hub, dev-companion",
      },
      { status: 400 },
    );
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return NextResponse.json(
      { error: "Missing STRIPE_SECRET_KEY" },
      { status: 503 },
    );
  }

  const installCode = randomUUID();
  const origin = request.nextUrl.origin;
  const gatewayBaseUrl = getGatewayBaseUrl();

  try {
    const session = await createStripeCheckoutSession({
      stripeKey,
      origin,
      archetype,
      installCode,
    });

    await upsertCheckoutSessionRecord({
      sessionId: session.id,
      installCode,
      archetype,
      status: "pending",
      installUrl: buildGatewayInstallUrl({
        gatewayBaseUrl,
        archetype,
        installCode,
      }),
      customerEmail: null,
      error: null,
      paidAt: null,
      updatedAt: Date.now(),
    }).catch(() => false);

    return NextResponse.redirect(session.url, 303);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to start Stripe checkout",
      },
      { status: 500 },
    );
  }
}
