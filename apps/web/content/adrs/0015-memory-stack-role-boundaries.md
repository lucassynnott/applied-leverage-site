---
status: accepted
date: 2026-03-10
decision-makers: Lucas Synnott, Johnny Silverhand
---

# Memory Stack Role Boundaries

## Context and Problem Statement

The memory system had overlapping responsibilities causing confusion about which tool handles what. LCM was installed but not assigned to the context engine slot, OpenStinger and PARA both claimed "long-term memory," and daily notes served dual purposes. We needed clear boundaries.

## Decision Drivers

- Eliminate role overlap between memory components
- Ensure LCM actually engages for session compaction
- Define clear retrieval paths for each memory type
- Support both session-local and cross-session recall

## Considered Options

1. **Merge all into one memory system** — simplify but lose specialized capabilities
2. **Status quo with documentation** — add docs but keep overlapping responsibilities
3. **Formal role boundaries** — assign each component a specific responsibility

## Decision Outcome

Chosen option: "Formal role boundaries", because it preserves specialized capabilities while eliminating overlap.

Defined responsibilities:
- **LCM (lossless-claw)** = session/local conversation compaction + transcript recovery. Handles in-session context window management and recovery from compaction.
- **OpenStinger** = cross-session semantic/temporal recall. Handles entity tracking, decision recall, and episode retrieval across sessions.
- **PARA (~/life/)** = durable truth. Atomic facts, structured entity summaries, single source of truth for ground facts.
- **memory/YYYY-MM-DD.md** = operational timeline. Daily execution log, heartbeat trace, operational context (not durable knowledge).

### Consequences

- Good: Clear retrieval path for each memory type
- Good: LCM now properly assigned to context engine slot
- Good: No more duplicate "long-term memory" responsibilities
- Bad: Requires explicit memory_search calls for cross-session context
- Bad: Team must learn the role boundaries
