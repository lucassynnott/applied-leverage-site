---
status: accepted
date: 2026-02-26
decision-makers: Lucas Synnott
---

# Five-agent team structure

## Context and Problem Statement

The previous setup had 15+ scattered agents with overlapping roles, unclear ownership, and expensive model usage. Agents were being spawned as disposable subagents, losing context between runs. We needed a lean, permanent team with clear roles and cost-efficient model assignments.

## Decision

Consolidate to five core agents with fixed roles and dedicated models:

| Agent | Role | Model | Heartbeat |
|-------|------|-------|-----------|
| Johnny (main) | CEO / Orchestrator | claude-sonnet-4-6 | 30m |
| Alt (altcun) | Lead Architect / PRD | zai/glm-5 | 2h |
| T-Bug (tbug) | Implementation Coordinator | codex-spark | disabled |
| Goro (goro) | CMO / Content Strategy | kimi-k2p5 | 2h |
| River (qa) | QA Engineer | kimi-k2p5 | 1h |

Rules:
- Never spawn core agents as disposable subagents — use `sessions_send` for inter-agent communication
- Each agent has persistent sessions and memory
- Johnny orchestrates and delegates, never writes code
- T-Bug coordinates CLI tools only, never touches code directly
- All crons run on cost-efficient models (MiniMax/Kimi), not Anthropic

## Consequences

* Good, because clear ownership eliminates role confusion and duplicate work
* Good, because 5 agents with persistent sessions retain context vs 15 disposable ones that don't
* Good, because model assignments match role requirements (expensive models only where needed)
* Bad, because fewer agents means less parallelism — but focused work beats scattered effort
* Neutral, because the team can be expanded later if a clear gap emerges

## Implementation Plan

### Affected files
- `openclaw.json` → `agents.list` array
- `MEMORY.md` → team roster section
- `IDENTITY.md` → role descriptions
- All cron scripts → model references

### Verification
- [ ] `openclaw status` shows exactly 6 agents (5 core + codex ACP)
- [ ] No orphaned agent sessions from old roster
- [ ] Inter-agent messaging works via `sessions_send`
