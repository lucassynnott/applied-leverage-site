---
type: discovery
slug: acpx-headless-acp-cli
discovered: "2026-04-25"
tags: [acp, cli, coding-agents, openclaw, headless]
relevance: "acpx is the missing piece between coding agents and the rest of your toolchain. It turns Codex, Claude Code, Gemini, OpenCode, and Pi into command-line citizens you can pipe, cron, and script."
---

# acpx: Headless CLI for Every Coding Agent That Speaks ACP

Coding agents are great until you want to use them outside their pretty terminal UI.

You can't pipe into them. You can't cron them. You can't fan ten of them out from a parent script and collect the JSON. You sit in the chat, you watch the spinner, you copy-paste the result somewhere useful. That's not automation. That's a person doing the agent's filing.

acpx fixes that. One CLI, every ACP-compatible agent, headless.

## The Core Idea

ACP is the Agent Client Protocol — the standard for talking to coding agents like Codex, Claude Code, Gemini CLI, OpenCode, and Pi. Each of those agents ships its own front-end. Each one wants you to live inside its UI.

acpx ignores the UI. It speaks ACP directly and exposes every agent as a regular Unix command:

```
acpx codex "review this diff and flag risk"
acpx claude --approve-reads "summarise the test failures in CI logs"
acpx gemini --format json "list TODOs in src/"
acpx opencode exec "run the migration plan from docs/migrate.md"
```

Same flags. Same output formats. Same permission model. The agent underneath is interchangeable.

The interesting flags:

- `--approve-all` and `--approve-reads` for non-interactive runs
- `--format json` (with `--json-strict` for clean machine output)
- `--timeout` and `--ttl` so a stuck session can't park a process forever
- `--cwd` so the same script can target multiple repos

Sessions are real. `acpx codex sessions new` then `acpx codex --session <id>` keeps state across calls instead of starting from zero every time.

## Why It Matters for Applied Leverage

Our stack runs cron jobs, Slack triggers, and pipeline steps that need a coding agent in the middle. Without acpx, that middle step is a human in a terminal, or a brittle pty-screen-scraping mess. With acpx it's:

```
acpx codex --approve-reads --format json "draft the changelog for the last 50 commits"
```

That's a single line in a bash pipeline. We use the exact same line on the laptop, in cron, and from a remote dispatcher. The agent on the other end can be Codex today and Claude Code tomorrow — the script doesn't care.

This is also how Squid pipelines and the gstack dispatch routing actually reach a coding agent. Both of them ultimately spawn an acpx call under the hood. That's why "spawn an ACP session" is a one-liner in our docs instead of a paragraph.

The bigger pattern: every time you turn a chat-only tool into a CLI, the surface area of what you can build with it explodes. Cron, pipes, fan-out, Slack bots, GitHub Actions, parent agents driving sub-agents. acpx is a small tool with a big multiplier.

## The Catch

ACP is still young. Not every coding agent supports every capability cleanly, and the permission flags only matter if the agent honours them. `--approve-all` on a misbehaving agent is exactly as scary as it sounds — use `--approve-reads` and gate writes for anything that touches a repo you care about.

The CLI is also not a chat. If you want a back-and-forth conversation, the agent's native UI is still better. acpx is for the moment you've decided the agent is a function, not a friend.

And it's `0.x` software. Things move. Pin versions in scripts you actually depend on.

But for any operator running coding agents from outside their UI — pipelines, cron, multi-agent fan-out, headless review steps — acpx is the cleanest entry point I've seen. It treats every agent like a Unix process. That alone is worth the install.
