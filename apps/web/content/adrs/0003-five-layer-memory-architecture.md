---
status: accepted
date: 2026-02-26
decision-makers: Lucas Synnott
---

# Five-layer memory architecture

## Context and Problem Statement

Previous memory systems (Kybernesis, Supermemory, QMD, a 7-layer stack) added complexity without payoff. Memory retrieval was unreliable, indexing broke frequently, and multiple truth sources caused data drift. We needed a simple, durable memory system that survives session restarts.

## Decision

Adopt a five-layer memory stack, prioritizing files over databases:

1. **Knowledge Graph** (`~/life/` — PARA method) — Entity-based durable facts with tiered retrieval. `summary.md` for cheap lookups, `items.json` for detailed data.
2. **Hot State** (`SESSION-STATE.md`) — Current objective, blockers, next actions. Write-ahead: update before responding.
3. **Durable Files** (`memory/` + `MEMORY.md`) — Daily timeline logs, tacit knowledge, learnings, observations.
4. **Obsidian Vault** (`/nas/vault`) — Larger project docs, research, council briefs. Shared with Lucas via Obsidian app.
5. **Indexed Retrieval** (LanceDB + builtin memorySearch) — Semantic search across all sources including vault session logs.

Key rules:
- Never delete facts — supersede instead
- PARA entity creation threshold: mentioned 3+ times, OR direct relationship, OR significant project
- Memory decay applied during heartbeat summaries (Hot 7d → Warm 8-30d → Cold 30d+)
- Write-Ahead Log (WAL) behavior: write durable info BEFORE responding

Killed: Kybernesis, Supermemory, QMD, 7-layer complexity.

## Consequences

* Good, because files are inspectable, debuggable, and survive any system failure
* Good, because PARA method is proven for knowledge organization
* Good, because LanceDB provides semantic search without external API dependencies
* Bad, because file-based memory requires manual discipline (agents must actually write to files)
* Bad, because LanceDB module currently has a loading issue (`Cannot find module '@lancedb/lancedb'`)
* Neutral, because the vault symlink pattern creates CI issues (documented in learnings)

## Implementation Plan

### Affected files
- `AGENTS.md` → memory architecture section
- `HEARTBEAT.md` → memory maintenance checklist
- `~/life/` → PARA directory structure
- `SESSION-STATE.md` → hot state template
- `memory/*.md` → daily logs, observations, learnings
- `openclaw.json` → `plugins.slots.memory`, `memory.backend`

### Verification
- [ ] `openclaw memory status` returns healthy
- [ ] `openclaw memory search --query "test"` returns results
- [ ] `~/life/index.md` exists with entity listing
- [ ] `SESSION-STATE.md` updated within last heartbeat cycle
