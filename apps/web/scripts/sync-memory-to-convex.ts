/**
 * Sync OpenClaw memory observations to Convex contentResources (type: memory_observation).
 *
 * Reads from the OpenClaw SQLite memory databases at ~/.openclaw/memory/*.sqlite
 * using the sqlite3 CLI (avoids Node native module version issues).
 *
 * Usage: npx tsx scripts/sync-memory-to-convex.ts
 */

import { ConvexHttpClient } from "convex/browser";
import { anyApi, type FunctionReference } from "convex/server";
import { execSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { join, basename } from "node:path";
import { createHash } from "node:crypto";

const CONVEX_URL = "https://clever-partridge-439.convex.cloud";
const MEMORY_DIR = join(
  process.env.HOME || "/home/lucas",
  ".openclaw/memory"
);

const client = new ConvexHttpClient(CONVEX_URL);
const upsertRef = (anyApi as any).contentResources
  .upsert as FunctionReference<"mutation">;

function hash(s: string): string {
  return createHash("sha256").update(s).digest("hex").slice(0, 16);
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function categorizeFromPath(path: string): string {
  if (/memory/i.test(path)) return "workflow";
  if (/session.?log/i.test(path)) return "workflow";
  if (/debug|error|fix|bug/i.test(path)) return "debugging";
  if (/arch|design|pattern|struct/i.test(path)) return "architecture";
  if (/prefer|config|setting/i.test(path)) return "preference";
  if (/tool|plugin|integration/i.test(path)) return "tool";
  if (/decision|adr|choice/i.test(path)) return "decision";
  return "general";
}

function categorizeFromContent(text: string): string {
  if (/error|bug|fix|debug|stack trace|exception/i.test(text))
    return "debugging";
  if (/architect|pattern|design|schema|struct/i.test(text))
    return "architecture";
  if (/prefer|always|never|convention|style/i.test(text))
    return "preference";
  if (/tool|plugin|npm|package|install/i.test(text)) return "tool";
  if (/decide|chose|tradeoff|alternative/i.test(text)) return "decision";
  if (/workflow|pipeline|process|deploy/i.test(text)) return "workflow";
  return "general";
}

type MemoryChunk = {
  id: string;
  path: string;
  source: string;
  text: string;
  updated_at: number;
};

function queryChunks(dbPath: string): MemoryChunk[] {
  try {
    // Use sqlite3 CLI with JSON output
    const result = execSync(
      `sqlite3 -json "${dbPath}" "SELECT id, path, source, text, updated_at FROM chunks WHERE length(text) > 50 ORDER BY updated_at DESC LIMIT 500;"`,
      { maxBuffer: 100 * 1024 * 1024, encoding: "utf-8" }
    );
    return JSON.parse(result) as MemoryChunk[];
  } catch (err) {
    console.error(
      `  Error querying ${dbPath}:`,
      err instanceof Error ? err.message.slice(0, 200) : err
    );
    return [];
  }
}

async function main() {
  console.log("[memory-sync] Reading OpenClaw memory databases...");

  const sqliteFiles = readdirSync(MEMORY_DIR).filter((f) =>
    f.endsWith(".sqlite")
  );
  console.log(
    `[memory-sync] Found ${sqliteFiles.length} SQLite databases: ${sqliteFiles.join(", ")}`
  );

  let totalChunks = 0;
  let synced = 0;
  let errors = 0;

  for (const file of sqliteFiles) {
    const dbPath = join(MEMORY_DIR, file);
    const agentName = basename(file, ".sqlite");
    console.log(
      `\n[memory-sync] Processing ${file} (agent: ${agentName})...`
    );

    const chunks = queryChunks(dbPath);
    console.log(`  Found ${chunks.length} chunks`);
    totalChunks += chunks.length;

    // Deduplicate by content hash
    const seen = new Set<string>();
    const uniqueChunks = chunks.filter((c) => {
      const h = hash(c.text);
      if (seen.has(h)) return false;
      seen.add(h);
      return true;
    });
    console.log(`  ${uniqueChunks.length} unique chunks after dedup`);

    for (const chunk of uniqueChunks) {
      const obsId = hash(`${agentName}:${chunk.id}`);
      const category =
        categorizeFromContent(chunk.text) !== "general"
          ? categorizeFromContent(chunk.text)
          : categorizeFromPath(chunk.path);

      const observation = chunk.text.slice(0, 2000);
      const tsSeconds = Math.floor(chunk.updated_at / 1000);

      try {
        await client.mutation(upsertRef, {
          resourceId: `obs:${obsId}`,
          type: "memory_observation",
          fields: {
            observationId: obsId,
            observation,
            category,
            source: agentName,
            superseded: false,
            timestamp: tsSeconds,
            path: chunk.path,
          },
          searchText: [observation.slice(0, 500), category, agentName]
            .filter(Boolean)
            .join(" "),
        });
        synced++;
        if (synced % 50 === 0) {
          console.log(`  Progress: ${synced} observations synced...`);
          await sleep(50);
        }
      } catch (err) {
        errors++;
        if (errors <= 5) {
          console.error(
            `  Error syncing obs:${obsId}:`,
            err instanceof Error ? err.message : err
          );
        }
      }
    }
  }

  console.log(
    `\n[memory-sync] Done: ${synced} observations synced, ${errors} errors (from ${totalChunks} total chunks)`
  );
}

main().catch((err) => {
  console.error("[memory-sync] Fatal:", err);
  process.exit(1);
});
