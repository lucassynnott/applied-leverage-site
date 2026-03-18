---
status: accepted
date: 2026-03-18
decision-makers: Lucas Synnott, Johnny Silverhand
---

# ADR-0018: Consolidate Substack Pipeline to Single Moltron Skill

## Context and Problem Statement
We had two substack-related tools in the workspace: `substack-writer` and `substack-autopilot`. This created confusion about which one was the canonical pipeline and introduced maintenance burden across two repos.

## Decision Drivers
- Clarity: One pipeline tool, one purpose
- Maintenance: Reduce duplicate code and configuration
- Convention: Follow moltron skill naming and structure for consistency

## Considered Options
1. Keep both substack-writer and substack-autopilot as separate skills
2. Delete substack-autopilot, keep substack-writer as-is
3. Delete substack-autopilot, convert substack-writer to moltron skill with backing SmythOS project

## Decision Outcome
Chosen option: "Option 3", because it consolidates to a single canonical pipeline, follows moltron conventions with proper backing project structure, and eliminates the maintenance burden of two tools doing similar work.

### Consequences
- Good: Single source of truth for Substack content pipeline
- Good: Proper moltron skill structure with versioning and observability
- Good: Cleaner workspace with fewer redundant tools
- Bad: Need to update any references to old tool names
