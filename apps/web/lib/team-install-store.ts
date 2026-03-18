import { ConvexHttpClient } from "convex/browser";
import type { FunctionReference } from "convex/server";
import { api } from "@/convex/_generated/api";
import {
  buildCheckoutResourceId,
  buildCheckoutSearchText,
  type CheckoutSessionRecord,
  isArchetype,
} from "./team-install";

const TEAM_INSTALL_RESOURCE_TYPE = "team_install_checkout";

function getConvexUrl(): string | null {
  return process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL || null;
}

function getConvexClient(): ConvexHttpClient | null {
  const convexUrl = getConvexUrl();
  return convexUrl ? new ConvexHttpClient(convexUrl) : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function toCheckoutSessionRecord(fields: unknown): CheckoutSessionRecord | null {
  if (!isRecord(fields)) {
    return null;
  }

  const {
    sessionId,
    installCode,
    archetype,
    status,
    installUrl,
    customerEmail,
    error,
    paidAt,
    updatedAt,
  } = fields;

  if (
    typeof sessionId !== "string"
    || typeof installCode !== "string"
    || typeof archetype !== "string"
    || !isArchetype(archetype)
    || typeof status !== "string"
    || typeof installUrl !== "string"
    || typeof updatedAt !== "number"
  ) {
    return null;
  }

  return {
    sessionId,
    installCode,
    archetype,
    status:
      status === "pending"
      || status === "queued"
      || status === "provisioning"
      || status === "ready"
      || status === "failed"
        ? status
        : "pending",
    installUrl,
    customerEmail: typeof customerEmail === "string" ? customerEmail : null,
    error: typeof error === "string" ? error : null,
    paidAt: typeof paidAt === "number" ? paidAt : null,
    updatedAt,
  };
}

export async function getCheckoutSessionRecord(
  sessionId: string,
): Promise<CheckoutSessionRecord | null> {
  const client = getConvexClient();
  if (!client) {
    return null;
  }

  const resource = await client.query(
    api.contentResources.getByResourceId as FunctionReference<"query">,
    {
      resourceId: buildCheckoutResourceId(sessionId),
    },
  );

  if (!resource || resource.type !== TEAM_INSTALL_RESOURCE_TYPE) {
    return null;
  }

  return toCheckoutSessionRecord(resource.fields);
}

export async function upsertCheckoutSessionRecord(
  record: CheckoutSessionRecord,
): Promise<boolean> {
  const client = getConvexClient();
  if (!client) {
    return false;
  }

  await client.mutation(
    api.contentResources.upsert as FunctionReference<"mutation">,
    {
      resourceId: buildCheckoutResourceId(record.sessionId),
      type: TEAM_INSTALL_RESOURCE_TYPE,
      fields: record,
      searchText: buildCheckoutSearchText(record),
    },
  );

  return true;
}
