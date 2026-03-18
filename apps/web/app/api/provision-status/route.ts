import { NextRequest, NextResponse } from "next/server";
import {
  buildGatewayInstallUrl,
  getGatewayBaseUrl,
  type InstallStatusPayload,
  isArchetype,
  normalizeInstallStatus,
} from "@/lib/team-install";
import {
  getCheckoutSessionRecord,
  upsertCheckoutSessionRecord,
} from "@/lib/team-install-store";

export const runtime = "nodejs";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const sessionId = request.nextUrl.searchParams.get("session_id");
  const installCodeParam = request.nextUrl.searchParams.get("install_code");
  const archetypeParam = request.nextUrl.searchParams.get("archetype");

  if (!sessionId && !installCodeParam) {
    return NextResponse.json(
      { error: "session_id or install_code is required" },
      { status: 400 },
    );
  }

  const localRecord = sessionId
    ? await getCheckoutSessionRecord(sessionId)
    : null;
  const installCode = installCodeParam ?? localRecord?.installCode ?? null;
  const archetype =
    (archetypeParam && isArchetype(archetypeParam) && archetypeParam)
    || localRecord?.archetype
    || null;
  const fallbackInstallUrl =
    localRecord?.installUrl
    || (installCode && archetype
      ? buildGatewayInstallUrl({
        gatewayBaseUrl: getGatewayBaseUrl(),
        archetype,
        installCode,
      })
      : null);

  let payload: InstallStatusPayload | null = null;
  try {
    const upstream = new URL("/api/provisioning-status", getGatewayBaseUrl());
    if (sessionId) {
      upstream.searchParams.set("session_id", sessionId);
    }
    if (installCode) {
      upstream.searchParams.set("install_code", installCode);
    }

    const response = await fetch(upstream, {
      headers: { accept: "application/json" },
      cache: "no-store",
    });

    if (response.ok) {
      payload = normalizeInstallStatus(
        (await response.json()) as Partial<InstallStatusPayload>,
        { installUrl: fallbackInstallUrl },
      );
    }
  } catch {
    payload = null;
  }

  const normalized = payload
    ?? normalizeInstallStatus(
      localRecord
        ? {
          status: localRecord.status,
          phase: localRecord.status,
          installUrl: localRecord.installUrl,
          error: localRecord.error,
        }
        : undefined,
      { installUrl: fallbackInstallUrl },
    );

  if (
    sessionId
    && installCode
    && archetype
    && (!localRecord
      || localRecord.status !== normalized.status
      || localRecord.error !== normalized.error
      || localRecord.installUrl !== (normalized.installUrl ?? localRecord.installUrl))
  ) {
    void upsertCheckoutSessionRecord({
      sessionId,
      installCode,
      archetype,
      status: normalized.status,
      installUrl: normalized.installUrl ?? fallbackInstallUrl ?? localRecord?.installUrl ?? "",
      customerEmail: localRecord?.customerEmail ?? null,
      error: normalized.error,
      paidAt: localRecord?.paidAt ?? (normalized.status !== "pending" ? Date.now() : null),
      updatedAt: Date.now(),
    }).catch(() => false);
  }

  return NextResponse.json(normalized);
}
