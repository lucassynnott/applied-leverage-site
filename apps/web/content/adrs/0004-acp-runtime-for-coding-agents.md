---
status: accepted
date: 2026-02-27
decision-makers: Lucas Synnott, Johnny Silverhand
---

# ACP runtime for coding agents

## Context and Problem Statement

Coding agents (Codex, Claude Code) were managed via tmux sessions and PTY hacks — fragile, hard to monitor, and no clean lifecycle management. OpenClaw introduced ACP (Agent Client Protocol) as a first-class runtime for external coding harnesses. We needed to adopt it to replace our manual process management.

## Decision

Install and configure the `acpx` ACP backend plugin with the following settings:

```json
{
  "acp": {
    "enabled": true,
    "dispatch": { "enabled": true },
    "backend": "acpx",
    "defaultAgent": "codex",
    "allowedAgents": ["pi", "claude", "codex", "opencode", "gemini"],
    "maxConcurrentSessions": 8,
    "stream": { "coalesceIdleMs": 300, "maxChunkChars": 1200 },
    "runtime": { "ttlMinutes": 120 }
  }
}
```

ACP agent IDs added to `tools.agentToAgent.allow` for inter-agent messaging.

Usage pattern:
- `sessions_spawn` with `runtime: "acp"` for one-shot coding tasks
- Thread-bound persistent sessions for iterative work (Discord/Slack)
- `subagents` tool for monitoring, `/acp steer` for mid-run guidance

## Consequences

* Good, because coding agents get proper lifecycle management (spawn, steer, cancel, close)
* Good, because session keys are trackable (`agent:codex:acp:<uuid>`)
* Good, because 8 concurrent sessions enables parallel coding work
* Good, because model/permissions/timeout can be overridden per-session
* Bad, because gateway restart is required after config changes (kills active session)
* Neutral, because ACP sessions don't appear in `subagents list` — use `sessions_list` instead

## Implementation Plan

### Affected files
- `openclaw.json` → `acp.*` config block, `plugins.load.paths`, `plugins.entries.acpx`, `tools.agentToAgent.allow`
- `TOOLS.md` → ACP section documenting available harnesses

### Verification
- [x] `openclaw plugins list` shows acpx as loaded
- [x] `sessions_spawn` with `runtime: "acp"` returns accepted status
- [x] ACP session visible in `sessions_list`
- [x] Codex executes task and returns results via gateway log
