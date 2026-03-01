import { describe, expect, it } from "bun:test";
import { buildSearchNextActions } from "./action-utils";

describe("buildSearchNextActions", () => {
  it("includes top-hit action when topHit is provided", () => {
    const actions = buildSearchNextActions({
      origin: "https://example.com",
      query: "hello world",
      limit: 10,
      topHit: { url: "/foo", title: "Foo Title" },
    });

    expect(actions[0]).toEqual({
      command: 'curl -sS "https://example.com/foo"',
      description: "Read top result: Foo Title",
    });
  });

  it("omits top-hit action when topHit is missing", () => {
    const actions = buildSearchNextActions({
      origin: "https://example.com",
      query: "hello world",
      limit: 10,
    });

    expect(actions[0]).toEqual({
      command: 'curl -sS "https://example.com/api/search?q=hello%20world&limit=20"',
      description: "Expand search (more results)",
    });
  });

  it("caps expanded limit at 50", () => {
    const actions = buildSearchNextActions({
      origin: "https://example.com",
      query: "x",
      limit: 49,
    });

    expect(actions[0]?.command).toContain("limit=50");
  });
});
