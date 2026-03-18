/**
 * Sync OpenClaw logs to Convex contentResources (type: system_log)
 * and Typesense otel_events collection.
 *
 * Sources:
 *   - ~/.openclaw/logs/commands.log (JSONL)
 *   - ~/.openclaw/logs/config-audit.jsonl (JSONL)
 *   - ~/.openclaw/logs/memory-health.log (JSONL)
 *   - ~/.openclaw/logs/github-sync.log (plain text, timestamped)
 *   - ~/.openclaw/logs/auto-remediation.log (plain text)
 *
 * Usage: npx tsx scripts/sync-logs-to-convex.ts
 */

import { ConvexHttpClient } from "convex/browser";
import { anyApi, type FunctionReference } from "convex/server";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";

const CONVEX_URL = "https://clever-partridge-439.convex.cloud";
const TYPESENSE_URL = process.env.TYPESENSE_URL || "http://localhost:8108";
const TYPESENSE_API_KEY =
  process.env.TYPESENSE_API_KEY ||
  "afa29bf59680cdb1210ef444c2bff7517cc8fbac4261ec009adcb0810c7e7bb9";
const LOGS_DIR = join(process.env.HOME || "/home/lucas", ".openclaw/logs");

const client = new ConvexHttpClient(CONVEX_URL);
const upsertRef = (anyApi as any).contentResources
  .upsert as FunctionReference<"mutation">;

function hash(s: string): string {
  return createHash("sha256").update(s).digest("hex").slice(0, 16);
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

type LogEntry = {
  action: string;
  tool: string;
  detail: string;
  reason?: string;
  timestamp: number; // unix seconds
  level: string;
  source: string;
  component: string;
};

function readJsonlFile(path: string): unknown[] {
  try {
    const raw = readFileSync(path, "utf-8");
    return raw
      .split("\n")
      .filter((l) => l.trim())
      .map((l) => {
        try {
          return JSON.parse(l);
        } catch {
          return null;
        }
      })
      .filter(Boolean);
  } catch {
    return [];
  }
}

function parseCommandsLog(): LogEntry[] {
  const entries = readJsonlFile(join(LOGS_DIR, "commands.log")) as Array<{
    timestamp: string;
    action: string;
    sessionKey?: string;
    senderId?: string;
    source?: string;
  }>;
  return entries.map((e) => ({
    action: `command.${e.action || "unknown"}`,
    tool: e.source || "unknown",
    detail: `Session ${e.sessionKey || "?"} from ${e.source || "?"} (sender: ${e.senderId || "?"})`,
    timestamp: Math.floor(new Date(e.timestamp).getTime() / 1000),
    level: "info",
    source: "gateway",
    component: "commands",
  }));
}

function parseConfigAudit(): LogEntry[] {
  const entries = readJsonlFile(join(LOGS_DIR, "config-audit.jsonl")) as Array<{
    ts: string;
    source?: string;
    event?: string;
    result?: string;
    gatewayModeBefore?: string;
    gatewayModeAfter?: string;
    previousBytes?: number;
    nextBytes?: number;
    suspicious?: string[];
  }>;
  return entries.map((e) => {
    const hasSuspicious = (e.suspicious?.length ?? 0) > 0;
    return {
      action: `config.${e.result || e.event || "write"}`,
      tool: "config-io",
      detail: `Config ${e.result || "write"}: ${e.previousBytes || 0}B → ${e.nextBytes || 0}B, mode: ${e.gatewayModeBefore || "?"} → ${e.gatewayModeAfter || "?"}${hasSuspicious ? ` [SUSPICIOUS: ${e.suspicious!.join(", ")}]` : ""}`,
      reason: hasSuspicious ? e.suspicious!.join(", ") : undefined,
      timestamp: Math.floor(new Date(e.ts).getTime() / 1000),
      level: hasSuspicious ? "warn" : "info",
      source: "gateway",
      component: "config-io",
    };
  });
}

function parseMemoryHealth(): LogEntry[] {
  const entries = readJsonlFile(join(LOGS_DIR, "memory-health.log")) as Array<{
    ts: string;
    statusHealth?: string;
    doctorWarnings?: number;
    doctorErrors?: number;
    dirtyCount?: number;
    issues?: string[];
    agentCount?: number;
    slo?: { status?: string; alerts?: string[] };
  }>;
  return entries.map((e) => {
    const issues = e.issues || [];
    const sloAlerts = e.slo?.alerts || [];
    const allIssues = [...issues, ...sloAlerts];
    const level =
      e.statusHealth === "error" || (e.doctorErrors ?? 0) > 0
        ? "error"
        : e.statusHealth === "warning" || allIssues.length > 0
          ? "warn"
          : "info";
    return {
      action: "health.check",
      tool: "memory",
      detail: `Health: ${e.statusHealth || "unknown"}, agents: ${e.agentCount || 0}, dirty: ${e.dirtyCount || 0}${allIssues.length > 0 ? ` — ${allIssues.join("; ")}` : ""}`,
      reason: allIssues.length > 0 ? allIssues.join("; ") : undefined,
      timestamp: Math.floor(new Date(e.ts).getTime() / 1000),
      level,
      source: "worker",
      component: "memory-health",
    };
  });
}

function parseGithubSync(): LogEntry[] {
  try {
    const raw = readFileSync(join(LOGS_DIR, "github-sync.log"), "utf-8");
    const lines = raw.split("\n").filter((l) => l.trim());
    const entries: LogEntry[] = [];
    for (const line of lines) {
      // Lines look like: "2026-02-27 04:15:00 [commit] message" or just timestamped text
      const match = line.match(
        /^(\d{4}-\d{2}-\d{2}[\sT]\d{2}:\d{2}:\d{2})\s*(.+)/
      );
      if (!match) continue;
      const ts = Math.floor(new Date(match[1]!).getTime() / 1000);
      if (isNaN(ts)) continue;
      const msg = match[2]!;
      const isError =
        /error|fail|fatal/i.test(msg) && !/0 errors/i.test(msg);
      entries.push({
        action: "git.sync",
        tool: "github-sync",
        detail: msg.slice(0, 500),
        timestamp: ts,
        level: isError ? "error" : "info",
        source: "worker",
        component: "github-sync",
      });
    }
    return entries;
  } catch {
    return [];
  }
}

function parseAutoRemediation(): LogEntry[] {
  try {
    const raw = readFileSync(
      join(LOGS_DIR, "auto-remediation.log"),
      "utf-8"
    );
    const lines = raw.split("\n").filter((l) => l.trim());
    const entries: LogEntry[] = [];
    let currentTs = 0;
    for (const line of lines) {
      const tsMatch = line.match(
        /^(\d{4}-\d{2}-\d{2}[\sT]\d{2}:\d{2}:\d{2})/
      );
      if (tsMatch) {
        currentTs = Math.floor(new Date(tsMatch[1]!).getTime() / 1000);
      }
      if (!currentTs || isNaN(currentTs)) continue;
      const isError = /error|fail|critical|vulnerabilit/i.test(line);
      entries.push({
        action: "auto-remediation",
        tool: "remediation",
        detail: line.slice(0, 500),
        timestamp: currentTs,
        level: isError ? "warn" : "info",
        source: "worker",
        component: "auto-remediation",
      });
    }
    return entries;
  } catch {
    return [];
  }
}

async function pushToConvex(entries: LogEntry[]): Promise<number> {
  let synced = 0;
  for (const entry of entries) {
    const id = hash(`${entry.tool}:${entry.timestamp}:${entry.detail}`);
    try {
      await client.mutation(upsertRef, {
        resourceId: `slog:${id}`,
        type: "system_log",
        fields: {
          action: entry.action,
          tool: entry.tool,
          detail: entry.detail,
          reason: entry.reason,
          timestamp: entry.timestamp,
        },
        searchText: [
          entry.action,
          entry.tool,
          entry.detail,
          entry.reason,
        ]
          .filter(Boolean)
          .join(" "),
      });
      synced++;
      if (synced % 50 === 0) {
        console.log(`  [convex] ${synced} entries synced...`);
        await sleep(50);
      }
    } catch (err) {
      // skip duplicates / errors silently
    }
  }
  return synced;
}

async function pushToTypesense(entries: LogEntry[]): Promise<number> {
  let synced = 0;
  const batchSize = 40;
  for (let i = 0; i < entries.length; i += batchSize) {
    const batch = entries.slice(i, i + batchSize);
    const jsonl = batch
      .map((e) => {
        const id = hash(`${e.source}:${e.component}:${e.timestamp}:${e.action}:${e.detail}`);
        const tsMs = e.timestamp * 1000;
        return JSON.stringify({
          id,
          timestamp: tsMs,
          date: new Date(tsMs).toISOString(),
          level: e.level,
          source: e.source,
          component: e.component,
          action: e.action,
          success: e.level !== "error" && e.level !== "fatal",
          error: e.level === "error" || e.level === "fatal" ? e.detail : undefined,
          metadata_json: "{}",
          metadata_keys: [],
          search_text: [e.source, e.component, e.action, e.detail]
            .filter(Boolean)
            .join(" "),
        });
      })
      .join("\n");

    try {
      const resp = await fetch(
        `${TYPESENSE_URL}/collections/otel_events/documents/import?action=upsert`,
        {
          method: "POST",
          headers: {
            "X-TYPESENSE-API-KEY": TYPESENSE_API_KEY,
            "Content-Type": "text/plain",
          },
          body: jsonl,
        }
      );
      if (resp.ok) {
        synced += batch.length;
      }
    } catch {
      // skip
    }
    if (i % 200 === 0 && i > 0) {
      console.log(`  [typesense] ${synced} otel events synced...`);
    }
  }
  return synced;
}

async function main() {
  console.log("[log-sync] Parsing OpenClaw logs...");

  const sources = [
    { name: "commands.log", parse: parseCommandsLog },
    { name: "config-audit.jsonl", parse: parseConfigAudit },
    { name: "memory-health.log", parse: parseMemoryHealth },
    { name: "github-sync.log", parse: parseGithubSync },
    { name: "auto-remediation.log", parse: parseAutoRemediation },
  ];

  let allEntries: LogEntry[] = [];
  for (const src of sources) {
    const entries = src.parse();
    console.log(`  ${src.name}: ${entries.length} entries`);
    allEntries.push(...entries);
  }

  // Sort by timestamp descending (most recent first)
  allEntries.sort((a, b) => b.timestamp - a.timestamp);
  console.log(`[log-sync] Total: ${allEntries.length} log entries`);

  // Push to Convex (syslog page)
  console.log("[log-sync] Pushing to Convex (system_log)...");
  const convexCount = await pushToConvex(allEntries);
  console.log(`[log-sync] Convex: ${convexCount} entries synced`);

  // Push to Typesense (otel_events for system events page)
  console.log("[log-sync] Pushing to Typesense (otel_events)...");
  const tsCount = await pushToTypesense(allEntries);
  console.log(`[log-sync] Typesense: ${tsCount} otel events synced`);

  console.log("[log-sync] Done!");
}

main().catch((err) => {
  console.error("[log-sync] Fatal:", err);
  process.exit(1);
});
