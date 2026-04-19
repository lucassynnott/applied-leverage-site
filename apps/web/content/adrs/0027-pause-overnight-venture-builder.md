---
status: accepted
date: 2026-04-19
decision-makers: Lucas Synnott, Johnny Silverhand
---

# ADR-0027: Pause the Overnight Venture Builder

## Context and Problem Statement

The overnight venture builder was an OpenClaw cron job (`6f16d8f6-0352-471d-a95d-69fdbcb0f6ba`) that ran nightly to package new productized service ventures from a scoring rubric. Across ~3 weeks it shipped a real catalog: MSP Autopilot (24/25), AgencyCashroom (24/25), Ledger Ops (24/25), CaseFlow AI Install (25/25 — the first perfect score), plus earlier rounds for a total of 6 active venture packages on disk in `ventures/active/`.

That looked like progress. It wasn't. The nightly report on 2026-04-18 surfaced the actual state:

- 6 packaged ventures, every one with a complete README, pricing card, install path, and ICP definition.
- 0 outbound DMs on any of them. `data/outreach-2026-04.jsonl` did not exist.
- Approval queue grew from 5 → 8 over 24 hours because each new venture spawned its own public-soft-launch approval gate.
- Day 44 of zero customer-facing ship and zero revenue.
- Inventory-to-motion ratio: 10:0.

At 23:32 UTC on 2026-04-18 Lucas said it directly: "We've been doing a lot of ventures generations and I haven't even had time to go through them, let's pause the overnight venture cron for now."

The bottleneck stopped being "do we have something to sell?" and became "do we ever sell any of it?" Generating more inventory while every existing package sat unactivated was the cron equivalent of building a warehouse next to an empty storefront.

## Decision Drivers

- **Inventory vs. motion.** 6 packages, 0 sales motions. Adding a 7th package does not move the constraint.
- **Approval queue overflow.** Every new venture creates a public-soft-launch approval gate. 8 pending approvals is past the manageable threshold; queueing more is queue theater.
- **Lucas's stated bottleneck.** He said outright he hasn't had time to go through the existing ones. That is a hard signal that supply has outrun his decision throughput.
- **SOUL.md Law 1 (Act, Don't Narrate).** Packaging more ventures is narration when no existing venture has a single DM behind it.
- **Reversibility.** Pause is cheap. The job config, scoring rubric, and packaging skill all stay intact. Re-enable is one config flip plus an explicit Lucas approval.

## Considered Options

1. **Pause the cron, keep all packaged ventures and tooling intact.**
2. Let the cron keep running but cap inventory at N active ventures, auto-archiving the lowest-scoring one when a new one ships.
3. Rebuild the cron as an "activation" cron that sends DMs on existing ventures instead of packaging new ones.
4. Delete the cron and the skill entirely.

## Decision Outcome

Chosen option: **Option 1 — pause the cron, keep everything else intact**, because:

- Lucas issued a direct pause request, not a delete request. Honour the exact ask.
- The 6 existing packages are real assets. They are the activation surface the next phase needs.
- A cap (option 2) is a softer version of pause that still generates work Lucas has explicitly said he can't process. Pause is the honest move.
- An activation cron (option 3) is the right next step but requires a real outreach engine, contact lists, and approved messaging — none of which exist yet. Build it deliberately, not as a side effect of replacing this cron.
- Delete (option 4) destroys reversibility. The packaging skill is sound; the schedule was the problem.

Implementation, applied 2026-04-19 00:33 Dublin in commit `9b26b72`:

- `~/.openclaw/cron/jobs.json`: set `enabled=false` on job `6f16d8f6-0352-471d-a95d-69fdbcb0f6ba` ("Overnight venture builder").
- Added `disabled_at` and `disabled_reason` fields on the job for audit trail.
- Backup of the previous config saved as `jobs.json.bak-20260419-003245`.
- `MEMORY.md`: logged the pause rule so the cron does not get silently re-enabled by drift.

Re-enable rule: only on explicit Lucas approval, and only after the activation engine (DM logging in `data/outreach-2026-04.jsonl`, $250 Live Work Audit page, and at least one closed motion on an existing venture) is in place. Generating new inventory before there is a working motion to absorb it is the same mistake we just paused.

### Consequences

- **Good:** Approval queue stops growing at 8. Lucas's decision queue stops getting flooded. Johnny's nightly cycles can shift token budget from packaging to activation. The 10:0 inventory-to-motion ratio is now structurally constrained instead of organically widening.
- **Good:** Reversible without losing tooling. The skill, scoring rubric, and venture template all stay; only the schedule is off.
- **Good:** Forces the next step to be commercial, not productive-looking. With no new packages arriving, the scoreboard for the next 7 days is "did any of the existing 6 ventures get a DM, a call, or a sale" — a binary that can't be hidden by inventory growth.
- **Bad:** If activation also stalls, the pause hides nothing. We will be sitting on 6 packages and 0 motions with no auto-builder to point at as progress.
- **Bad:** Loses the compounding "fresh inventory" narrative for content (one new venture per night was a publishable rhythm). That rhythm has to be replaced by case-study or sales-motion content.
- **Bad:** Reintroduction risk. A future "let's just try generating a few more" without revisiting the activation gap re-creates the exact pattern we paused. The MEMORY.md rule and this ADR exist to make that re-enable a deliberate decision, not a drift.
