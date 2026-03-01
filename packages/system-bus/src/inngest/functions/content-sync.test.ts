import { describe, expect, test } from "bun:test";
import { resolveContentSyncPaths } from "./content-sync";

describe("content-sync path resolution", () => {
  test("derives vault and repo paths from HOME", () => {
    const resolved = resolveContentSyncPaths({
      HOME: "/tmp/content-sync-home",
    });

    expect(resolved.repoRoot).toBe("/tmp/content-sync-home/Code/joelhooks/joelclaw");
    expect(resolved.contentDirs).toEqual([
      {
        name: "adrs",
        source: "/tmp/content-sync-home/Vault/docs/decisions",
        dest: "/tmp/content-sync-home/Code/joelhooks/joelclaw/apps/web/content/adrs",
        gitPath: "apps/web/content/adrs",
        skipFiles: ["readme.md"],
      },
      {
        name: "discoveries",
        source: "/tmp/content-sync-home/Vault/Resources/discoveries",
        dest: "/tmp/content-sync-home/Code/joelhooks/joelclaw/apps/web/content/discoveries",
        gitPath: "apps/web/content/discoveries",
        skipFiles: [],
      },
    ]);
  });

  test("honors explicit vault and repo root overrides", () => {
    const resolved = resolveContentSyncPaths({
      HOME: "/tmp/ignored-home",
      VAULT_PATH: "/tmp/custom-vault",
      JOELCLAW_REPO_ROOT: "/tmp/custom-repo/",
    });

    expect(resolved.repoRoot).toBe("/tmp/custom-repo");
    expect(resolved.contentDirs.map((dir) => dir.source)).toEqual([
      "/tmp/custom-vault/docs/decisions",
      "/tmp/custom-vault/Resources/discoveries",
    ]);
    expect(resolved.contentDirs.map((dir) => dir.dest)).toEqual([
      "/tmp/custom-repo/apps/web/content/adrs",
      "/tmp/custom-repo/apps/web/content/discoveries",
    ]);
    expect(resolved.contentDirs.map((dir) => dir.gitPath)).toEqual([
      "apps/web/content/adrs",
      "apps/web/content/discoveries",
    ]);
  });
});
