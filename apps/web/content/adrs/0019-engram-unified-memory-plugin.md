---
status: accepted
date: 2026-03-20
decision-makers: Lucas Synnott, Johnny Silverhand
---

# ADR-0019: Engram as Unified Memory Plugin for OpenClaw

## Context and Problem Statement

OpenClaw's memory story was a mess of three separate systems that didn't talk to each other cleanly:

- **Gigabrain** — markdown-backed memory with Obsidian sync, injected into sessions via workspace files
- **Lossless Claw** — context compaction engine that summarized conversation history to avoid token overflow
- **OpenStinger** — a bi-temporal semantic graph (FalkorDB + PostgreSQL) for cross-session entity recall

Three systems meant three configs, three failure modes, three surfaces for things to break. Cross-agent memory required explicit wiring. Context compaction and memory capture happened in separate pipelines that couldn't share extracted facts. There was no single slot in OpenClaw's plugin system that owned "memory" — it was assembled from duct tape at startup.

The deeper problem: agents need memory that's coherent across sessions, compaction events, and agent boundaries. Three separate systems made that impossible without significant glue code.

## Decision Drivers

- Reduce operational complexity — one plugin, one config, one failure surface
- Enable pre-compaction fact extraction — capture durable facts *before* context gets compressed
- Cross-agent memory from the plugin layer, not bespoke wiring
- Zero-configuration default with tunable knobs for edge cases
- SQLite-backed for portability and reliability without external service dependencies
- Fit into OpenClaw's plugin slot model (`memory` + `contextEngine`) rather than being bolted on externally

## Considered Options

1. **Keep the three-system stack** — continue maintaining Gigabrain, Lossless Claw, and OpenStinger as separate extensions
2. **Replace with hosted vector DB** — Pinecone or Qdrant + external summarization API
3. **Build a unified plugin** (Engram) — single plugin implementing both `memory` and `contextEngine` slots

## Decision Outcome

**Chosen option: Build a unified plugin (Engram)**

Engram (`openclaw-memory`) implements both the `memory` and `contextEngine` slots in the OpenClaw plugin SDK. It ships with a single SQLite database, zero required configuration, and absorbs the functionality of all three predecessor systems.

### What Engram provides

- **Unified storage** — one SQLite DB for memories, episodes, entities, and context summaries
- **Hybrid recall** — class-budgeted retrieval across core facts, situational context, and decisions; entity locking; strategy-aware rerank
- **Pre-compaction extraction** — facts are pulled from conversation content before compaction runs, so nothing useful disappears into a summary
- **World model** — entity registry with beliefs, relationships, and confidence scores derived from accumulated memories
- **Quality gates** — junk filtering, exact + semantic dedupe (threshold: 0.92), plausibility scoring, and value classification before anything gets stored
- **Cross-agent scope** — `shared` scope by default, so any OpenClaw agent on the same instance reads from the same memory pool
- **Native markdown sync** — `MEMORY.md` and daily notes continue to work as the human-readable layer; Engram reads and writes back to them
- **Vault sync** — optional Obsidian vault integration for the Gigabrain-compatible surface

### Consequences

**Good:**
- One plugin replaces three external dependencies
- Context compaction and memory capture share a pipeline — extracted facts don't get lost
- Cross-agent memory works without bespoke wiring
- Tunable via config schema without code changes
- OpenStinger's FalkorDB dependency removed (SQLite everywhere)

**Bad:**
- Loses the bi-temporal graph model from OpenStinger — relationships are stored as beliefs, not edges in a queryable graph
- Migration required: existing OpenStinger memories need to be re-ingested through the new pipeline
- Single SQLite file is a bottleneck at scale (not a concern for current agent count)
- No external backup service — vault sync and daily notes must be the human-readable fallback

## Related ADRs

- ADR-0003: Five-layer memory architecture (superseded in part)
- ADR-0012: OpenStinger as primary graph memory (superseded)
- ADR-0014: Workspace memory architecture refactor (superseded)
- ADR-0015: Memory stack role boundaries (updated by this decision)
