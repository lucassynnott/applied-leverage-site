import { describe, expect, test } from "vitest";
import { injectChannelContext } from "./index";

describe("injectChannelContext", () => {
  test("injects Slack context and strict protocol reminders", () => {
    const result = injectChannelContext("Please coordinate this with River.", {
      source: "slack:C123456:1741028400.000100",
      now: new Date("2026-03-03T12:00:00Z"),
    });

    expect(result).toContain("Channel: slack");
    expect(result).toContain("Inter-agent protocol (MANDATORY): one turn only");
    expect(result).toContain("Never send echo-only or acknowledgment-only repeats");
    expect(result).toContain("Do not role-play both sides of a conversation.");
    expect(result.endsWith("Please coordinate this with River.")).toBe(true);
  });

  test("injects Slack context for passive intel sources", () => {
    const result = injectChannelContext("Signal only.", {
      source: "slack-intel:C999",
      now: new Date("2026-03-03T12:00:00Z"),
    });

    expect(result).toContain("Channel: slack");
    expect(result).toContain("Platform capabilities:");
  });

  test("keeps unknown channels unchanged", () => {
    const input = "No channel context expected.";
    const result = injectChannelContext(input, {
      source: "gateway",
      now: new Date("2026-03-03T12:00:00Z"),
    });
    expect(result).toBe(input);
  });

  test("does not inject twice for retries", () => {
    const first = injectChannelContext("Hello.", {
      source: "slack:C1",
      now: new Date("2026-03-03T12:00:00Z"),
    });
    const second = injectChannelContext(first, {
      source: "slack:C1",
      now: new Date("2026-03-03T12:00:00Z"),
    });
    expect(second).toBe(first);
  });
});
