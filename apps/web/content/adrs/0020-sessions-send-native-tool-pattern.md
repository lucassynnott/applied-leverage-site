---
status: accepted
date: 2026-03-22
decision-makers: Lucas Synnott, Johnny Silverhand
---

# ADR-0020: Native sessions_send Tool Pattern for Skill Implementation

## Context and Problem Statement
The moltron-roundtable skill was initially proposed as an npm CLI project that would shell out to execute agent commands. This approach introduced complexity: multiline argument handling bugs, process spawning overhead, and reduced reliability due to CLI parsing issues.

## Decision Drivers
- Reliability: CLI shelling introduces quote/escape issues with multiline arguments
- Simplicity: Direct tool calls are more predictable than subprocess execution
- Observability: sessions_send returns structured responses directly
- Latency: Eliminates npm/CLI startup overhead per invocation

## Considered Options
1. Build as npm CLI project and shell out via exec tool
2. Build as pure skill using sessions_send tool calls directly
3. Build as standalone daemon with API endpoints

## Decision Outcome
Chosen option: "Option 2", because sessions_send is purpose-built for inter-agent communication, avoids all CLI quoting issues, and fits the skill-first architecture already established in the workspace.

### Consequences
- Good: No multiline argument escaping bugs
- Good: Direct structured response handling
- Good: Faster invocation (no npm startup)
- Good: Follows established skill pattern from content-pipeline
- Bad: Requires understanding sessions_send API surface
- Bad: Less portable if sessions_send unavailable (acceptable for OpenClaw-only use cases)

## Related Decisions
- moltron-roundtable skill: Built and committed at `1ded839`
- Council seats: Provocateur=altcun, Operator=viktor, Skeptic=goro, Customer=dan-koe, Strategist=main
