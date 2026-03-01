import { describe, expect, test } from "bun:test"
import { readFile } from "node:fs/promises"
import { join } from "node:path"

describe("applied-leverage systemd user service", () => {
  test("includes required worker settings", async () => {
    const unitPath = join(import.meta.dir, "..", "infra", "systemd", "applied-leverage-system-bus.service")
    const unit = await readFile(unitPath, "utf8")

    expect(unit).toContain("ExecStart=%h/applied-leverage-site/packages/system-bus/start.sh")
    expect(unit).toContain("WorkingDirectory=%h/applied-leverage-site/packages/system-bus")
    expect(unit).toContain("Restart=on-failure")
    expect(unit).toContain("RestartSec=10")
  })
})
