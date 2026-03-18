export const VALID_ARCHETYPES = [
  "marketing-machine",
  "sales-accelerator",
  "ops-commander",
  "support-hub",
  "dev-companion",
] as const;

export type Archetype = (typeof VALID_ARCHETYPES)[number];

export const ARCHETYPE_LABELS: Record<Archetype, string> = {
  "marketing-machine": "Marketing Machine",
  "sales-accelerator": "Sales Accelerator",
  "ops-commander": "Ops Commander",
  "support-hub": "Support Hub",
  "dev-companion": "Dev Companion",
};

export type InstallStatus = "pending" | "queued" | "provisioning" | "ready" | "failed";

export type InstallCurrentState =
  | "queued"
  | "deploying"
  | "configuring"
  | "health-checking"
  | "ready"
  | "failed";

export interface InstallStatusPayload {
  status: InstallStatus;
  phase: string;
  currentState: InstallCurrentState | null;
  installUrl: string | null;
  error: string | null;
  provisioningRunId: string | null;
}

export interface CheckoutSessionRecord {
  sessionId: string;
  installCode: string;
  archetype: Archetype;
  status: InstallStatus;
  installUrl: string;
  customerEmail: string | null;
  error: string | null;
  paidAt: number | null;
  updatedAt: number;
}

export function isArchetype(value: string): value is Archetype {
  return (VALID_ARCHETYPES as readonly string[]).includes(value);
}

export function getGatewayBaseUrl(): string {
  return process.env.TEAM_PILOT_GATEWAY_URL
    || "https://slack-gateway-production-5b7d.up.railway.app";
}

export function buildGatewayInstallUrl(params: {
  gatewayBaseUrl: string;
  archetype: Archetype;
  installCode: string;
}): string {
  const url = new URL("/slack/install", params.gatewayBaseUrl);
  url.searchParams.set("template", params.archetype);
  url.searchParams.set("install_code", params.installCode);
  return url.toString();
}

export function buildCheckoutReturnUrls(params: {
  origin: string;
  archetype: Archetype;
  installCode: string;
}): {
  successUrl: string;
  cancelUrl: string;
} {
  return {
    successUrl:
      `${new URL("/setup", params.origin).toString()}?`
      + `archetype=${encodeURIComponent(params.archetype)}`
      + `&session_id={CHECKOUT_SESSION_ID}`
      + `&install_code=${encodeURIComponent(params.installCode)}`,
    cancelUrl:
      `${new URL("/buy", params.origin).toString()}?`
      + `cancelled=1`
      + `&archetype=${encodeURIComponent(params.archetype)}`,
  };
}

export function buildCheckoutResourceId(sessionId: string): string {
  return `team-install-checkout:${sessionId}`;
}

export function buildCheckoutSearchText(record: CheckoutSessionRecord): string {
  return [
    record.sessionId,
    record.installCode,
    record.archetype,
    ARCHETYPE_LABELS[record.archetype],
    record.status,
    record.customerEmail ?? "",
    record.error ?? "",
  ]
    .filter(Boolean)
    .join(" ");
}

function isInstallStatus(value: unknown): value is InstallStatus {
  return value === "pending"
    || value === "queued"
    || value === "provisioning"
    || value === "ready"
    || value === "failed";
}

function isInstallCurrentState(value: unknown): value is InstallCurrentState {
  return value === "queued"
    || value === "deploying"
    || value === "configuring"
    || value === "health-checking"
    || value === "ready"
    || value === "failed";
}

export function normalizeInstallStatus(
  payload?: Partial<InstallStatusPayload> | null,
  fallback?: { installUrl?: string | null },
): InstallStatusPayload {
  const status = isInstallStatus(payload?.status) ? payload.status : "pending";
  return {
    status,
    phase: typeof payload?.phase === "string" ? payload.phase : status,
    currentState: isInstallCurrentState(payload?.currentState)
      ? payload.currentState
      : null,
    installUrl:
      typeof payload?.installUrl === "string"
        ? payload.installUrl
        : fallback?.installUrl ?? null,
    error: typeof payload?.error === "string" ? payload.error : null,
    provisioningRunId:
      typeof payload?.provisioningRunId === "string"
        ? payload.provisioningRunId
        : null,
  };
}
