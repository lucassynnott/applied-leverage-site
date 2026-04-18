---
status: accepted
date: 2026-04-18
decision-makers: Lucas Synnott, Johnny Silverhand
---

# ADR-0026: Treat FS-Flicker as Runtime Sandbox Noise, Not Filesystem Failure

## Context and Problem Statement

Starting 2026-04-17 and intensifying through 2026-04-18, Johnny's heartbeat (heartbeat) and various script invocations began hitting intermittent `ENOENT` / "No such file or directory" errors on files that clearly existed on disk. The pattern hit scripts (`scripts/paperclip-sync.sh`, `scripts/execution-supervisor.sh`), JSON state files, and plain memory-log files. It would fail on the first read, then succeed 2–8 seconds later without any filesystem change.

The natural first instinct was "the NAS mount is flaky" or "ext4 is corrupting inode lookups." Both are wrong.

On 2026-04-18 13:42 UTC the diagnosis landed: the filesystem is fine. Verified via:

- `tune2fs` / `dumpe2fs`: plain ext4, no corruption flags, journal healthy.
- `stat` on impacted inodes: intact, consistent mtime/ctime.
- `free -m`: 4 GiB+ RAM free, no dentry-cache pressure.
- Reproducibility: same path can return `ENOENT` then exist within the same shell session within seconds, with no mount change.

The flicker lives at the **runtime sandbox layer** — the path-lookup cache between the tool runner and the host filesystem occasionally serves stale `ENOENT` on the first lookup per tool invocation. This is not something Johnny can fix from inside the sandbox, and attempts to fix it with aggressive retry loops inside Python heredocs made things worse: on 2026-04-18 12:46 UTC a retry loop wedged on an uninterruptible kernel `stat` call, the runner became unkillable, and only `SIGKILL` after ~5 minutes wall-clock cleared it.

## Decision Drivers

- **Correctness:** treating a transient `ENOENT` as ground truth leads to real corruption (overwriting good files with empty JSON because the read "failed"). Happened 2026-04-17, root-caused, logged in MEMORY.md.
- **Liveness:** unbounded retry loops inside long-running Python processes can deadlock when the underlying kernel call is uninterruptible. Retry policy must be bounded in wall-clock, not iteration count.
- **Sandbox constraints:** Johnny cannot patch the runner or the sandbox layer. The only available lever is tool-level discipline: how shells invoke files, how many times, in what patterns.
- **Blast radius asymmetry:** losing a log line is trivial (re-append next beat). Losing a JSON state file means corrupted heartbeat tracking for hours. The retry policy must reflect that asymmetry.
- **Observability:** calling this "FS flicker" and logging it per beat is fine — but the cause must be named correctly in durable docs so no future agent spends a night debugging the kernel when the kernel is innocent.

## Considered Options

1. **Name the runtime cause, keep treatment local and tool-shaped.** Accept that the first path lookup per tool call can be stale. Codify tool-level patterns (retry-once for reads, bounded retry-then-atomic-replace for writes). Do not escalate to filesystem diagnosis on flicker events.
2. Keep debugging the filesystem on every occurrence.
3. Abandon any read that `ENOENT`s on first try and treat the file as missing.

## Decision Outcome

Chosen option: **Option 1 — name the cause and codify tool-level discipline**, because:

- Options 2 and 3 are both wrong. Option 2 wastes beat time on a non-problem. Option 3 causes real data loss.
- The sandbox layer is the true source of the noise, and Johnny has no patch authority there. Discipline at the tool boundary is the only durable lever.
- The cost of the agreed-on rules is small and tightly scoped: retry-once for shell reads, bounded retry-then-atomic-replace for JSON state writes, plain `echo >>` for log appends. No new dependencies, no long-lived Python processes holding FS handles.

### Operational Rules

**Codified in MEMORY.md (2026-04-17 and 2026-04-18 entries):**

- **Script path lookup:** if `scripts/<name>.sh` returns "No such file or directory" on first call, retry up to 5 times with 2 s sleep before declaring failure.
- **State file reads (JSON):** try once; one short retry; if second read fails, abort and skip the write — never overwrite with empty/invalid data.
- **State file writes:** write to `<path>.tmp`, then `Path.replace()` atomically. Never stream partial content into the real file.
- **Log / memory file appends:** plain `echo >> FILE`. No retry loops, no Python heredoc wrappers — lines are trivially re-addable, not worth a fragile retry layer.
- **Never** pipe `$(cat FILE)` through a heredoc into Python on this FS. `cat` can miss, Python silently gets empty stdin, the next write truncates the file.
- **Never** wrap `Path.read_text()` in a long retry loop inside a long-lived Python process. Kernel `stat` can block uninterruptibly; single try + one short retry + proceed-without-value is the safe shape.
- **Bounded wall-clock:** any retry policy touching the flaky FS must terminate in <10 seconds total. No iteration-count-only loops.
- **Report as noise, not incident:** single `ENOENT` on a known-good workspace file is runtime noise. One retry via a fresh tool call → if that works, log as "FS flicker, recovered" and move on. Do not spawn diagnostic sessions.

### Consequences

**Good:**

- Johnny stops burning beats on kernel-level filesystem investigations that lead nowhere.
- The 2026-04-17 data-loss class (empty-JSON overwrite) is structurally closed off by read-then-validate-then-atomic-replace.
- Retry policy is bounded, so the 2026-04-18 12:46 UTC hang class (uninterruptible kernel stat) cannot recur from Johnny's own code.
- Log noise gets correctly categorized as noise, which keeps the real incident bar meaningful.

**Bad:**

- Accepting a known runtime-layer bug as a permanent input to the operational model. If the sandbox is ever patched, these rules are slightly over-conservative but harmless.
- Discipline cost on every new script that touches workspace files: must follow the read/write patterns above, not invent its own retry strategy.
- No fix to the underlying sandbox — the flicker stays, the blast radius just stops mattering.

**Operational rule:** FS-flicker on workspace paths is runtime-layer noise. Retry once via a fresh tool call, proceed if it lands, abort if it doesn't. Do not diagnose ext4/NAS/kernel on flicker events unless the pattern changes shape (new error text, new paths affected, sustained multi-minute outages).