#!/usr/bin/env bun

import { mkdir, readFile, writeFile } from "node:fs/promises"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const DEFAULT_INNGEST_URL = "http://localhost:8288"
const DISCOVERY_EVENT_NAME = "discovery/noted"

const scriptDir = dirname(fileURLToPath(import.meta.url))
const defaultRepoRoot = dirname(scriptDir)

export type DiscoveryPayload = {
  url: string
  context: string
  discoveredAt: string
}

export type DiscoverResult =
  | {
      ok: true
      mode: "event"
      event: typeof DISCOVERY_EVENT_NAME
      endpoint: string
      payload: DiscoveryPayload
      response: unknown
    }
  | {
      ok: true
      mode: "fallback"
      event: typeof DISCOVERY_EVENT_NAME
      endpoint: string
      payload: DiscoveryPayload
      reason: string
      stubPath: string
    }

type FetchFn = (input: string | URL | Request, init?: RequestInit) => Promise<Response>

type DiscoverOptions = {
  fetchFn?: FetchFn
  repoRoot?: string
  homeDir?: string
  env?: Record<string, string | undefined>
  now?: () => Date
  readFileFn?: (path: string, encoding: BufferEncoding) => Promise<string>
}

function stripWrappingQuotes(value: string): string {
  if (value.length >= 2 && value.startsWith("\"") && value.endsWith("\"")) {
    return value.slice(1, -1)
  }
  if (value.length >= 2 && value.startsWith("'") && value.endsWith("'")) {
    return value.slice(1, -1)
  }
  return value
}

export function parseDotEnv(content: string): Record<string, string> {
  const parsed: Record<string, string> = {}

  for (const rawLine of content.split(/\r?\n/u)) {
    const trimmed = rawLine.trim()
    if (trimmed.length === 0 || trimmed.startsWith("#")) continue

    const line = trimmed.startsWith("export ") ? trimmed.slice(7).trim() : trimmed
    const separator = line.indexOf("=")
    if (separator <= 0) continue

    const key = line.slice(0, separator).trim()
    const value = stripWrappingQuotes(line.slice(separator + 1).trim())
    if (key.length === 0) continue

    parsed[key] = value
  }

  return parsed
}

export function parseDiscoverArgs(args: readonly string[]): { url: string; context: string } | null {
  const [url, context] = args
  if (!url) return null
  return { url, context: context ?? "" }
}

export function buildDiscoveryPayload(url: string, context: string, now: Date = new Date()): DiscoveryPayload {
  return {
    url,
    context,
    discoveredAt: now.toISOString(),
  }
}

export function slugifyDiscoveryUrl(url: string): string {
  let candidate = url

  try {
    const parsed = new URL(url)
    candidate = `${parsed.hostname}${parsed.pathname}`
  } catch {
    // Keep original value if URL parsing fails.
  }

  const slug = candidate
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, "-")
    .replace(/^-+|-+$/gu, "")

  return slug.length > 0 ? slug : "discovery"
}

export async function loadInngestEventKey(
  repoRoot: string,
  env: Record<string, string | undefined> = process.env,
  readFileFn: (path: string, encoding: BufferEncoding) => Promise<string> = readFile,
): Promise<string | null> {
  const dotEnvPath = join(repoRoot, ".env")
  let fromFile: string | undefined

  try {
    const rawEnv = await readFileFn(dotEnvPath, "utf8")
    fromFile = parseDotEnv(rawEnv).INNGEST_EVENT_KEY
  } catch {
    fromFile = undefined
  }

  return fromFile ?? env.INNGEST_EVENT_KEY ?? null
}

async function postDiscoveryEvent(
  payload: DiscoveryPayload,
  eventKey: string,
  fetchFn: FetchFn,
): Promise<{ endpoint: string; response: unknown }> {
  const endpoint = `${DEFAULT_INNGEST_URL}/e/${eventKey}`
  const res = await fetchFn(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: DISCOVERY_EVENT_NAME,
      data: payload,
    }),
  })

  if (!res.ok) {
    const bodyText = await res.text()
    throw new Error(`Inngest returned ${res.status}: ${bodyText || res.statusText}`)
  }

  let response: unknown = null
  try {
    response = await res.json()
  } catch {
    response = null
  }

  return { endpoint, response }
}

export async function writeDiscoveryStub(payload: DiscoveryPayload, homeDir: string): Promise<string> {
  if (!homeDir) {
    throw new Error("HOME is required for discovery fallback")
  }

  const discoveriesDir = join(homeDir, ".openclaw", "workspace", "discoveries")
  await mkdir(discoveriesDir, { recursive: true })

  const timestamp = payload.discoveredAt.replace(/[:.]/gu, "-")
  const filePath = join(discoveriesDir, `${slugifyDiscoveryUrl(payload.url)}-${timestamp}.md`)

  const contextLine = payload.context.trim().length > 0 ? payload.context : "(none)"
  const stub = [
    "---",
    "type: discovery",
    `url: ${payload.url}`,
    `discoveredAt: ${payload.discoveredAt}`,
    "source: fallback",
    "---",
    "",
    "# Discovery Stub",
    "",
    "Inngest was unreachable, so this discovery was captured locally.",
    "",
    `- URL: ${payload.url}`,
    `- Context: ${contextLine}`,
    `- Discovered At: ${payload.discoveredAt}`,
    "",
  ].join("\n")

  await writeFile(filePath, stub, "utf8")
  return filePath
}

export async function discover(args: readonly string[], options: DiscoverOptions = {}): Promise<DiscoverResult> {
  const parsed = parseDiscoverArgs(args)
  if (!parsed) {
    throw new Error("Usage: bun scripts/discover.ts <url> [optional context]")
  }

  const repoRoot = options.repoRoot ?? defaultRepoRoot
  const env = options.env ?? process.env
  const eventKey = await loadInngestEventKey(repoRoot, env, options.readFileFn ?? readFile)

  if (!eventKey) {
    throw new Error(`Missing INNGEST_EVENT_KEY in ${join(repoRoot, ".env")}`)
  }

  const now = options.now ?? (() => new Date())
  const payload = buildDiscoveryPayload(parsed.url, parsed.context, now())
  const fetchFn = options.fetchFn ?? fetch

  try {
    const { endpoint, response } = await postDiscoveryEvent(payload, eventKey, fetchFn)
    return {
      ok: true,
      mode: "event",
      event: DISCOVERY_EVENT_NAME,
      endpoint,
      payload,
      response,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    if (message.startsWith("Inngest returned ")) {
      throw error
    }

    const homeDir = options.homeDir ?? process.env.HOME ?? ""
    const stubPath = await writeDiscoveryStub(payload, homeDir)

    return {
      ok: true,
      mode: "fallback",
      event: DISCOVERY_EVENT_NAME,
      endpoint: `${DEFAULT_INNGEST_URL}/e/${eventKey}`,
      payload,
      reason: message,
      stubPath,
    }
  }
}

if (import.meta.main) {
  try {
    const result = await discover(process.argv.slice(2))
    console.log(JSON.stringify(result, null, 2))
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(JSON.stringify({
      ok: false,
      error: message,
      usage: "bun scripts/discover.ts <url> [optional context]",
    }, null, 2))
    process.exitCode = 1
  }
}
