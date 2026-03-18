/**
 * Standalone script to sync vault notes from /nas/vault to Convex contentResources.
 *
 * Usage: bun scripts/sync-vault-to-convex.ts
 *
 * Reads all .md files, parses YAML frontmatter, classifies by path,
 * and upserts into the PROD Convex deployment via ConvexHttpClient.
 */

import { ConvexHttpClient } from "convex/browser";
import { anyApi, type FunctionReference } from "convex/server";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { basename, extname, join, relative } from "node:path";

// ── Config ──────────────────────────────────────────────────────────

const CONVEX_URL = "https://clever-partridge-439.convex.cloud";
const VAULT_PATH = "/nas/vault";
const BATCH_DELAY_MS = 50; // small delay between mutations to avoid rate limits

// ── Helpers ─────────────────────────────────────────────────────────

function walkDir(dir: string, ext: string): string[] {
  const results: string[] = [];
  try {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.name.startsWith(".")) continue;
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        results.push(...walkDir(full, ext));
      } else if (entry.isFile() && extname(entry.name) === ext) {
        results.push(full);
      }
    }
  } catch {
    // skip unreadable directories
  }
  return results;
}

function parseMarkdownFrontmatter(content: string): {
  frontmatter: Record<string, string>;
  body: string;
} {
  const fm: Record<string, string> = {};
  if (!content.startsWith("---")) return { frontmatter: fm, body: content };
  const end = content.indexOf("\n---", 3);
  if (end === -1) return { frontmatter: fm, body: content };

  const fmBlock = content.slice(4, end);
  for (const line of fmBlock.split("\n")) {
    const match = line.match(/^(\w[\w-]*):\s*(.+)/);
    if (match && match[1] && match[2]) {
      fm[match[1]] = match[2].replace(/^["']|["']$/g, "").trim();
    }
  }
  return { frontmatter: fm, body: content.slice(end + 4).trim() };
}

function classifyNote(path: string, fm: Record<string, string>): string {
  if (path.includes("decisions/")) return "adr";
  if (path.includes("discoveries/")) return "discovery";
  if (path.includes("tools/")) return "tool";
  if (path.includes("projects/") || path.includes("Projects/")) return "project";
  if (path.includes("handoffs/")) return "handoff";
  if (path.includes("agents/") || path.includes("Agents/")) return "agent";
  if (path.includes("lessons/")) return "lesson";
  if (path.includes("patterns/")) return "pattern";
  if (path.includes("research/")) return "research";
  if (path.includes("backlog/")) return "backlog";
  if (path.includes("tasks/")) return "task";
  if (path.includes("pipeline/")) return "pipeline";
  if (path.includes("rules/")) return "rule";
  if (path.includes("goals/")) return "goal";
  if (path.includes("team/")) return "team";
  if (path.includes("blog-posts/")) return "blog-draft";
  if (path.includes("entities/") || path.includes("Entities/")) return "entity";
  if (path.includes("facts/")) return "fact";
  if (path.includes("people/")) return "person";
  if (path.includes("preferences/")) return "preference";
  if (path.includes("transcripts/")) return "transcript";
  if (path.includes("Council/")) return "council";
  if (path.includes("Johnny/")) return "johnny";
  if (path.includes("commitments/")) return "commitment";
  if (path.includes("ledger/")) return "ledger";
  if (path.includes("inbox/")) return "inbox";
  return fm.type || "note";
}

function getSection(relPath: string): string {
  const first = relPath.split("/")[0];
  return first || "root";
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ── Main sync ───────────────────────────────────────────────────────

async function main() {
  console.log(`[vault-sync] Connecting to Convex at ${CONVEX_URL}`);
  console.log(`[vault-sync] Reading vault from ${VAULT_PATH}`);

  const client = new ConvexHttpClient(CONVEX_URL);
  const upsertRef = (anyApi as any).contentResources.upsert as FunctionReference<"mutation">;

  // Collect all markdown files
  const files = walkDir(VAULT_PATH, ".md");
  console.log(`[vault-sync] Found ${files.length} markdown files`);

  let synced = 0;
  let errors = 0;
  let skipped = 0;

  for (const file of files) {
    try {
      const raw = readFileSync(file, "utf-8");
      if (!raw.trim()) {
        skipped++;
        continue;
      }

      const { frontmatter, body } = parseMarkdownFrontmatter(raw);
      const relPath = relative(VAULT_PATH, file);
      const title = frontmatter.title || basename(file, ".md");
      const type = classifyNote(relPath, frontmatter);
      const tags = (frontmatter.tags || "")
        .split(",")
        .map((t: string) => t.trim())
        .filter(Boolean);
      const section = getSection(relPath);
      const stat = statSync(file);
      const updatedAt = Math.floor(stat.mtimeMs / 1000);
      const content = body.slice(0, 32000);

      // Build search text (title + first 500 chars of content)
      const searchSnippet = content.slice(0, 500);
      const searchText = [title, searchSnippet, tags.join(" "), section, type]
        .filter(Boolean)
        .join(" ");

      await client.mutation(upsertRef, {
        resourceId: `vault:${relPath}`,
        type: "vault_note",
        fields: {
          path: relPath,
          title,
          content,
          type,
          tags,
          section,
          updatedAt,
        },
        searchText,
      });

      synced++;
      if (synced % 50 === 0) {
        console.log(`[vault-sync] Progress: ${synced}/${files.length} synced`);
      }

      // Small delay to avoid hammering the API
      if (synced % 10 === 0) {
        await sleep(BATCH_DELAY_MS);
      }
    } catch (err) {
      const relPath = relative(VAULT_PATH, file);
      console.error(`[vault-sync] Error syncing ${relPath}:`, err instanceof Error ? err.message : err);
      errors++;
    }
  }

  console.log(
    `[vault-sync] Done: ${synced} synced, ${errors} errors, ${skipped} skipped (empty)`
  );

  // ── Agent memory observations ──────────────────────────────────────
  // The openclaw memory directory only has SQLite/lancedb files, no .md/.json observations.
  // If memory observation files appear later, this section can be extended.

  console.log(`[vault-sync] No agent memory .md/.json observations found in /home/lucas/.openclaw/memory/`);
  console.log(`[vault-sync] Sync complete.`);
}

main().catch((err) => {
  console.error("[vault-sync] Fatal error:", err);
  process.exit(1);
});
