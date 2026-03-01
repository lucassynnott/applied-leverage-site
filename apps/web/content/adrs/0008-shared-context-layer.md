---
status: accepted
date: 2026-02-28
decision-makers: Lucas Synnott, Johnny Silverhand
---

# Shared Context Layer for Cross-Agent Coordination

## Context and Problem Statement

With 6 agents running from separate workspaces, there was no single source of truth for worldview, cross-agent corrections, incident tracking, or problem-resolution protocol. Each agent operated from isolated context, leading to duplicate decisions and uncoordinated responses.

## Decision Drivers

- A correction made to one agent should automatically apply to all (FEEDBACK-LOG)
- Active incidents need a single tracker, not scattered channel mentions
- Resolution protocol must be explicit and consistent — "catch and resolve, never just report"
- Strategic worldview (what we're building, why) should be shared and consistent

## Considered Options

1. **Per-agent MEMORY.md updates** — requires updating 6 files per correction; drift inevitable
2. **Shared database (Convex/Supabase)** — robust but requires API calls, adds latency to every session start
3. **Shared files in `workspace/shared-context/`** — read at session start via AGENTS.md instruction, zero infrastructure

## Decision Outcome

Chosen option: **Shared markdown files in `~/.openclaw/workspace/shared-context/`**, read at session start.

### Files

| File | Purpose | Writer |
|------|---------|--------|
| `THESIS.md` | Current worldview, priorities, content themes | Johnny only |
| `FEEDBACK-LOG.md` | Cross-agent corrections (one fix, all agents learn) | Any agent appends, Johnny curates |
| `RESOLUTION-PROTOCOL.md` | How problems are handled — catch + resolve | Read-only |
| `INCIDENTS.md` | Active incident tracker | Any agent creates, resolver closes |

### Resolution Protocol (key principle)

> "Dashboards are where problems go to die. We don't do dashboards."

- Detect → fix yourself if possible → log → alert if Lucas needs to know
- Can't fix → create structured incident → escalate with full context + specific action needed
- Never "something seems off" — be specific
- Never report and walk away — own it until resolved or reassigned

### Consequences

**Positive:**
- Single correction propagates to all agents at next session start
- Incidents tracked in one place, not buried in channel threads
- Zero infrastructure — flat files, git-tracked, human-readable

**Negative:**
- Session-start latency increases slightly (4 extra file reads)
- Files must stay lean or context window pressure increases
- One-writer rule required to prevent conflicts (enforced in AGENTS.md constitution)
