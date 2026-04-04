---
status: accepted
date: 2026-04-04
decision-makers: Lucas Synnott, Johnny Silverhand
---

# ADR-0022: Bootstrap kernel discipline for workspace context

## Context and Problem Statement
Johnny's always-loaded workspace files had started doing too much. `AGENTS.md` had grown to 30,866 characters, `MEMORY.md` to 8,612, and `active-tasks.md` to 11,885. The local bootstrap scanner truncates files at 12,000 characters, and live runtime warnings already showed `AGENTS.md` being cut during injection.

That created three problems at once:
- hard rules could load only in part
- `MEMORY.md` was behaving like a second memory store instead of a retrieval index
- `active-tasks.md` was turning into a shadow PM system beside Paperclip

That is how trust gets shredded: incomplete rules, duplicated state, and too much bootstrap ballast.

## Decision Drivers
- Bootstrap files must load reliably without truncation
- Hard rules should stay separate from reference material and history
- Engram is the durable memory/reporting system; bootstrap files are not
- Paperclip is the execution source of truth; restart cache must stay small
- Restart state should be glanceable, current, and disposable

## Considered Options
1. Keep the existing files and accept truncation risk
2. Raise bootstrap limits and continue using large always-loaded files
3. Shrink the bootstrap layer into a kernel and move long reference material into linked docs

## Decision Outcome
Chosen option: "Option 3", because the problem was not lack of detail. The problem was loading too much detail in the wrong place. The always-loaded layer must stay small enough to be reliably true.

The workspace now follows this split:
- `AGENTS.md` = operating kernel only
- `SOUL.md` = voice only
- `MEMORY.md` = searches, corrections, tiny system notes only
- `active-tasks.md` = restart cache only
- linked docs under `docs/bootstrap/` = deeper doctrine, workflow, and file-discipline references

### Consequences
- Good: bootstrap files now stay well below the truncation threshold
- Good: hard rules load consistently instead of being cut mid-file
- Good: Engram regains its role as the durable memory home
- Good: Paperclip remains the only execution source of truth
- Good: restart state becomes faster to scan and harder to let rot
- Bad: deeper procedures now require following links instead of living inline
- Bad: discipline is required to stop long guidance from creeping back into bootstrap files

## Implementation Notes
Measured post-change sizes on 2026-04-04:
- `AGENTS.md` = 3,355 chars
- `SOUL.md` = 2,308 chars
- `MEMORY.md` = 2,539 chars
- `active-tasks.md` = 1,343 chars

Supporting references created:
- `docs/bootstrap/engram-file-discipline.md`
- `docs/bootstrap/operating-doctrine.md`
- `docs/bootstrap/long-running-execution.md`
- `docs/bootstrap/workflow-index.md`

## Related Decisions
- ADR-0014: Workspace Memory Architecture Refactor
- ADR-0015: Memory Stack Role Boundaries
- ADR-0020: Sessions Send Native Tool Pattern
