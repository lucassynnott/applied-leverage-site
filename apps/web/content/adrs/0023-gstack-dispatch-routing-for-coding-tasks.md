---
status: accepted
date: 2026-04-06
decision-makers: Lucas Synnott, Johnny Silverhand
---

# ADR-0023: Gstack dispatch routing for coding tasks

## Context and Problem Statement
Coding requests were arriving in chat with wildly different shapes: one-line fixes, multi-file refactors, explicit gstack skill requests, and full feature builds. Without a routing rule, Johnny could over-handle simple edits in the main session, under-spec bigger work, or bounce the user toward Claude Code manually.

That created three kinds of drag:
- coding work was being triaged inconsistently
- explicit gstack requests could turn into vague chat guidance instead of real execution
- bigger implementation work had no durable default path from Slack into ACP sessions

The workspace needed one clear operating rule for how coding work gets dispatched.

## Decision Drivers
- Coding work should route consistently from chat into execution
- Users should not be told to open Claude Code manually for gstack work
- Small edits should stay cheap; larger work should get more structure
- ACP sessions are the right execution surface for thread-bound coding runs
- The routing rule must be durable and simple enough to apply under pressure

## Considered Options
1. Keep handling coding requests ad hoc in the main session
2. Always send every coding request through the full gstack pipeline
3. Add a tiered dispatch rule that maps request shape to the right ACP/gstack execution path

## Decision Outcome
Chosen option: "Option 3", because the problem was not lack of capability. The problem was lack of routing discipline.

Johnny now uses a five-tier dispatch model for coding work:
- **SIMPLE** — one-file edits, typos, config changes → spawn a minimal ACP task
- **MEDIUM** — obvious multi-file work → spawn ACP with gstack-lite planning discipline
- **HEAVY** — user explicitly names a gstack skill like `/cso`, `/review`, or `/qa` → spawn ACP and run that skill
- **FULL** — feature/project work → spawn ACP with the full gstack pipeline
- **PLAN** — specification/planning-only work → spawn ACP with the gstack planning pipeline

Two non-negotiable rules come with that routing:
- always spawn; never tell the user to open Claude Code manually
- resolve the repo before dispatch when the target repo is ambiguous

### Consequences
- Good: coding work now routes predictably instead of by vibe
- Good: explicit gstack requests become executable session spawns, not chat theater
- Good: simple work stays cheap while bigger work gets the right planning scaffold
- Good: Slack-thread coding requests have a clear ACP-first path
- Bad: dispatch quality now depends on correctly sizing the task
- Bad: the routing table adds one more kernel rule that must stay maintained as the toolchain evolves

## Implementation Notes
Implemented in `AGENTS.md` on 2026-04-06 with:
- a five-tier dispatch table
- explicit decision heuristics for SIMPLE / MEDIUM / HEAVY / FULL / PLAN
- references to the gstack prompt templates under `~/.claude/skills/gstack/openclaw/`
- six native methodology skills added to the workspace alongside the routing change

## Related Decisions
- ADR-0004: ACP runtime for coding agents
- ADR-0022: Bootstrap kernel discipline for workspace context
