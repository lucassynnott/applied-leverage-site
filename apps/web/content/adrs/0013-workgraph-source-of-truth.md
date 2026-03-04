---
status: accepted
date: 2026-03-04
decision-makers: Lucas Synnott, Johnny Silverhand
---

# Workgraph as Source of Truth for Task Ownership

## Context and Problem Statement

Cross-agent task assignment was unclear and inconsistent. Tasks appeared in multiple places (Slack threads, Notion pages, direct messages) with no single system tracking who owned what. The team needed a definitive source of truth for task ownership to prevent misassigned work, duplicate effort, and accountability gaps.

## Decision Drivers

- Tasks scattered across Slack, Notion, and agent memories
- No visibility into who owned what across the agent team
- Needed automated ownership review nudges when tasks were assigned
- Wanted structured thread lifecycle management (open → active → done)
- Required policy governance for decision status transitions

## Considered Options

1. **Status Quo (ad-hoc)** — tasks in Slack threads, Notion, memory — no single source
2. **Notion Tasks Database** — structured but requires manual updates
3. **Trello** — visual but not agent-native
4. **Workgraph** — purpose-built for agent swarm coordination, thread-native, policy-driven

## Decision Outcome

Chosen option: **Workgraph** as the definitive source of truth for task ownership.

### Implementation

- Initialized workspace at `/nas/vault/workgraph/`
- CLI binary: `workgraph` (v1.4.0)
- Native sync script: `/home/lucas/.openclaw/workspace/bin/wg-ops.sh`
- Commands available:
  - `wg-ops.sh brief <actor>` — get prioritized task list
  - `wg-ops.sh lens` — list available perspectives
  - `wg-ops.sh status` — overall system status
  - `wg-ops.sh next <actor>` — claim next available task
  - `wg-ops.sh claim <threadPath> <actor>` — claim specific thread
  - `wg-ops.sh heartbeat <actor>` — actor-specific heartbeat

### Policy and Governance

- Registered policy parties: `main`, `johnny`, `lucas`
- Admin role with capabilities: `promote:sensitive`, `dispatch:run`, `policy:manage`
- Decision primitives created:
  - `workgraph-is-the-source-of-truth-for-task-ownership-and-assignments.md`
  - `main-ownership-triage-on-new-thread-creation.md`
  - `coordination-policy-workgraph-is-source-of-truth-for-cross-agent-task-ownership.md`

### OpenClaw Integration

- Created OpenClaw hook `workgraph-task-notice`:
  - Listens for `message:preprocessed` / `message:received` events
  - Tracks open/active thread ownership in `~/.openclaw/workspace/.workgraph-task-notice-state.json`
  - Pushes assignment review nudges when:
    - New open/active threads assigned to actor
    - `main` receives/changes open/active main-owned threads
- Hook location: `~/.openclaw/hooks/workgraph-task-notice/HOOK.md` + `handler.js`
- Created handoff baseline: `WORKGRAPH_HANDOFF.md` (symlinked to all agent workspaces)

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Workgraph                                │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐  │
│  │              Thread Lifecycle                         │  │
│  │   open → active → done / blocked                     │  │
│  └─────────────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────┐  │
│  │              Decision Primitives                     │  │
│  │   - Source of truth policy                           │  │
│  │   - Ownership triage rules                           │  │
│  │   - Coordination policies                            │  │
│  └─────────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────────┘
                       │ wg-ops.sh (native CLI)
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    OpenClaw Gateway                         │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐  │
│  │         workgraph-task-notice Hook                  │  │
│  │   Event: message:preprocessed / message:received    │  │
│  │   Action: Push ownership review nudges              │  │
│  └─────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Consequences

**Positive:**
- Single source of truth for all cross-agent task ownership
- Automated nudges prevent task drift
- Structured thread lifecycle prevents orphaned work
- Policy-driven governance enables future automation
- Integration with OpenClaw for event-driven ownership review

**Negative:**
- Additional infrastructure to maintain (workgraph workspace)
- Requires agents to check workgraph before executing tasks
- Policy transitions need registered parties — adds setup overhead
- Notion and Slack still exist — need discipline to use workgraph as primary

## Enforcement Rule

> **All cross-agent tasks must be represented as Workgraph tasks before execution.**

Any task involving multiple agents must first be created as a thread in Workgraph. Direct Slack threads or Notion tasks that don't map to Workgraph threads are considered informal and don't trigger ownership tracking or accountability.
