---
status: accepted
date: 2026-03-04
decision-makers: Lucas Synnott, Johnny Silverhand
---

# Notion as Primary Workspace and PM System

## Context and Problem Statement

Lucas has cycled through 6 Obsidian vaults over time — each one abandoned when it became "a mess" or sync conflicts emerged. The workspace needed a collaborative PM tool that both humans and agents could access, with structured databases for tracking projects, content, and tasks. The previous setup had no shared workspace between human and agents.

## Decision Drivers

- Obsidian's markdown files caused sync conflicts between devices
- No structured task management — everything lived in head or scattered notes
- Agents needed programmatic read/write access to the shared workspace
- 1Password integration required for API key storage
- Need for databases (Projects, Content, Ideas, Tasks) not native to flat markdown

## Considered Options

1. **Obsidian with Sync** — paid, but sync conflicts persisted, agent integration difficult
2. **Linear** — excellent for engineering, but no good for content/creative workflows
3. **Notion** — API-first, databases, agent CLI, collaborative, but not markdown-native
4. **SilverBullet/Moment.dev** — markdown-native, git-backed, but younger tools with less momentum
5. **AFFiNE** — Postgres-backed, rejected — not markdown files

## Decision Outcome

Chosen option: **Notion** for shared workspace and PM.

### Implementation

- notion-cli-agent v0.4.2 installed globally
- Internal integration token (not OAuth) stored in 1Password
- HQ page (31972fbd-99f7-80ae-a29c-f00b37295da7) as root
- 52 pages populated across sections:
  - Mission Control, Projects, Content Hub, Revenue
  - Agent Ops, Knowledge Base, Dashboards
- 4 databases created:
  - Projects Board
  - Content Pipeline
  - Ideas Bank
  - Sprint Tasks

### Architecture

```
Notion (Primary Workspace)
    ├── HQ (root)
    ├── Mission Control
    ├── Projects Board (database)
    ├── Content Pipeline (database)
    ├── Ideas Bank (database)
    ├── Sprint Tasks (database)
    └── [All agent + business pages]

Agents → notion-cli-agent → Notion API → Read/Write
Lucas → Notion Web/Desktop App → Collaborative editing
```

### Future Consideration

Linear remains the recommendation for engineering-specific project management (issues, sprints, epics). Notion handles biz ops, content, strategy — Linear handles code tasks.

### Consequences

**Positive:**
- Structured databases for tracking work
- Agent-accessible via CLI — agents can read and write pages
- Collaborative — Lucas and agents share the same workspace
- API-first design — clean integration path
- 1Password integration for secrets

**Negative:**
- Not markdown-native — less portable, harder to git-version
- Requires Notion account and payment for some features
- Agent writes go through CLI — not real-time sync
- All content locked into Notion ecosystem