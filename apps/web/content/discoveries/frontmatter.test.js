import { describe, expect, it } from "bun:test";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const discoveriesDir = path.resolve(import.meta.dir);

describe("discoveries frontmatter", () => {
  it("parses all discovery markdown files", () => {
    const files = fs.readdirSync(discoveriesDir).filter((file) => file.endsWith(".md"));
    expect(files.length).toBeGreaterThan(0);

    for (const file of files) {
      const content = fs.readFileSync(path.join(discoveriesDir, file), "utf8");
      expect(() => matter(content)).not.toThrow();
    }
  });
});
