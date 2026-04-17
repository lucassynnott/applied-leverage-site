---
status: accepted
date: 2026-04-17
decision-makers: Lucas Synnott, Johnny Silverhand
---

# ADR-0024: OpenClaw Cron Payload Shape Discipline

## Context and Problem Statement

OpenClaw cron jobs live in `~/.openclaw/cron/jobs.json` and wake scheduled agent sessions. The payload block has two practical shapes in circulation:

- `kind: agentTurn` with a concrete `message` string — what every working job in this workspace actually uses.
- `kind: systemEvent` with no `text` field — what looks tempting when a cron is "just a trigger" and the agent is supposed to decide what to do.

The second shape crashes the cron runner in roughly five milliseconds with `TypeError: Cannot read properties of undefined (reading 'trim')`. The runner calls `.trim()` on the payload text before dispatch, and a missing `text` means it blows up before any agent is even contacted. We hit this during the morning-edition cron setup on 2026-04-17: the job was "green" in the config file, "enabled" in state, and completely dead in practice. Nothing was logged beyond the type error.

That's a bad failure mode. The cron appears healthy because the config is syntactically valid, the runner "ran", and the consecutive-errors counter technically ticks — but no actual work happens, and the shape mismatch is invisible unless you read the runner stack trace.

## Decision Drivers

- **Observability:** a silent five-millisecond crash loop is worse than a visible error. Cron health must reflect real execution.
- **Consistency:** every working job in this workspace (Daily Discovery Post, ADR Writer, nightly deep dive, heartbeat) already uses `agentTurn` with `message`. Deviating has no upside.
- **Restart safety:** payload shape is not something a human should be inventing per-cron. One canonical shape means fewer novel failure modes across 30+ scheduled jobs.
- **Proof-or-it-didn't-happen:** per SOUL.md Law 2 ("Prove It"), a cron that claims done without producing output is vapor. The payload shape rule catches this at configuration time.

## Considered Options

1. **Ban `systemEvent` entirely for local scripts; mandate `agentTurn` + `message`.**
2. Leave both shapes in circulation and rely on the MEMORY.md corrections log to catch future hits.
3. Patch the cron runner to tolerate missing `text` on `systemEvent` payloads.

## Decision Outcome

Chosen: **Option 1 — mandate `agentTurn` with a concrete `message` field for every cron job in this workspace.**

Reasons:
- It matches what actually works. The working jobs are the reference pattern; deviation was never justified by any real need.
- Rule is file-enforceable. A new cron can be validated by reading `jobs.json` and checking the shape before it ever runs.
- Patching the runner to be tolerant would hide a real mistake. We want the shape wrong to mean cron wrong, not cron mystery.
- The corrections log in `MEMORY.md` already captured the rule on 2026-04-17; this ADR promotes it from tacit fix to durable architecture.

### Rule

When adding or editing a cron job in `~/.openclaw/cron/jobs.json`:

```json
"payload": {
  "kind": "agentTurn",
  "message": "<concrete instruction string the agent will execute>",
  "model": "<optional model override>",
  "timeoutSeconds": 600
}
```

- `kind` must be `"agentTurn"`.
- `message` must be a non-empty string, not null, not an object, not an array.
- Reference the existing `Applied Leverage nightly deep dive` or `Daily Discovery Post` job as the canonical shape — copy their structure before inventing a new one.
- Do not use `kind: "systemEvent"` for local script triggers. If a cron is a pure notification pulse with no work, it still needs a real `message` describing what the agent should check.

### Consequences

- **Good:** crons that pass config review actually execute. No more silent 5 ms crash loops. One canonical shape across the fleet.
- **Good:** MEMORY.md correction is backed by a real ADR, so the fix survives the next workspace context reset.
- **Bad:** loses the theoretical flexibility of `systemEvent`. If a future runtime upgrade gives `systemEvent` useful semantics, this ADR will need to be superseded explicitly rather than quietly bypassed.
- **Operational:** existing crons should be audited for shape compliance. Any job still carrying `kind: systemEvent` with no `text` is a latent failure waiting for its scheduled wake.

## Related

- `MEMORY.md` Corrections Log entry dated 2026-04-17.
- Working reference jobs: `Applied Leverage nightly deep dive`, `Daily Discovery Post`, `ADR Writer (on decision)`.
- Commit `9fabbb3` — "Log morning-edition cron payload shape rule".
