---
status: accepted
date: 2026-03-05
decision-makers: Lucas Synnott, Johnny Silverhand
---

# Workspace Memory Architecture Refactor

## Context and Problem Statement

The OpenClaw workspace was injecting multiple large files into every session's bootstrap context (AGENTS.md, SOUL.md, IDENTITY.md, USER.md, HEARTBEAT.md, BOOTSTRAP.md, TOOLS.md, MEMORY.md). This caused:
- 17k+ tokens injected on every fresh session
- Duplicated content across files (personality, rules, identity repeated)
- No clear separation between identity routing and long-term memory
- SELF_IMPROVEMENT_REMINDER.md being injected dozens of times due to non-idempotent hook

## Decision Drivers

- Reduce token cost per session
- Eliminate bootstrap bloat and duplications
- Establish clear architecture: identity in prompt, semantic recall in OpenStinger, durable truth in files
- Make the system maintainable (single source of truth per concern)

## Considered Options

1. **Merge all files into one mega bootstrap** — simplifies injection but creates a larger single point of failure
2. **Trim files but keep all injected** — reduces tokens but doesn't solve the architectural mixing of concerns
3. **Split architecture: tiny injected files + OpenStinger + PARA files** — clean separation, minimal injection, semantic recall separate

## Decision Outcome

Chosen option: "Split architecture", because it cleanly separates:
- **Injected files = tiny routing layer** (persona, user identity, hard rules, retrieval pointers)
- **OpenStinger = semantic recall engine** (cross-session memory, decisions, entities)
- **PARA/files = durable source of truth** (structured facts, timeline)

Implemented changes:
- Trimmed AGENTS.md, IDENTITY.md, BOOTSTRAP.md, HEARTBEAT.md, TOOLS.md, MEMORY.md
- Moved long memory architecture docs to non-injected files (OPENSTINGER_MEMORY_SYSTEM.md, WORKSPACE_MEMORY_SYSTEM.md)
- Disabled SELF_IMPROVEMENT_REMINDER.md bootstrap injection (made it event-triggered instead)
- Removed "if you want" permission-seeking habit from voice rules

### Consequences

- Good: ~10k+ tokens shaved from startup payload
- Good: Clear separation of concerns for memory system
- Good: Easier to maintain — each file has one job
- Bad: Requires developers to understand the split (retrieval vs injection)
- Bad: Some historical context now requires explicit memory_search calls
