---
status: accepted
date: 2026-03-01
decision-makers: Lucas Synnott, Johnny Silverhand
---

# Content Pipeline: Workspace-First Write Pattern

## Context and Problem Statement

Goro's discovery and essay crons were writing content directly to the `applied-leverage-site` git repo. Viktor's `sync-adrs.sh` script runs every 2 hours with `rsync --delete`, which silently wiped any file in the site's `content/discoveries/` that wasn't in `workspace/discoveries/`. Three discovery posts were deleted before the pattern was identified.

## Decision Drivers

- Viktor's sync is necessary and correct — workspace is the source of truth for ADRs and discoveries
- Goro cannot be expected to know which files Viktor's sync will delete
- The pipeline needs a clear single-writer contract per directory

## Considered Options

1. **Remove `--delete` from rsync** — preserves Goro's files but allows stale/deleted workspace items to accumulate on site indefinitely
2. **Goro commits directly to site repo, Viktor skips discoveries** — splits source of truth, requires coordination
3. **Workspace-first: all agents write to workspace, Viktor syncs to site** — single source of truth, clean ownership

## Decision Outcome

Chosen option: **Workspace-first write pattern**.

### Content Flow

```
Goro writes → ~/.openclaw/workspace/discoveries/<slug>.md
Viktor sync  → runs every 2h, rsync workspace/ → site/content/
Vercel       → auto-deploys on push
```

### Ownership by Content Type

| Content Type | Write Location | Sync Mechanism |
|-------------|---------------|----------------|
| Discoveries | `workspace/discoveries/` | Viktor cron → `sync-adrs.sh` |
| ADRs | `workspace/adr/` | Viktor cron → `sync-adrs.sh` |
| Essays (MDX) | Site repo directly (`apps/web/content/`) | Committed by Goro, no sync needed |

### Why Essays Are Different

Essays (`.mdx`) live only in the site repo because `sync-adrs.sh` only touches `discoveries/` and `adrs/` subdirectories. No conflict exists, so essays write directly to the repo.

### Consequences

**Positive:**
- Viktor's sync can use `--delete` safely — workspace is authoritative
- Goro never needs to know about site repo structure for discoveries
- Single source of truth for all discovery content

**Negative:**
- Goro's cron prompt must specify workspace path, not site path
- Discovery posts have up to 2h deployment lag (vs immediate with direct commit)
- If workspace/discoveries gets corrupted or deleted, site loses all discoveries
