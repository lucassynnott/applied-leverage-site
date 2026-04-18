---
status: accepted
date: 2026-04-18
decision-makers: Lucas Synnott, Johnny Silverhand
---

# ADR-0025: Retire the R&D Council (moltron-roundtable)

## Context and Problem Statement

The R&D Council was a multi-agent deliberation skill (`moltron-roundtable`) that convened a fixed set of internal personas — Provocateur (Alt), Operator (Viktor), Skeptic (Goro), Customer (Dan Koe), Strategist (main) — to debate strategic decisions and produce memo artifacts. It ran on recurring crons (morning and evening) and fed memos back into the Engram vault and session history.

On paper it looked like a decision engine. In practice, across ~48 logged sessions, the output pattern was consistent:

- Every session independently converged on roughly the same fix (outreach + a small paid offer).
- The strategic memos got progressively less specific while consuming the same token budget per run.
- A whole category of failure was council-specific: false `PARTIAL` reporting due to a `find -newer` marker race in `run-council.sh` (fixed 2026-04-17 in commit `7564121`, 20 runs retroactively cleaned).
- The council was being used as a substitute for Lucas making a call or Johnny shipping a concrete artifact — a strategy loop, not a forcing function.

On 2026-04-18 Lucas ended the experiment directly: delete the skill, kill the drone, do not schedule it again.

## Decision Drivers

- **Signal-to-token ratio:** a deliberation engine that outputs the same conclusion with diminishing specificity is a tax, not leverage.
- **SOUL.md Law 1 (Act, Don't Narrate):** strategic roundtables are narration by committee. Multi-agent memos about "what we should do" are not action.
- **Operational surface area:** one more skill with its own cron, state file, memo directory, archival path, and bug class (`find -newer` marker races, `tee` exit-code swallowing) that must be maintained.
- **Explicit user decision:** Lucas made a clear call to retire it permanently. Reintroducing it without a new explicit request would be a direct violation of stated preference.
- **Replacement already exists:** sessions #47 + #48 converged on a concrete plan (10 warm DMs + one $250 Live Work Audit) that Johnny can execute without another deliberation layer.

## Considered Options

1. **Retire permanently and remove all scheduling, references, and reinstall paths.**
2. Keep the skill archived but allow ad-hoc manual invocation for "big" decisions.
3. Rewrite the council as a cheaper, faster, single-pass prompt instead of a multi-agent spawn.

## Decision Outcome

Chosen option: **Option 1 — retire permanently**, because:

- Lucas issued an explicit "delete and kill" instruction. That is a stronger input than any architectural preference.
- Options 2 and 3 both leave a revival path open, which adds maintenance drift and invites the same strategy-loop failure mode to return under a new name.
- The operational work the council was notionally serving is better handled by (a) one human decision-maker (Lucas) making a call, or (b) one action-oriented skill (outreach, offer page, proof artifact) shipping a real artifact.

### Consequences

**Good:**

- `~/.openclaw/cron/jobs.json` loses two recurring jobs (morning + evening council), freeing scheduling slots and reducing recurring token spend.
- `MEMORY.md` gets a durable "do not reintroduce" rule dated 2026-04-18 so no future cron prompt or agent resurrects it accidentally.
- `data/council-last-run.json` removed; `HEARTBEAT.md` updated so heartbeats no longer reference council staleness.
- Skill archived to `.archive/moltron-roundtable-20260418-120752/` — history preserved, not deleted, in case the reasoning needs to be revisited.
- Forcing function shifts to direct action: outreach, offers, proof artifacts, approvals.

**Bad:**

- Loss of whatever genuine novelty the council occasionally produced (honestly, infrequent enough that it's mostly a theoretical cost).
- `run-council.sh` bug fix (commit `7564121`) becomes orphan code; can be deleted when the surrounding scripts are cleaned up, but not urgent.
- One less "the system is thinking about it" surface to point at. That's fine — narration isn't the goal.

**Operational rule:** R&D Council is permanently retired. Do not run, reschedule, reinstall, reference, or reintroduce it in any form unless Lucas explicitly brings it back.
