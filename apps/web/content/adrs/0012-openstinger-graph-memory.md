---
status: accepted
date: 2026-03-04
decision-makers: Lucas Synnott, Johnny Silverhand
---

# OpenStinger as Primary Graph Memory System

## Context and Problem Statement

The memory system needed a powerful, local-first knowledge graph that could store episodic memory, entities, and support hybrid search (vector + graph + BM25). The previous setup used mem0 for semantic recall, but the PRO plan was required for graph features, and the OpenAI Whisper key had rate limits. We needed a self-hosted solution with full visibility and no usage limits.

## Decision Drivers

- mem0 PRO plan required for graph features — cost barrier
- OpenAI Whisper key rate-limited — embedding generation unreliable
- Need for local-first, self-hosted solution with full observability
- Wanted bi-temporal graph (episodes stored with both creation and access timestamps)
- Required hybrid search: vector + graph traversal + BM25 keyword search
- Alignment evaluation capability for measuring agent decision quality

## Considered Options

1. **mem0 (Free tier)** — basic semantic search, no graph, limited recall
2. **mem0 (PRO plan)** — graph features, but $99+/month, data leaves local
3. **Custom PostgreSQL + pgvector** — full control, but build-it-yourself overhead
4. **Neo4j + vector plugin** — powerful but heavy, requires significant setup
5. **OpenStinger** — FalkorDB-backed, bi-temporal graph, hybrid search, self-hosted, no plan limits

## Decision Outcome

Chosen option: **OpenStinger** as primary graph memory system.

### Implementation

- Cloned to `/home/lucas/openstinger/`
- Python venv with asyncpg installed
- FalkorDB (graph) + PostgreSQL (metadata) Docker containers
- Gemini `gemini-embedding-001` for embeddings (free, 3072 dims, unlimited quota)
- Patched FalkorDB driver to support 3072 dimensions (was hardcoded 1536)
- systemd service `openstinger.service` (enabled, auto-restart)
- MCP server on port 8766
- Skill created at `~/.openclaw/skills/openstinger/SKILL.md`
- Symlinked to all 7 agent workspaces

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    OpenStinger                               │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │  FalkorDB  │  │  PostgreSQL │  │  Gemini Embeddings │ │
│  │   (Graph)  │  │  (Metadata) │  │     (Free API)     │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└──────────────────────┬──────────────────────────────────────┘
                       │ MCP Server (port 8766)
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    OpenClaw Agents                           │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐       │
│  │Johnny│  │ Alt  │  │T-Bug │  │ Goro │  │River │  ...  │
│  └──────┘  └──────┘  └──────┘  └──────┘  └──────┘       │
└─────────────────────────────────────────────────────────────┘
```

### Search Capabilities

- **Vector search** — semantic similarity via Gemini embeddings
- **Graph traversal** — entity relationships, temporal paths
- **BM25** — keyword-weighted search for precise recall
- **Hybrid** — combine all three for best results

### Consequences

**Positive:**
- Self-hosted, local-first — full control, no data leaves infrastructure
- No plan limits — unlimited episodes, entities, queries
- Free embeddings via Gemini — no rate limits, 3072 dimensions
- Bi-temporal storage — tracks both creation and access times
- Graph alignment evaluation — measure agent decision quality against stored episodes
- Full observability via SigNoz integration

**Negative:**
- Requires maintaining Docker stack (FalkorDB + Postgres)
- Gemini embeddings may have different quality characteristics than OpenAI
- Patched driver — may need maintenance on updates
- Additional infrastructure to monitor and backup
- mem0 still useful for auto-recall use cases — kept as secondary

## Future Considerations

- Evaluate embedding quality vs OpenAI for critical recall tasks
- Consider migrating mem0 memories to OpenStinger for unified access
- Build alignment evaluation into agent decision loops
- Add automated backup of FalkorDB and PostgreSQL volumes
