import { describe, expect, it } from "bun:test";
import {
  buildCheckoutReturnUrls,
  buildGatewayInstallUrl,
  normalizeInstallStatus,
} from "./team-install";

describe("buildCheckoutReturnUrls", () => {
  it("embeds the install code in the setup redirect", () => {
    expect(
      buildCheckoutReturnUrls({
        origin: "https://os.appliedleverage.io",
        archetype: "marketing-machine",
        installCode: "install_123",
      }),
    ).toEqual({
      successUrl:
        "https://os.appliedleverage.io/setup?archetype=marketing-machine&session_id={CHECKOUT_SESSION_ID}&install_code=install_123",
      cancelUrl:
        "https://os.appliedleverage.io/buy?cancelled=1&archetype=marketing-machine",
    });
  });
});

describe("buildGatewayInstallUrl", () => {
  it("creates a Slack OAuth install link for the paid session", () => {
    expect(
      buildGatewayInstallUrl({
        gatewayBaseUrl: "https://slack-gateway.example.com",
        archetype: "ops-commander",
        installCode: "install_456",
      }),
    ).toBe(
      "https://slack-gateway.example.com/slack/install?template=ops-commander&install_code=install_456",
    );
  });
});

describe("normalizeInstallStatus", () => {
  it("keeps a queued payload and injects the fallback install URL", () => {
    expect(
      normalizeInstallStatus(
        {
          status: "queued",
          phase: "awaiting_slack_install",
        },
        {
          installUrl: "https://slack-gateway.example.com/slack/install?template=marketing-machine&install_code=install_123",
        },
      ),
    ).toEqual({
      status: "queued",
      phase: "awaiting_slack_install",
      currentState: null,
      installUrl:
        "https://slack-gateway.example.com/slack/install?template=marketing-machine&install_code=install_123",
      error: null,
      provisioningRunId: null,
    });
  });

  it("falls back to pending when the payload is missing", () => {
    expect(normalizeInstallStatus(undefined)).toEqual({
      status: "pending",
      phase: "pending",
      currentState: null,
      installUrl: null,
      error: null,
      provisioningRunId: null,
    });
  });
});
