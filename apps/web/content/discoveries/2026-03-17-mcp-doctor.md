---
type: discovery
slug: mcp-doctor
discovered: "2026-03-17"
tags: [tool, mcp, diagnostics, security, cli]
relevance: "MCP servers are the backbone of our agent stack — mcp-doctor gives us visibility into what's broken, leaking, or slow before our agents do."
---

# mcp-doctor: See What's Actually Running in Your MCP Stack

mcp-doctor finds all your MCP configs across Claude Code, Cursor, VS Code, Windsurf, and Claude Desktop — then tests connections, flags security issues, and benchmarks latency in seconds.

## The Core Idea

One command. Zero config.

```bash
npx @wigu/mcp-doctor doctor
```

That's it. No setup. It auto-discovers every MCP server you've configured across every AI tool you use, then runs three checks:

**Scan** — Hits each server with a JSON-RPC handshake. Tells you which ones are actually responding and which are dead.

**Security** — Looks for plaintext passwords in configs, tokens visible in process arguments, and risky shell commands. Makes security people nervous for good reason.

**Bench** — Measures round-trip latency. Shows you which servers are fast, which are slow, and which are timing out.

It outputs a clean table. Green checks for healthy servers. Red crosses for failures. Severity ratings for security issues.

You can also run it as an MCP server itself — expose `scan`, `security`, `bench`, and `doctor` as tools your AI assistant can call directly. Let your agent diagnose its own infrastructure.

## Why It Matters for Applied Leverage

We run mcporter with multiple MCP servers. Filesystem, database, external APIs. Some in Claude Code. Some in OpenClaw. Some in Cursor for debugging.

The problem: when something breaks, you don't know until an agent task fails mid-workflow.

mcp-doctor gives us:
- **Pre-flight checks** — run it before deploying or spawning agents
- **Security auditing** — catch leaked API keys before they become incidents
- **Latency awareness** — know which servers are slow before your agent times out

It also runs as a GitHub Action. We can add it to CI and catch broken MCP servers automatically.

```yaml
- name: Check MCP servers
  uses: realwigu/mcp-doctor@main
  with:
    command: doctor
    fail-on-error: "true"
```

That's infrastructure as code for your agent tools.

## The Catch

It's new. v0.3.0. Bugs happen.

It only covers the big five: Claude Code, Claude Desktop, Cursor, VS Code, and Windsurf. If you're running MCP servers in something else, you're on your own.

Security checks are basic — plaintext passwords and exposed tokens. It's not a full secrets scanner. But it's better than nothing.

And honestly? The biggest issue is that it surfaces problems without fixing them. You still have to go manually update your configs. But knowing what's broken is half the battle.

---

One command to see your whole MCP stack. Visibility matters when your agents depend on fifteen different servers to do their job.
