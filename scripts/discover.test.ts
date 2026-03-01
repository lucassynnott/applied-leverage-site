import { describe, expect, test } from "bun:test"
import { mkdtemp, readFile, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { discover, parseDotEnv, slugifyDiscoveryUrl } from "./discover"

describe("discover script", () => {
  test("parses dotenv values", () => {
    const parsed = parseDotEnv(`
# comment
INNGEST_EVENT_KEY=abc123
export OTHER="value"
`)

    expect(parsed.INNGEST_EVENT_KEY).toBe("abc123")
    expect(parsed.OTHER).toBe("value")
  })

  test("posts discovery/noted when Inngest is reachable", async () => {
    const repoRoot = await mkdtemp(join(tmpdir(), "discover-script-"))
    await writeFile(join(repoRoot, ".env"), "INNGEST_EVENT_KEY=test-key\n", "utf8")

    const fixedNow = new Date("2026-03-01T00:00:00.000Z")
    let postedUrl = ""
    let postedBody: unknown = null

    const result = await discover(["https://example.com/repo", "interesting"], {
      repoRoot,
      env: {},
      now: () => fixedNow,
      fetchFn: async (input, init) => {
        postedUrl = typeof input === "string" ? input : input.toString()
        postedBody = JSON.parse(String(init?.body ?? "{}"))
        return new Response(JSON.stringify({ ids: ["evt_123"] }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      },
    })

    expect(result.mode).toBe("event")
    expect(postedUrl).toBe("http://localhost:8288/e/test-key")
    expect(postedBody).toEqual({
      name: "discovery/noted",
      data: {
        url: "https://example.com/repo",
        context: "interesting",
        discoveredAt: "2026-03-01T00:00:00.000Z",
      },
    })
  })

  test("writes fallback stub when Inngest is unreachable", async () => {
    const root = await mkdtemp(join(tmpdir(), "discover-fallback-"))
    await writeFile(join(root, ".env"), "INNGEST_EVENT_KEY=fallback-key\n", "utf8")

    const result = await discover(["https://github.com/foo/bar", "check this out"], {
      repoRoot: root,
      homeDir: root,
      env: {},
      now: () => new Date("2026-03-01T01:02:03.000Z"),
      fetchFn: async () => {
        throw new Error("connect ECONNREFUSED 127.0.0.1:8288")
      },
    })

    expect(result.mode).toBe("fallback")
    expect(result.stubPath).toContain(".openclaw/workspace/discoveries")
    expect(result.stubPath).toContain(slugifyDiscoveryUrl("https://github.com/foo/bar"))

    const stub = await readFile(result.stubPath, "utf8")
    expect(stub).toContain("https://github.com/foo/bar")
    expect(stub).toContain("check this out")
    expect(stub).toContain("2026-03-01T01:02:03.000Z")
  })

  test("throws when event key is missing", async () => {
    const root = await mkdtemp(join(tmpdir(), "discover-missing-key-"))
    await expect(discover(["https://example.com"], { repoRoot: root, env: {} }))
      .rejects.toThrow("Missing INNGEST_EVENT_KEY")
  })
})
