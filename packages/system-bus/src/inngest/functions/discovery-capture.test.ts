import { describe, expect, test } from "bun:test";
import { resolveDiscoveryCapturePaths } from "./discovery-capture";

describe("discovery-capture path resolution", () => {
  test("derives discovery and temp paths from HOME", () => {
    const resolved = resolveDiscoveryCapturePaths({
      HOME: "/tmp/discovery-home",
    });

    expect(resolved).toEqual({
      vaultDiscoveriesDir: "/tmp/discovery-home/Vault/Resources/discoveries",
      tempRoot: "/tmp",
    });
  });

  test("honors explicit VAULT_PATH and TMPDIR overrides", () => {
    const resolved = resolveDiscoveryCapturePaths({
      HOME: "/tmp/ignored-home",
      VAULT_PATH: "/tmp/custom-vault",
      TMPDIR: "/tmp/custom-temp",
    });

    expect(resolved).toEqual({
      vaultDiscoveriesDir: "/tmp/custom-vault/Resources/discoveries",
      tempRoot: "/tmp/custom-temp",
    });
  });
});
