---
status: accepted
date: 2026-04-30
decision-makers: Lucas Synnott, Johnny Silverhand
---

# ADR-0028: Activation-Rail Debounce-Break and Stale-Approval Triggers

## Context and Problem Statement

The commercial-activation rail (`scripts/commercial-activation-check.sh`) is the seller-pressure signal that pings Lucas when business state goes wrong: no outreach today, approval backlog, stale soft-launches, etc. To prevent it from spamming Slack with the same trigger every five minutes, every trigger has a debounce window keyed on its last-fired timestamp.

That debounce was correct in spirit and broken in practice. Two failure modes showed up:

1. **UTC-day debounce drift.** Debounce was timestamp-based, not local-date-based. A trigger that fired at 23:50 Dublin would still be inside its debounce window when the next Dublin day started at 00:00. The Standing Reminder in `AGENTS.md` (the first non-debounced commercial-activation trigger of the day must produce an explicitly confirmed delivery) had no enforced way to fire because day rollover did not reliably reset anything.
2. **Quiet stale approvals.** Approvals that sat past 10 days, then past 30 days, were not their own trigger. They folded into the generic `approvals_backlog` count, which was debounced once per N hours regardless of how old the queue got. The 50-day-old `automation-audit-workbook-launch.md` was producing zero new pressure on Lucas, even though it was the single largest commercial bottleneck on the board.

The compounding effect was a rail that went silent at exactly the moments it needed to be loudest: end of day rollover, and weeks-old approvals.

## Decision Drivers

- **Standing Reminder in `AGENTS.md`.** "The first non-debounced commercial-activation trigger of the day must produce an explicitly confirmed delivery." That rule is unenforceable if "the day" is not defined in the system.
- **Approval queue is the binding constraint.** Today's heartbeat passes confirmed it explicitly: execution rails are clean (Paperclip 151 done / 0 blocked / 13 ready, plan-executor 2 ran / 3 skipped / 0 failed), but approvals are 10 deep with oldest at 50 days. The rail has to escalate the actual choke point, not the noisy one.
- **DND and debounce should not collude.** DND already silences low-priority pings. Combining DND with a sloppy debounce means real signals get eaten twice. Debounce must yield once per Dublin local day for un-debounced delivery.
- **SOUL.md Law 4 (Stay Ahead).** A seller-pressure rail that goes quiet at the moment a 50-day approval is sitting unloved is not staying ahead. It is decoration.

## Considered Options

1. **Debounce on Dublin local date + add `approvals_stale_over_10d` and `approvals_stale_over_30d` as their own triggers.**
2. Drop the debounce entirely and let the rail spam.
3. Replace timestamp-based debounce with a count-based debounce ("max N fires per trigger per day").
4. Move stale-approval escalation into a separate cron, leave the activation rail alone.

## Decision Outcome

Chosen option: **Option 1 — Dublin-local-date debounce key + first-class stale-approval triggers**, because:

- It directly satisfies the `AGENTS.md` Standing Reminder by making "the day" a real boundary the script enforces.
- It promotes the actual bottleneck (50-day approvals) to its own escalation channel instead of letting it dissolve into a generic backlog count.
- It does not break the original purpose of debounce: rapid repeat fires inside the same Dublin day still get suppressed; the rail does not become spam.
- Option 2 (no debounce) is the spam regression we already lived through.
- Option 3 (count-based debounce) still leaves the local-date boundary undefined, which is the real bug.
- Option 4 (separate cron) fragments the rail. One seller-pressure script with a clear list of named triggers is easier to reason about than two crons that overlap.

Implementation, applied 2026-04-30 00:46 Dublin:

- `scripts/commercial-activation-check.sh`: debounce key is now Dublin local date, not last-fired UTC timestamp. The first occurrence of each trigger per Dublin day fires un-debounced; subsequent same-day fires of the same trigger are suppressed as before.
- Added two new named triggers:
  - `approvals_stale_over_10d`: any pending approval whose age exceeds 10 days.
  - `approvals_stale_over_30d`: any pending approval whose age exceeds 30 days.
- Verified with a cold run on 2026-04-30: `no_outreach_today`, `approvals_backlog`, and `approvals_stale_over_30d` all fired cleanly as the first un-debounced fires of the day. Subsequent same-day repeats were correctly debounced.
- Evidence: `data/commercial-activation.jsonl` shows the 00:26 Dublin entries as the real non-debounced 2026-04-30 escalations; everything after is correctly suppressed.

### Consequences

- **Good:** The Standing Reminder is now enforceable in code, not just in prose. Day rollover reliably gives the rail one chance to escalate per Dublin day per trigger.
- **Good:** Stale approvals stop being invisible. A 50-day soft-launch sitting unloved now produces its own named trigger every Dublin day until it is decided.
- **Good:** Trigger naming gets sharper. `approvals_stale_over_30d` is louder and more specific than a generic backlog count, which makes downstream summaries and Slack pings easier to read.
- **Good:** Reversible. Debounce key is a single function in one script. Rolling back to UTC-timestamp debounce is a one-line change.
- **Bad:** Increases base-line escalation volume on days where multiple stale-approval thresholds are crossed. With 10 pending and several over 30 days, Lucas now sees more named triggers per day, not fewer. That is the point, but it does spend attention.
- **Bad:** Local-date logic depends on Dublin being the canonical timezone. If the operator ever moves or the server clock drifts, the boundary moves with it. Mitigated by hard-coding `Europe/Dublin` in the script rather than reading `$TZ`.
- **Bad:** Does not fix the underlying problem on its own. Louder rails do not approve queued items. The activation engine still depends on Lucas processing the queue once the rail surfaces it.
